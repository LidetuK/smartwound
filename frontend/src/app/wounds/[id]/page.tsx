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
import { FaFlag, FaExclamationTriangle } from "react-icons/fa";


// Define types for Wound and WoundLog
interface Wound {
  id: string;
  type: string;
  severity: string;
  image_url: string;
  notes: string;
  created_at: string;
  flagged: boolean;
  status: string;
}

interface AdminComment {
  id: string;
  comment: string;
  createdAt: string;
  admin?: {
    full_name: string;
  };
}

interface WoundLog {
  id: string;
  photo_url: string;
  notes: string;
  created_at: string;
}



export default function WoundDetailPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [wound, setWound] = useState<Wound | null>(null);
  const [logs, setLogs] = useState<WoundLog[]>([]);
  const [adminComments, setAdminComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newLogNotes, setNewLogNotes] = useState("");
  const [newLogImageFile, setNewLogImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (token && id) {
        try {
          const [woundRes, logsRes] = await Promise.all([
            apiClient.get(`/wounds/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
            apiClient.get(`/wounds/${id}/logs`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          const woundData = woundRes.data;
          setWound(woundData);
          setLogs(logsRes.data);
          
          // Fetch admin comments for flagged wounds
          if (woundData.flagged === true) {
            try {
              const commentsRes = await fetch(`http://localhost:3001/api/admin/wounds/${id}/comments`, {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                credentials: 'include'
              });
              
              if (commentsRes.ok) {
                const commentsData = await commentsRes.json();
                console.log('✅ Fetched admin comments:', commentsData);
                setAdminComments(commentsData || []);
              } else {
                console.error('❌ API response not ok:', commentsRes.status, commentsRes.statusText);
                setAdminComments([]);
              }
            } catch (error) {
              console.error('❌ Failed to fetch admin comments:', error);
              setAdminComments([]);
            }
          }
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

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await apiClient.put(`/wounds/${id}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setWound(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusModal(false);
      toast.success(`Status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </nav>
        
        {/* Flagged Wound Alert Banner */}
        {wound.flagged && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 shadow-lg animate-pulse">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-red-800">
                    🚨 Medical Attention Required
                  </h3>
                  <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-bounce">
                    URGENT
                  </span>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-red-200">
                  <p className="text-red-700 leading-relaxed">
                    This wound has been flagged by our medical team and requires your immediate attention. 
                    Please review the medical team comments below and consider consulting with a healthcare 
                    professional for proper medical advice.
                  </p>
                </div>
                {adminComments.length > 0 && (
                  <div className="mt-4 bg-blue-100 rounded-lg p-3 border border-blue-200">
                    <p className="text-blue-800 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      {adminComments.length} medical team comment{adminComments.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
          {/* Left Panel: Wound Info */}
          <div className="xl:col-span-1 space-y-6">
            <div className={`rounded-2xl p-8 shadow-xl sticky top-8 backdrop-blur-sm border ${
              wound.flagged 
                ? 'bg-gradient-to-br from-red-50/90 to-orange-50/90 border-red-200' 
                : 'bg-white/90 border-gray-200'
            }`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
                      {wound.type}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Wound Details</p>
                  </div>
                  {wound.flagged && (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
                      <FaFlag className="w-3 h-3" />
                      FLAGGED
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/70 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Severity</p>
                    <p className="text-lg font-bold capitalize text-gray-800">{wound.severity}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        wound.status === 'healing' ? 'bg-green-100 text-green-800' :
                        wound.status === 'infected' ? 'bg-red-100 text-red-800' :
                        wound.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          wound.status === 'healing' ? 'bg-green-400' :
                          wound.status === 'infected' ? 'bg-red-400' :
                          wound.status === 'closed' ? 'bg-gray-400' :
                          'bg-yellow-400'
                        }`}></div>
                        {wound.status}
                      </span>
                      <button
                        onClick={() => setShowStatusModal(true)}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
                
                {wound.flagged && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-100 to-orange-100 border border-red-300 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <FaExclamationTriangle className="text-white w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-red-800">
                        Medical Attention Required
                      </span>
                    </div>
                    <p className="text-sm text-red-700 leading-relaxed">
                      This wound requires immediate medical attention. Please review the medical team comments below.
                    </p>
                  </div>
                )}
                
                <div className="relative mt-6 h-64 w-full group">
                    <Image
                        src={wound.image_url}
                        alt={`Initial image of a ${wound.type}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium">Initial Photo</p>
                    </div>
                </div>
                
                <div className="mt-6 bg-white/70 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Initial Notes</h4>
                    <p className="text-gray-800 leading-relaxed">{wound.notes || "No initial notes provided."}</p>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        First tracked on {new Date(wound.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                </div>
                
                {/* Admin Comments Section */}
                {wound.flagged && adminComments.length > 0 && (
                  <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-800">
                          Medical Team Comments
                        </h3>
                        <p className="text-sm text-blue-600">Professional medical guidance</p>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {adminComments.map((comment, index) => (
                        <div key={comment.id} className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 leading-relaxed mb-3">{comment.comment}</p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-semibold text-blue-800">
                                    {comment.admin?.full_name || 'Medical Team'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Middle Panel: New Healing Log Form */}
          <div className="xl:col-span-1">
            <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Add Healing Log
                    </h2>
                    <p className="text-sm text-gray-500">Track your wound&apos;s progress</p>
                  </div>
                </div>
                <form onSubmit={handleAddLog} className="space-y-6">
                    <div>
                        <label htmlFor="log-notes" className="mb-2 block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Progress Notes
                        </label>
                        <textarea
                            id="log-notes"
                            value={newLogNotes}
                            onChange={(e) => setNewLogNotes(e.target.value)}
                            rows={4}
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white/70 backdrop-blur-sm transition-all duration-200"
                            placeholder="Describe any changes you&apos;ve noticed: pain level, swelling, color, healing progress..."
                        />
                    </div>
                    <div>
                        <label htmlFor="log-image" className="mb-2 block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                           Progress Photo
                        </label>
                        <div className="relative">
                          <input
                              id="log-image"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-indigo-50 file:to-purple-50 file:py-3 file:px-6 file:text-sm file:font-semibold file:text-indigo-600 hover:file:from-indigo-100 hover:file:to-purple-100 transition-all duration-200 border border-gray-300 rounded-xl bg-white/70"
                          />
                        </div>
                        {newLogImageFile && (
                            <div className="mt-4 relative">
                                <img 
                                  src={URL.createObjectURL(newLogImageFile)} 
                                  alt="New log preview" 
                                  className="max-h-48 w-auto rounded-2xl shadow-lg border border-gray-200" 
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                  Ready to upload
                                </div>
                            </div>
                        )}
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !py-3 !rounded-xl !font-semibold !shadow-lg hover:!shadow-xl !transition-all !duration-200">
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Progress...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Healing Log
                          </div>
                        )}
                    </Button>
                </form>
            </div>
          </div>

          {/* Right Panel: Tabs for History and Chat */}
          <div className="xl:col-span-2">
            <Tabs tabs={tabs} />
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update Wound Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">Select the new status for your wound:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStatusUpdate('open')}
                  disabled={isUpdatingStatus}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    wound.status === 'open' 
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="font-medium">Open</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleStatusUpdate('healing')}
                  disabled={isUpdatingStatus}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    wound.status === 'healing' 
                      ? 'border-green-400 bg-green-50 text-green-800' 
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="font-medium">Healing</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleStatusUpdate('infected')}
                  disabled={isUpdatingStatus}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    wound.status === 'infected' 
                      ? 'border-red-400 bg-red-50 text-red-800' 
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="font-medium">Infected</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleStatusUpdate('closed')}
                  disabled={isUpdatingStatus}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    wound.status === 'closed' 
                      ? 'border-gray-400 bg-gray-50 text-gray-800' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Closed</span>
                  </div>
                </button>
              </div>
              
              {isUpdatingStatus && (
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating status...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 