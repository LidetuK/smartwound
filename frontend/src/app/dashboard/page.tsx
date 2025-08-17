"use client";

import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import apiClient from "@/services/api";
import WoundCard from "@/components/WoundCard";
import { FaUserCircle, FaFlag } from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";

// Define the Wound type based on your API response
interface Wound {
  id: string;
  type: string;
  severity: string;
  image_url: string;
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

function isProfileComplete(user: User | null) {
  if (!user) return false;
  // Add all required fields for completion
  return Boolean(
    user.full_name &&
    user.gender &&
    user.date_of_birth &&
    user.phone_number &&
    user.country &&
    user.city &&
    user.privacy_consent
  );
}

export default function DashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [wounds, setWounds] = useState<Wound[]>([]);
  const [adminComments, setAdminComments] = useState<Record<string, AdminComment[]>>({});
  const [isWoundsLoading, setIsWoundsLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    async function fetchWounds() {
      if (token) {
        try {
          console.log('Fetching wounds...');
          const response = await apiClient.get("/wounds", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          console.log('Wounds response:', response.data);
          
          // Ensure wounds have required fields with defaults
          const woundsWithDefaults = response.data.map((wound: Wound) => ({
            ...wound,
            flagged: wound.flagged || false,
            status: wound.status || 'open'
          }));
          
          setWounds(woundsWithDefaults);
          
          // Fetch admin comments for flagged wounds
          const flaggedWounds = woundsWithDefaults.filter((wound: Wound) => wound.flagged);
          console.log('Flagged wounds:', flaggedWounds);
          
          if (flaggedWounds.length > 0) {
            const commentsPromises = flaggedWounds.map(async (wound: Wound) => {
              try {
                const commentsResponse = await apiClient.get(`/wounds/${wound.id}/admin-comments`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                return { woundId: wound.id, comments: commentsResponse.data };
              } catch (error) {
                console.error(`Failed to fetch comments for wound ${wound.id}:`, error);
                return { woundId: wound.id, comments: [] };
              }
            });
            
            const commentsResults = await Promise.all(commentsPromises);
            const commentsMap: Record<string, AdminComment[]> = {};
            commentsResults.forEach(({ woundId, comments }) => {
              commentsMap[woundId] = comments;
            });
            setAdminComments(commentsMap);
          }
        } catch (error: unknown) {
          console.error("Failed to fetch wounds:", error);
          if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as { response?: { data?: unknown } };
            console.error("Error details:", apiError.response?.data);
          } else if (error && typeof error === 'object' && 'message' in error) {
            const messageError = error as { message?: string };
            console.error("Error details:", messageError.message);
          }
        } finally {
          setIsWoundsLoading(false);
        }
      }
    }

    if (!isLoading && token) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        fetchWounds();
      }
    } else if (!isLoading && !token) {
      router.push("/login");
    }
  }, [isLoading, token, user, router]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.subject.trim() || !emailForm.message.trim()) return;

    try {
      setIsSendingEmail(true);
      
      // Create Gmail compose URL
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=mikianmaw@gmail.com&su=${encodeURIComponent(
        `[SmartWound Support] ${emailForm.subject}`
      )}&body=${encodeURIComponent(
        `From: ${user?.full_name} (${user?.email})\n\nMessage:\n${emailForm.message}`
      )}`;
      
      // Open Gmail in new tab
      window.open(gmailUrl, '_blank');
      
      // Reset form and close
      setEmailForm({ subject: '', message: '' });
      setShowEmailForm(false);
      
      // Show success message
      alert('Gmail opened in a new tab! Please send the email from there.');
    } catch (error) {
      console.error('Failed to open Gmail:', error);
      alert('Failed to open Gmail. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading || !token || user?.role === 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const showProfileSetup = !isProfileComplete(user);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  Smart Wound
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm text-gray-600">
                Hello, {user?.full_name || "User"}
              </span>
              {/* User Icon for Edit Profile */}
              <button
                title="Edit Profile"
                onClick={() => router.push("/dashboard/profile-setup")}
                className="text-indigo-600 hover:text-indigo-800 transition-colors text-2xl p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ lineHeight: 0 }}
              >
                <FaUserCircle />
              </button>
              <Button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                variant="secondary"
                className="!w-auto"
              >
                Log Out
              </Button>
            </div>
          </div>
        </nav>
      </header>
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {showProfileSetup && (
            <div className="mb-8 rounded-lg bg-yellow-50 border border-yellow-300 p-6 flex items-center justify-between shadow">
              <div>
                <h2 className="text-xl font-bold text-yellow-800 mb-1">Finish setting up your account</h2>
                <p className="text-yellow-700 text-sm">Complete your profile to get the best experience and access all features.</p>
              </div>
              <Button
                variant="primary"
                className="ml-4 !w-auto"
                onClick={() => router.push("/dashboard/profile-setup")}
              >
                Complete Profile
              </Button>
            </div>
          )}
          
          {/* Flagged Wounds Notification */}
          {wounds.some(wound => wound.flagged === true) && (
            <div className="mb-8 rounded-lg bg-red-50 border border-red-300 p-6 shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaFlag className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Important: Some of your wounds have been flagged for review
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {wounds.filter(w => w.flagged === true).length} of your wounds {wounds.filter(w => w.flagged === true).length === 1 ? 'has' : 'have'} been flagged by our medical team for attention. 
                      Please review any admin comments and consider consulting with a healthcare professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold leading-tight text-gray-900 tracking-tight drop-shadow-sm">
              Your Dashboard
            </h2>
          </div>

          {/* Customer Service Card (left side, modern style) */}
          <div className="mb-8">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-100/80 via-white/70 to-blue-100/80 backdrop-blur-lg shadow-2xl border border-indigo-200 p-8 hover:scale-[1.02] hover:shadow-indigo-200 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-indigo-200/60 shadow-lg">
                  <MdSupportAgent className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-2xl font-extrabold text-indigo-700 mb-1 tracking-tight">Customer Service</div>
                  <div className="text-gray-700 mb-4 text-base">Need help? Contact our support team by email or phone.</div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                    <button
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="bg-indigo-600 text-white font-semibold rounded-lg py-2 px-6 shadow hover:bg-indigo-700 hover:scale-105 transition-all text-base flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0l-4-4m4 4l-4 4" />
                      </svg>
                      {showEmailForm ? 'Hide Email Form' : 'Email Support'}
                    </button>
                    <a
                      href="tel:0965945748"
                      className="bg-white text-indigo-700 font-semibold rounded-lg py-2 px-6 border border-indigo-200 shadow hover:bg-indigo-50 hover:scale-105 transition-all text-base flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.789 1.106l1.387 2.773a2 2 0 01-.327 2.327l-1.1 1.1a16.001 16.001 0 006.586 6.586l1.1-1.1a2 2 0 012.327-.327l2.773 1.387A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2h1z" />
                      </svg>
                      Call Center
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Email Form */}
              {showEmailForm && (
                <div className="border-t border-indigo-200 pt-6">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-4">Send Support Email</h3>
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                        required
                        placeholder="Brief description of your issue"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        value={emailForm.message}
                        onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                        required
                        rows={4}
                        placeholder="Please describe your issue in detail..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingEmail}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {isSendingEmail ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Email'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left/Main Content */}
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <ActionCard
                  title="Add a New Wound"
                  description="Start tracking a new wound by uploading a photo."
                  href="/wounds/new"
                />
                <ActionCard
                  title="Chat with AI Assistant"
                  description="Get general advice and answers to your questions."
                  href="/chatbot"
                />
                <ActionCard
                  title="Community Forum"
                  description="Connect with others, share experiences and get support."
                  href="/dashboard/forum"
                />
              </div>

              {/* Wound List */}
              <div className="mt-8 rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Your Monitored Wounds
                </h3>
                <div className="mt-4">
                  {isWoundsLoading ? (
                    <p>Loading wounds...</p>
                  ) : wounds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {wounds.map((wound) => (
                        <WoundCard 
                          key={wound.id} 
                          wound={wound} 
                          adminComments={adminComments[wound.id] || []}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      You are not currently tracking any wounds.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile/Info Panel (right side) - removed */}
            {/* <div className="col-span-1">
              <div className="rounded-2xl bg-white/60 backdrop-blur-lg p-8 shadow-xl flex flex-col items-center border border-indigo-100" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                ...
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 shadow-lg transition hover:scale-105 hover:shadow-2xl border border-indigo-100"
      style={{boxShadow: '0 4px 24px 0 rgba(80, 63, 205, 0.08)'}}
    >
      <h4 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">{title}</h4>
      <p className="text-base text-gray-600">{description}</p>
    </Link>
  );
} 