"use client";

import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import apiClient from "@/services/api";
import WoundCard from "@/components/WoundCard";
import { FaUserEdit, FaKey, FaUserCircle } from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";

// Define the Wound type based on your API response
interface Wound {
  id: string;
  type: string;
  severity: string;
  image_url: string;
  created_at: string;
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
  const [isWoundsLoading, setIsWoundsLoading] = useState(true);

  useEffect(() => {
    async function fetchWounds() {
      if (token) {
        try {
          const response = await apiClient.get("/wounds", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWounds(response.data);
        } catch (error) {
          console.error("Failed to fetch wounds:", error);
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
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold leading-tight text-gray-900 tracking-tight drop-shadow-sm">
              Your Dashboard
            </h2>
          </div>

          {/* Customer Service Card (left side, modern style) */}
          <div className="mb-8">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-100/80 via-white/70 to-blue-100/80 backdrop-blur-lg shadow-2xl border border-indigo-200 p-8 flex flex-col sm:flex-row items-center gap-6 hover:scale-[1.02] hover:shadow-indigo-200 transition-all duration-300">
              <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-indigo-200/60 shadow-lg">
                <MdSupportAgent className="w-12 h-12 text-indigo-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-2xl font-extrabold text-indigo-700 mb-1 tracking-tight">Customer Service</div>
                <div className="text-gray-700 mb-4 text-base">Need help? Contact our support team by email or phone.</div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=support@smartwound.com&su=Customer%20Support%20Request&body=Hi%20Smart%20Wound%20Team%2C%0A%0AI%20need%20help%20with..."
                    className="bg-indigo-600 text-white font-semibold rounded-lg py-2 px-6 shadow hover:bg-indigo-700 hover:scale-105 transition-all text-base flex items-center justify-center gap-2"
                    target="_blank" rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0l-4-4m4 4l-4 4" />
                    </svg>
                    Email Support
                  </a>
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
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left/Main Content */}
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        <WoundCard key={wound.id} wound={wound} />
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