"use client";

import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";
import apiClient from "@/services/api";
import WoundCard from "@/components/WoundCard";

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
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">
                Hello, {user?.full_name || "User"}
              </span>
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
            <h2 className="text-3xl font-bold leading-tight text-gray-900">
              Your Dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Action Cards */}
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

            {/* Profile/Info Panel */}
            <div className="col-span-1">
              <div className="rounded-lg bg-white p-6 shadow flex flex-col items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Your Profile
                </h3>
                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-indigo-200 mb-4"
                  />
                ) : (
                  <span className="h-24 w-24 flex items-center justify-center rounded-full bg-indigo-100 text-5xl text-indigo-300 mb-4">
                    👤
                  </span>
                )}
                <div className="w-full">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Role:</span> {user?.role}
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      type="button"
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg py-2"
                      onClick={() => router.push("/dashboard/profile-setup")}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      type="button"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg py-2"
                      onClick={() => router.push("/dashboard/reset-password")}
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
      className="block rounded-lg bg-white p-6 shadow transition hover:shadow-md"
    >
      <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </Link>
  );
} 