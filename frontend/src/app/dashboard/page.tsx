"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/Button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push("/login");
      } else if (user?.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [isLoading, token, user, router]);

  if (isLoading || !token || user?.role === 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                  {/* Placeholder for wound list */}
                  <p className="text-gray-500">
                    You are not currently tracking any wounds.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile/Info Panel */}
            <div className="col-span-1">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Your Profile
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Role:</span> {user?.role}
                  </p>
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