import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for the credentials file in the 'backend' root directory.
const keyFilename = path.join(__dirname, "..", "..", "gcloud-credentials.json");

let client;

// Safely initialize the client to prevent startup crashes.
try {
  if (fs.existsSync(keyFilename)) {
    client = new ImageAnnotatorClient({ keyFilename });
    console.log("[VisionAPI] Google Vision client initialized successfully.");
  } else {
    console.warn(`[VisionAPI] credentials file not found at: ${keyFilename}`);
    console.warn(
      "[VisionAPI] The image analysis feature will not work without credentials."
    );
  }
} catch (error) {
  console.error("[VisionAPI] Failed to initialize Google Vision client:", error);
  client = null; // Ensure client is null if initialization fails
}

// A more robust mapping from Google Vision labels to our app's wound types
const woundTypeMapping = {
  burn: ["burn", "scald"],
  scrape: ["scrape", "abrasion", "graze", "scratch"],
  cut: ["cut", "laceration", "incision", "gash", "wound"], // 'wound' is generic but often used for cuts
  ulcer: ["ulcer", "sore", "lesion"],
  blister: ["blister", "bulla"],
  bruise: ["bruise", "contusion", "hematoma"],
  puncture: ["puncture", "stab"],
  scar: ["scar"], // Added scar to the mapping
};

const mapLabelToWoundType = (labels) => {
  // 1. Filter for high-confidence labels first
  const highConfidenceLabels = labels.filter(label => label.score > 0.75);
  console.log("[VisionAPI] High-confidence labels (score > 0.75):", highConfidenceLabels.map(l => ({d: l.description, s: l.score})));

  // If no high-confidence labels, we can't make a good guess
  if (highConfidenceLabels.length === 0) {
    console.log("[VisionAPI] No high-confidence labels found. Defaulting to unknown.");
    return { type: "unknown", severity: "unknown" };
  }

  const labelNames = highConfidenceLabels.map((label) => label.description.toLowerCase());
  console.log("[VisionAPI] Analyzing lowercased high-confidence labels:", labelNames);

  // 2. Prioritized check on the filtered list
  for (const [type, keywords] of Object.entries(woundTypeMapping)) {
    if (labelNames.some((name) => keywords.some((kw) => name.includes(kw)))) {
      // A simple severity guess based on type
      let severity = "minor";
      if (type === "burn" || type === "cut" || type === "puncture") {
        severity = "moderate";
      }
      if (type === "ulcer") {
        severity = "severe";
      }
      console.log(`[VisionAPI] Mapped to type: ${type}`);
      return { type, severity };
    }
  }

  console.log("[VisionAPI] No specific wound type found in high-confidence labels. Defaulting to unknown.");
  return { type: "unknown", severity: "unknown" };
};

export const analyzeImage = async (req, res) => {
  if (!client) {
    return res.status(500).json({
      message:
        "Google Vision API client is not initialized. Please check server logs for details, and ensure the gcloud-credentials.json file is in the 'backend' directory.",
    });
  }

  try {
    const { imageUrl } = req.body;
    console.log('[VisionAPI] Received request to analyze imageUrl:', imageUrl);

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required.' });
    }

    let imagePath = null;
    let tempFile = false;

    // If imageUrl is a remote URL (e.g., Cloudinary), download it to a temp file
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const tempDir = os.tmpdir();
      const tempFilename = `vision-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
      imagePath = path.join(tempDir, tempFilename);
      tempFile = true;
      console.log('[VisionAPI] Downloading remote image to:', imagePath);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, response.data);
    } else {
      // Local file path (legacy/local dev)
      imagePath = path.join(process.cwd(), 'uploads', path.basename(imageUrl));
      tempFile = false;
    }
    console.log('[VisionAPI] Using image path:', imagePath);

    // Check if the file exists before attempting to analyze
    if (!fs.existsSync(imagePath)) {
      console.error(`[VisionAPI] File not found at path: ${imagePath}`);
      return res.status(404).json({ error: `File not found at: ${imagePath}. Ensure the file was uploaded correctly.` });
    }

    // Performs label detection on the image file
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations;

    console.log('[VisionAPI] Raw labels received from Google:', JSON.stringify(labels, null, 2));

    // Clean up temp file if needed
    if (tempFile && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('[VisionAPI] Deleted temp file:', imagePath);
    }
    
    const analysis = mapLabelToWoundType(labels || []);
    
    console.log('[VisionAPI] Analysis result:', analysis);
    
    res.json({
      ...analysis,
      confidence: labels[0].score, // Use the score of the top label as a general confidence score
      raw_labels: labels.map(label => label.description),
    });

  } catch (error) {
    console.error('Google Vision API Error:', error);
    if (error.code === 'ENOENT') {
        return res.status(500).json({ error: 'Google Cloud credentials file not found. Please ensure gcloud-credentials.json is in the backend directory.' });
    }
    res.status(500).json({ error: 'Failed to analyze image with Google Vision.', details: error.message });
  }
}; 