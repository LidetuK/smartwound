import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";
import os from "os";
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { Groq } from "groq-sdk";

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
  burn: ["burn", "scald", "blister", "bulla"],
  scrape: ["scrape", "abrasion", "graze", "scratch", "scratches"],
  cut: ["cut", "laceration", "incision", "gash", "wound", "cuts"], // 'wound' is generic but often used for cuts
  ulcer: ["ulcer", "sore", "lesion"],
  bruise: ["bruise", "contusion", "hematoma", "purple", "blue"],
  puncture: ["puncture", "stab", "hole"],
  scar: ["scar", "scarring"],
};

// Enhanced contextual analysis for better wound type detection
const analyzeWoundContext = (labels) => {
  const labelNames = labels.map(l => l.description.toLowerCase());
  const scores = labels.map(l => l.score);
  
  // Look for combinations that suggest specific wound types
  const hasRed = labelNames.some(name => name.includes('red'));
  const hasSkin = labelNames.some(name => name.includes('skin') || name.includes('flesh'));
  const hasArm = labelNames.some(name => name.includes('arm') || name.includes('hand') || name.includes('finger'));
  const hasLeg = labelNames.some(name => name.includes('leg') || name.includes('foot') || name.includes('ankle'));
  const hasScar = labelNames.some(name => name.includes('scar'));
  
  // If we see red + skin/flesh + body part, likely a fresh cut or scrape
  if (hasRed && (hasSkin || hasArm || hasLeg) && !hasScar) {
    // Look for linear patterns that suggest cuts vs broader patterns for scrapes
    const hasLinear = labelNames.some(name => 
      name.includes('line') || name.includes('mark') || name.includes('scratch')
    );
    return hasLinear ? 'cut' : 'scrape';
  }
  
  // If scar is detected with high confidence, it's likely an old wound
  if (hasScar) {
    return 'scar';
  }
  
  return null;
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
  console.log('Vision analyze request:', req.body);
  const { method = 'groq', imageUrl } = req.body;
  console.log('Selected method:', method);

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required.' });
  }

  if (method === 'chatgpt') {
    try {
      // Download image to base64
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `You are a wound care assistant. Carefully analyze the image and:
- Give a detailed, specific description of what you see (mention color, shape, size, location, and any visible features).
- Suggest a possible wound type (cut, scrape, burn, blister, ulcer, bruise, puncture, scar, or other—be creative and specific if possible).
- Estimate severity (minor, moderate, severe).
- If you are not sure, say 'uncertain' and explain why.
Respond in JSON: { "description": ..., "wound_type": ..., "severity": ... }.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ] }
        ],
        max_tokens: 400
      });
      const text = completion.choices[0].message.content;
      console.log('[ChatGPT Vision] Raw response:', text);
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { description: "unknown", wound_type: "unknown", severity: "unknown", raw: text };
      }
      res.json({ ...result, raw_ai: text });
    } catch (error) {
      console.error('OpenAI Vision API Error:', error);
      res.status(500).json({ error: 'Failed to analyze image with ChatGPT Vision.', details: error.message });
    }
    return;
  }

  if (method === 'groq') {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `You are a medical wound analysis expert. Look at this image and identify ONLY wounds, injuries, or medical conditions - ignore body parts.\n\nFocus on:\n- RED/DARK MARKS = cuts, scratches, scrapes\n- LINEAR PATTERNS = scratches or cuts\n- ABRADED SKIN = scrapes or abrasions\n- SWELLING/BRUISING = bruises or contusions\n- OPEN WOUNDS = cuts, lacerations\n- HEALING MARKS = scars\n\nFor the image, identify:\n1. **wound_type**: The specific injury type (scratch, cut, scrape, bruise, burn, puncture, scar, abrasion)\n2. **description**: What the wound looks like ("Multiple parallel scratches on forearm", "Deep cut on palm", etc.)\n3. **severity**: minor, moderate, or severe\n4. **characteristics**: Linear, parallel, fresh, healing, deep, superficial, etc.\n\nIGNORE: finger, hand, arm, wrist, ankle - focus ONLY on the actual wound/injury visible.\n\nRespond ONLY in the following format:\n{\n  "wound_type": "specific_wound_type\",\n  "severity": "minor|moderate|severe\",\n  "description": "Detailed medical description\",\n  "characteristics": "Specific visual characteristics"\n}\n\nThen, provide a concise summary in plain English, describing the wound type, severity, and characteristics as you would to a patient. Example: 'A scratch is a superficial wound that appears as a linear mark or groove on the skin, often with a red or pink color... Characteristics: Linear, parallel, fresh, superficial.'`;
      console.log('[Groq Vision] Sending request to Groq API');
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "user", content: prompt },
          { role: "user", content: imageUrl }
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 500,
        temperature: 0.1
      });
      const text = completion.choices[0].message.content;
      console.log('[Groq Vision] Raw response:', text);
      let result, summary = '';
      try {
        // Try to parse as direct JSON first
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          summary = text.replace(jsonMatch[0], '').trim().replace(/^Summary:?/i, '').trim();
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // If all parsing fails, create structured response
        console.log('[Groq Vision] JSON parsing failed, creating structured response');
        result = {
          wound_type: "unknown",
          description: text,
          severity: "unknown",
          characteristics: "Raw response"
        };
        summary = text;
      }
      // If summary is missing, build it from fields
      if (!summary) {
        summary = `${result.wound_type ? result.wound_type.charAt(0).toUpperCase() + result.wound_type.slice(1) : 'Wound'}: ${result.description || ''} Characteristics: ${result.characteristics || ''}`;
      }
      // Ensure we have the expected fields
      const finalResult = {
        wound_type: result.wound_type || "unknown",
        description: result.description || text,
        severity: result.severity || "unknown",
        characteristics: result.characteristics || "Not specified",
        summary,
        raw_ai: text
      };
      console.log('[Groq Vision] Final result:', finalResult);
      res.json(finalResult);
    } catch (error) {
      console.error('Groq Vision API Error:', error);
      res.status(500).json({ error: 'Failed to analyze image with Groq Vision.', details: error.message });
    }
    return;
  }

  if (!client) {
    return res.status(500).json({
      message:
        "Google Vision API client is not initialized. Please check server logs for details, and ensure the gcloud-credentials.json file is in the 'backend' directory.",
    });
  }

  try {
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
    
    // Use enhanced wound detection logic
    const woundAnalysis = mapLabelToWoundType(labels || []);
    const contextualType = analyzeWoundContext(labels || []);
    
    // If contextual analysis found a type, use it; otherwise use mapping result
    const finalType = contextualType || woundAnalysis.type;
    const finalSeverity = woundAnalysis.severity;
    
    console.log(`[VisionAPI] Final analysis - Type: ${finalType}, Severity: ${finalSeverity}`);
    
    res.json({
      description: finalType,
      wound_type: finalType,
      severity: finalSeverity,
      confidence: labels && labels.length > 0 ? labels[0].score : 0,
      all_labels: labels || [],
      raw_ai: labels
    });

  } catch (error) {
    console.error('Google Vision API Error:', error);
    if (error.code === 'ENOENT') {
        return res.status(500).json({ error: 'Google Cloud credentials file not found. Please ensure gcloud-credentials.json is in the backend directory.' });
    }
    res.status(500).json({ error: 'Failed to analyze image with Google Vision.', details: error.message });
  }
}; 