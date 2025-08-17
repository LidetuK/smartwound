"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<{
    users?: number;
    wounds?: number;
    flaggedContent?: { posts?: number };
    clinics?: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    // First, wait for auth state to load
    if (isLoading) {
      return;
    }
    // If not loading and there's no token, or if the user is not an admin, redirect
    if (!token || user?.role !== 'admin') {
      router.push('/dashboard'); // Redirect non-admins to the user dashboard
      return;
    }
    // Fetch stats
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'}/admin/stats`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setStatsError(errorMessage);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [isLoading, token, user, router]);

  // Show a loading state while we verify the user's role or stats
  if (isLoading || !token || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  // Once access is verified, render the dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl justify-between p-4">
          <h1 className="text-xl font-bold text-red-600">Admin Dashboard</h1>
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">
              Welcome, {user.full_name} (Admin)
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
        </nav>
      </header>

      <main className="p-8">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">System Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={statsLoading ? '...' : (stats?.users?.toLocaleString() ?? 'N/A')} />
          <StatCard title="Wounds Tracked" value={statsLoading ? '...' : (stats?.wounds?.toLocaleString() ?? 'N/A')} />
          <StatCard title="Flagged Posts" value={statsLoading ? '...' : (stats?.flaggedContent?.posts?.toLocaleString() ?? 'N/A')} />
          <StatCard title="Active Clinics" value={statsLoading ? '...' : (stats?.clinics?.toLocaleString() ?? 'N/A')} />
        </div>

        {/* Action Panels */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <ActionPanel title="Moderation Queue" description="Review flagged posts and comments from the community forum." buttonText="View Queue" href="/admin/moderation" />
            <ActionPanel title="User Management" description="View, search, and manage user roles and statuses." buttonText="Manage Users" href="/admin/users" />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ActionPanel({ title, description, buttonText, href }: { title: string; description: string; buttonText: string; href: string }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
            <div className="mt-6">
                <Link href={href} className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    {buttonText}
                </Link>
            </div>
        </div>
    );
} 