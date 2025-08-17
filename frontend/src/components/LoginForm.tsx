"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import apiClient from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function LoginForm({ onSuccess, onSwitchToSignup }: { onSuccess?: () => void, onSwitchToSignup: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token } = response.data;
      login(token);
      toast.success("Login successful!");
      if (onSuccess) onSuccess();
      router.push("/dashboard");
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        errorMessage = apiError.response?.data?.message || errorMessage;
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as { message?: string };
        errorMessage = messageError.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Image src="/android-chrome-192x192.png" alt="Smart Wound Logo" width={60} height={60} className="mb-4" />
      <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-2">Sign in to your account</h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        Or{" "}
        <button onClick={onSwitchToSignup} className="font-medium text-indigo-600 hover:text-indigo-500">
          create a new account
        </button>
      </p>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
} 