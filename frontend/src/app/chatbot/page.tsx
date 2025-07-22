"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api";
import Button from "@/components/Button";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I'm your AI wound care assistant. How can I help you today?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You must be logged in to use the AI Assistant.</p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      const response = await apiClient.post("/chatbot", {
        message: input,
        history: newMessages.filter(m => m.role === "user" || m.role === "assistant")
      });
      setMessages([...newMessages, { role: "assistant" as const, content: response.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant" as const, content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      <nav className="mb-4">
        <Link href="/dashboard" className="text-indigo-600 hover:underline">&larr; Back to Dashboard</Link>
      </nav>
      {/* Animated AI Character */}
      <div className="flex justify-center mb-4">
        <AnimatedRobot />
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg bg-white p-6 shadow max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${msg.role === "user" ? "bg-indigo-100 text-right" : "bg-gray-200 text-left"}`}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form
        className="mx-auto mt-4 flex w-full max-w-2xl gap-2"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}

function AnimatedRobot() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Head */}
        <ellipse cx="40" cy="40" rx="28" ry="28" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2" />
        {/* Eyes (animated blink) */}
        <ellipse className="robot-eye" cx="32" cy="40" rx="4" ry="4" fill="#6366F1">
          <animate attributeName="ry" values="4;1;4" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse className="robot-eye" cx="48" cy="40" rx="4" ry="4" fill="#6366F1">
          <animate attributeName="ry" values="4;1;4" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite" />
        </ellipse>
        {/* Smile */}
        <path d="M32 50 Q40 56 48 50" stroke="#6366F1" strokeWidth="2" fill="none" />
        {/* Antenna */}
        <rect x="38" y="14" width="4" height="12" rx="2" fill="#6366F1">
          <animate attributeName="y" values="14;10;14" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <circle cx="40" cy="10" r="3" fill="#6366F1">
          <animate attributeName="cy" values="10;6;10" keyTimes="0;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
} 