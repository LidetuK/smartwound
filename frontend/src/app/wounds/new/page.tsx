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

export default function NewWoundPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ type: string; severity: string, raw_labels?: string[] } | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("upload"); // upload, analyze, confirm
  const [woundType, setWoundType] = useState("unknown");
  const [severity, setSeverity] = useState("unknown");

  useEffect(() => {
    // This is the correct way to handle redirects to prevent render-time errors.
    if (!isAuthLoading && !token) {
      router.push('/login');
    }
  }, [isAuthLoading, token, router]);

  // When analysis is set, update woundType and severity defaults
  useEffect(() => {
    if (analysis) {
      setWoundType(analysis.type || "unknown");
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

      // 2. Analyze image using the new URL
      toast.success("Image uploaded! Analyzing...");
      const visionResponse = await apiClient.post("/vision/analyze", {
        imageUrl: newImageUrl,
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

          {/* Step 1: Upload */}
          {currentStep === "upload" && (
            <div>
              <label htmlFor="wound-image" className="mb-2 block text-sm font-medium text-gray-700">
                Upload a clear photo of the wound
              </label>
              <input
                id="wound-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {imageFile && (
                <div className="mt-4">
                    <img src={URL.createObjectURL(imageFile)} alt="Wound preview" className="max-h-60 w-auto rounded-lg" />
                </div>
              )}
              <div className="mt-6">
                <Button onClick={handleUploadAndAnalyze} disabled={!imageFile || isLoading}>
                  {isLoading ? "Uploading..." : "Upload and Analyze"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Analysis & Confirmation */}
          {currentStep === "analyze" && (
            <div className="text-center">
                <p className="text-lg">Analyzing your image...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
            </div>
          )}

          {currentStep === "confirm" && analysis && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Analysis Results</h2>
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4">
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
                {analysis.raw_labels && (
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