"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/services/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token not found. Please try again.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error: unknown) {
        setStatus("error");
        let errorMessage = "Verification failed. Please try again.";
        
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: { message?: string } } };
          errorMessage = apiError.response?.data?.message || errorMessage;
        } else if (error && typeof error === 'object' && 'message' in error) {
          const messageError = error as { message?: string };
          errorMessage = messageError.message || errorMessage;
        }
        
        setMessage(errorMessage);
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === "verifying" && (
          <p className="text-lg text-gray-600">{message}</p>
        )}
        {status === "success" && (
          <div>
            <h2 className="text-2xl font-bold text-green-600">
              Verification Successful!
            </h2>
            <p className="mt-2 text-gray-700">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting you to the login page...
            </p>
          </div>
        )}
        {status === "error" && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-700">{message}</p>
            <Link
              href="/register"
              className="mt-4 inline-block text-indigo-600 hover:underline"
            >
              Try registering again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
          <p className="text-lg text-gray-600">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 