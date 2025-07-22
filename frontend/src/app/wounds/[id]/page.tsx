"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api";
import Button from "@/components/Button";
import Link from "next/link";
import Image from "next/image";
import Tabs from "@/components/Tabs";
import HealingTimeline from "@/components/HealingTimeline";
import ChatPanel from "@/components/ChatPanel";


// Define types for Wound and WoundLog
interface Wound {
  id: string;
  type: string;
  severity: string;
  image_url: string;
  notes: string;
  created_at: string;
}

interface WoundLog {
  id: string;
  photo_url: string;
  notes: string;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function WoundDetailPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [wound, setWound] = useState<Wound | null>(null);
  const [logs, setLogs] = useState<WoundLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newLogNotes, setNewLogNotes] = useState("");
  const [newLogImageFile, setNewLogImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (token && id) {
        try {
          const [woundRes, logsRes] = await Promise.all([
            apiClient.get(`/wounds/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
            apiClient.get(`/wounds/${id}/logs`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          setWound(woundRes.data);
          setLogs(logsRes.data);
        } catch (error) {
          console.error("Failed to fetch wound data:", error);
          toast.error("Wound not found or access denied.");
          router.push("/dashboard");
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (!isAuthLoading) {
      fetchData();
    }
  }, [id, token, isAuthLoading, router]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewLogImageFile(e.target.files[0]);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogImageFile) {
      toast.error("Please upload an image for the log entry.");
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("image", newLogImageFile);
      const uploadRes = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      
      const logRes = await apiClient.post(`/wounds/${id}/logs`, {
        photo_url: uploadRes.data.url,
        notes: newLogNotes,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setLogs([logRes.data, ...logs]);
      setNewLogImageFile(null);
      setNewLogNotes("");
      toast.success("New log added successfully!");

    } catch (error) {
      console.error("Failed to add log:", error);
      toast.error("Failed to add new log entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading wound details...</p>
      </div>
    );
  }

  if (!wound) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <p>Wound not found.</p>
          <Link href="/dashboard" className="text-indigo-600 hover:underline ml-4">
            &larr; Back to Dashboard
          </Link>
        </div>
      );
  }

  const woundContext = {
    wound_type: wound.type,
    wound_severity: wound.severity,
    days_tracked: Math.floor((Date.now() - new Date(wound.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    total_logs: logs.length,
  };

  const tabs = [
    {
      label: "Healing History",
      content: <HealingTimeline logs={logs} />,
    },
    {
      label: "Chat with AI",
      content: (
        <ChatPanel
          initialMessages={[{
            role: "assistant",
            content: "Hi! I'm your AI wound care assistant. How can I help you with your healing journey?"
          }]}
          woundContext={woundContext}
          token={token}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8">
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </nav>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Left Panel: Wound Info & New Log Form */}
          <div className="md:col-span-1 space-y-8">
            <div className="rounded-lg bg-white p-6 shadow-lg sticky top-8">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{wound.type}</h1>
                <p className="text-md capitalize text-gray-600">Severity: {wound.severity}</p>
                <div className="relative mt-4 h-48 w-full">
                    <Image
                        src={wound.image_url}
                        alt={`Initial image of a ${wound.type}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                    />
                </div>
                <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-700">{wound.notes || "No initial notes."}</p>
                    <p className="mt-2 text-xs text-gray-400">
                        First tracked on: {new Date(wound.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a New Healing Log</h2>
                <form onSubmit={handleAddLog} className="space-y-4">
                    <div>
                        <label htmlFor="log-notes" className="mb-1 block text-sm font-medium text-gray-700">
                            Notes
                        </label>
                        <textarea
                            id="log-notes"
                            value={newLogNotes}
                            onChange={(e) => setNewLogNotes(e.target.value)}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="e.g., 'Swelling has reduced...'"
                        />
                    </div>
                    <div>
                        <label htmlFor="log-image" className="mb-1 block text-sm font-medium text-gray-700">
                           Photo
                        </label>
                        <input
                            id="log-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                        {newLogImageFile && (
                            <div className="mt-4">
                                <img src={URL.createObjectURL(newLogImageFile)} alt="New log preview" className="max-h-40 w-auto rounded-lg" />
                            </div>
                        )}
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Saving..." : "Add Log"}
                    </Button>
                </form>
            </div>
          </div>

          {/* Right Panel: Tabs for History and Chat */}
          <div className="md:col-span-2">
            <Tabs tabs={tabs} />
          </div>
        </div>
      </div>
    </div>
  );
} 