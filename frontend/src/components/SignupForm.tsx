"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import apiClient from "@/services/api";
import Image from "next/image";

export default function SignupForm({ onSuccess, onSwitchToLogin }: { onSuccess?: () => void, onSwitchToLogin: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading("Creating your account...");
    try {
      await apiClient.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });
      toast.dismiss();
      toast.success("Account created successfully! Please check your email to verify your account.");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.dismiss();
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Image src="/android-chrome-192x192.png" alt="Smart Wound Logo" width={60} height={60} className="mb-4" />
      <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-2">Create a new account</h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        Or{" "}
        <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500">
          sign in to your existing account
        </button>
      </p>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <div className="mt-1">
            <input
              id="full-name"
              name="full-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  );
} 