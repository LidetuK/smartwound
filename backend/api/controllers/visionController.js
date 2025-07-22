import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

// A simple mapping from Google Vision labels to our app's wound types
const mapLabelToWoundType = (labels) => {
  const labelNames = labels.map(label => label.description.toLowerCase());
  
  if (labelNames.some(name => name.includes('burn'))) return { type: 'burn', severity: 'moderate' };
  if (labelNames.some(name => name.includes('scrape') || name.includes('abrasion'))) return { type: 'scrape', severity: 'minor' };
  if (labelNames.some(name => name.includes('cut') || name.includes('laceration'))) return { type: 'cut', severity: 'moderate' };
  if (labelNames.some(name => name.includes('ulcer'))) return { type: 'ulcer', severity: 'severe' };
  if (labelNames.some(name => name.includes('blister'))) return { type: 'blister', severity: 'minor' };
  
  // Default if no specific type is found
  return { type: 'unknown', severity: 'unknown' };
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

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required.' });
    }

    // Performs label detection on the image file
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations;

    if (!labels || labels.length === 0) {
      return res.status(404).json({ error: 'Could not analyze image or no labels found.' });
    }
    
    const analysis = mapLabelToWoundType(labels);
    
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
    res.status(500).json({ error: 'Failed to analyze image with Google Vision.' });
  }
}; 