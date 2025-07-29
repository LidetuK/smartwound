"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api";
import Button from "@/components/Button";
import Link from "next/link";

// Define a list of common wound types for the dropdown
const woundTypes = ["cut", "scrape", "burn", "blister", "ulcer", "bruise", "puncture", "scar", "unknown"];
const severityTypes = ["minor", "moderate", "severe", "unknown"];

type AIMethod = 'groq' | 'google' | 'chatgpt';

export default function NewWoundPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ type?: string; wound_type?: string; severity: string, raw_labels?: string[], description?: string, confidence?: number, method?: string, summary?: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"upload" | "analyze" | "confirm">("upload"); // upload, analyze, confirm
  const [isEditing, setIsEditing] = useState(false); // separate editing state
  const [woundType, setWoundType] = useState("unknown");
  const [severity, setSeverity] = useState("unknown");
  const [aiMethod, setAiMethod] = useState<AIMethod>('groq'); // Default to Groq

  useEffect(() => {
    // This is the correct way to handle redirects to prevent render-time errors.
    if (!isAuthLoading && !token) {
      router.push('/login');
    }
  }, [isAuthLoading, token, router]);

  // Map wound types from backend response to frontend format
  const mapWoundType = (type: string) => {
    const mapping: Record<string, string> = {
      'scratches': 'scratch',
      'cuts': 'cut',
      'scrapes': 'scrape',
      'burns': 'burn',
      'blisters': 'blister',
      'ulcers': 'ulcer',
      'bruises': 'bruise',
      'punctures': 'puncture',
      'scars': 'scar'
    };
    return mapping[type.toLowerCase()] || type.toLowerCase();
  };

  // When analysis is set, update woundType and severity defaults
  useEffect(() => {
    if (analysis) {
      const rawType = analysis.wound_type || analysis.type || "unknown";
      setWoundType(mapWoundType(rawType));
      setSeverity(analysis.severity || "unknown");
    }
  }, [analysis]);

  if (isAuthLoading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!imageFile) {
      toast.error("Please select an image first.");
      return;
    }
    setIsLoading(true);
    setCurrentStep("analyze");

    // 1. Upload image to get URL
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const uploadResponse = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newImageUrl = uploadResponse.data.url;
      setImageUrl(newImageUrl);

      // 2. Analyze image using the selected AI method
      toast.success("Image uploaded! Analyzing...");
      const visionResponse = await apiClient.post("/vision/analyze", {
        imageUrl: newImageUrl,
        method: aiMethod,
      });
      setAnalysis(visionResponse.data);
      setCurrentStep("confirm");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload or analyze the image. Please try again.");
      setCurrentStep("upload");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummaryForWoundType = (type: string, sev: string) => {
    const summaries: Record<string, string> = {
      cut: `A cut is a wound caused by a sharp object that creates an opening in the skin. It typically has clean, straight edges and may bleed depending on depth. Characteristics: Linear, clean edges, ${sev} severity.`,
      scrape: `A scrape (abrasion) is a superficial wound where the skin is rubbed or scraped against a rough surface. The top layer of skin is removed, often appearing red and raw. Characteristics: Rough surface, superficial, ${sev} severity.`,
      scratch: `A scratch is a superficial wound that appears as a linear mark or groove on the skin, often with a red or pink color. It is typically shallow and may have a slight elevation or ridge in the center. Characteristics: Linear, parallel, fresh, superficial, ${sev} severity.`,
      burn: `A burn is an injury to skin or tissue caused by heat, chemicals, electricity, or radiation. The affected area may appear red, swollen, or blistered depending on severity. Characteristics: Heat damage, potential blistering, ${sev} severity.`,
      blister: `A blister is a small pocket of fluid that forms in the upper layers of skin, usually caused by friction, burns, or other damage. It appears as a raised bump filled with clear fluid. Characteristics: Fluid-filled, raised, protective, ${sev} severity.`,
      ulcer: `An ulcer is an open sore that develops when skin breaks down, often due to pressure, poor circulation, or infection. It may appear as a crater-like wound with defined edges. Characteristics: Open sore, crater-like, ${sev} severity.`,
      bruise: `A bruise (contusion) is an injury that causes bleeding under the skin without breaking the surface. It typically appears as a discolored area that changes from red to purple to yellow as it heals. Characteristics: Discolored, under-skin bleeding, ${sev} severity.`,
      puncture: `A puncture wound is a deep, narrow wound caused by a sharp, pointed object. It may appear small on the surface but can be deep and potentially dangerous. Characteristics: Small opening, deep penetration, ${sev} severity.`,
      scar: `A scar is permanent fibrous tissue that replaces normal skin after an injury has healed. It may appear raised, flat, or depressed compared to surrounding skin. Characteristics: Permanent, fibrous tissue, healed wound, ${sev} impact.`,
      unknown: `The wound type could not be definitively identified from the analysis. Further examination may be needed to determine the exact nature and appropriate treatment. Characteristics: Unidentified, requires assessment, ${sev} severity.`
    };
    return summaries[type] || summaries.unknown;
  };

  const handleSaveChanges = () => {
    console.log('Saving changes - woundType:', woundType, 'severity:', severity);
    if (analysis) {
      const newSummary = generateSummaryForWoundType(woundType, severity);
      setAnalysis({
        ...analysis,
        summary: newSummary,
        wound_type: woundType, // Update the analysis object too
        severity: severity
      });
    }
    setIsEditing(false);
  };

  const handleSaveWound = async () => {
    if (!imageUrl || !analysis) {
      toast.error("Cannot save without an analyzed image.");
      return;
    }
    setIsLoading(true);

    try {
      await apiClient.post("/wounds", {
        type: woundType,
        severity: severity,
        image_url: imageUrl,
        status: "open", // Default status
        notes: notes,
      });
      toast.success("Wound saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save the wound. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-8">
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </nav>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">
            Add a New Wound
          </h1>

          {/* Step 1: Upload Image */}
          {currentStep === "upload" && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Upload Wound Image</h2>
              
              {/* AI Method Selection */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Choose AI Analysis Method
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAiMethod('groq')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      aiMethod === 'groq'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Groq Vision
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiMethod('google')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      aiMethod === 'google'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Google Vision
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiMethod('chatgpt')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      aiMethod === 'chatgpt'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ChatGPT
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {aiMethod === 'groq' && 'Groq Vision provides specialized medical wound analysis'}
                  {aiMethod === 'google' && 'Google Vision provides general object and label detection'}
                  {aiMethod === 'chatgpt' && 'ChatGPT provides detailed image analysis (coming soon)'}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">
                  Select wound image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              {imageFile && (
                <div className="mb-4">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Selected wound"
                    className="h-48 w-auto rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="mt-6">
                <Button onClick={handleUploadAndAnalyze} disabled={!imageFile || isLoading}>
                  {isLoading ? "Uploading..." : `Upload and Analyze with ${aiMethod === 'groq' ? 'Groq Vision' : aiMethod === 'google' ? 'Google Vision' : 'ChatGPT'}`}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Analysis & Confirmation */}
          {currentStep === "analyze" && (
            <div className="text-center">
                <p className="text-lg">Analyzing your image with {aiMethod === 'groq' ? 'Groq Vision' : aiMethod === 'google' ? 'Google Vision' : 'ChatGPT'}...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
            </div>
          )}

          {currentStep === "confirm" && analysis && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Analysis Results</h2>
              
              {/* Green card design matching the screenshot */}
              <div key={`${woundType}-${severity}`} className="mb-6 rounded-lg bg-green-50 border border-green-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Wound Type:</p>
                        <p className="text-lg font-semibold text-green-800">{woundType.charAt(0).toUpperCase() + woundType.slice(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Severity:</p>
                        <p className="text-lg font-semibold text-green-800">{severity.charAt(0).toUpperCase() + severity.slice(1)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    ✏️ {isEditing ? 'View Results' : 'Edit Results'}
                  </button>
                </div>
                
                {analysis.summary && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700 mb-2">Summary:</h3>
                    <p className="text-sm text-green-800 leading-relaxed">{analysis.summary}</p>
                  </div>
                )}
              </div>

              {/* Edit form that shows when Edit Results is clicked */}
              {isEditing && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Wound Type</p>
                        <select
                          value={woundType}
                          onChange={(e) => setWoundType(e.target.value)}
                          className="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                          {woundTypes.map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Severity</p>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value)}
                          className="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                          {severityTypes.map(sev => (
                            <option key={sev} value={sev}>
                              {sev.charAt(0).toUpperCase() + sev.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  {analysis.raw_labels && analysis.raw_labels.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-500">AI Labels:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.raw_labels.map((label, index) => (
                              <span key={index} className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                  {label}
                              </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
                    Add any notes (optional)
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., 'Happened while gardening. Cleaned with antiseptic.'"
                />
              </div>

              <div className="mt-6">
                <Button onClick={handleSaveWound} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Wound to Tracker"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 