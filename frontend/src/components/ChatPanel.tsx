"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/services/api';
import Button from '@/components/Button';

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WoundContext {
    wound_type: string;
    wound_severity: string;
    days_tracked: number;
    total_logs: number;
}

interface ChatPanelProps {
  initialMessages: Message[];
  woundContext: WoundContext;
  token: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ initialMessages, woundContext, token }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await apiClient.post("/chatbot", {
        message: userMessage,
        context: woundContext,
        history: [...messages, { role: "user", content: userMessage }],
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages(prev => [...prev, { role: "assistant", content: response.data.reply }]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast.error("Failed to get AI response. Please try again.");
      // remove the user message if the API fails
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsChatLoading(false);
    }
  };
  
  return (
    <div className="rounded-lg bg-white p-6 shadow-md h-[36rem] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat with AI Assistant</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-sm text-gray-500">Typing...</p>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask about your wound..."
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          disabled={isChatLoading}
        />
        <Button
          type="submit"
          disabled={isChatLoading || !chatInput.trim()}
          className="!w-auto"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel; 