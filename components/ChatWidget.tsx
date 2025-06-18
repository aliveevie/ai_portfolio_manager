"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

function formatTime(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        role: "system",
        content: !isConnected
          ? "Please connect your wallet before starting a chat."
          : "Hello! I'm your AI trading assistant. How can I help you optimize your portfolio today?",
        id: "system-welcome",
      },
    ],
  });

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-emerald-500 hover:bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white"
        onClick={() => setOpen(true)}
        aria-label="Open AI Chat"
      >
        {/* AI Chat Icon (SVG) */}
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#10b981" />
          <path d="M8 10h8M8 14h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 1.657.672 3.157 1.757 4.243C6.343 17.328 8.343 18 10 18h2v2z" stroke="#fff" strokeWidth="2"/>
        </svg>
      </button>

      {/* Chat Modal/Popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black bg-opacity-30">
          <div className="bg-[#232b3b] w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl m-0 sm:m-8 flex flex-col overflow-hidden border border-gray-800">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a2233] border-b border-gray-800">
              <div className="bg-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.657.672 3.157 1.757 4.243C6.343 17.328 8.343 18 10 18h2v2z" fill="#fff"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-white">AI Trading Assistant</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span> Online
                </div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-white" onClick={() => setOpen(false)} aria-label="Close Chat">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#232b3b]">
              {messages.map((message, idx) => {
                const isAI = message.role !== "user";
                return (
                  <div key={message.id} className={
                    isAI
                      ? "flex items-start gap-3"
                      : "flex items-end justify-end"
                  }>
                    {isAI && (
                      <div className="flex-shrink-0 flex flex-col items-end pt-2">
                        <div className="bg-emerald-500 rounded-full w-7 h-7 flex items-center justify-center shadow">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.657.672 3.157 1.757 4.243C6.343 17.328 8.343 18 10 18h2v2z" fill="#fff"/>
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className={
                      isAI
                        ? "relative bg-[#2d3748] text-white rounded-xl shadow px-5 py-4 max-w-[80%] flex flex-col"
                        : "bg-gray-800 text-gray-50 rounded-xl px-5 py-4 max-w-[80%] ml-auto flex flex-col"
                    }>
                      <span>{message.content}</span>
                      <span className="text-xs text-gray-400 mt-2 absolute left-4 bottom-2">
                        {message.createdAt ? formatTime(typeof message.createdAt === 'string' ? message.createdAt : message.createdAt.toISOString()) : "09:38"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex flex-col items-end pt-2">
                    <div className="bg-emerald-500 rounded-full w-7 h-7 flex items-center justify-center shadow">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.657.672 3.157 1.757 4.243C6.343 17.328 8.343 18 10 18h2v2z" fill="#fff"/>
                      </svg>
                    </div>
                  </div>
                  <div className="relative bg-[#2d3748] text-white rounded-xl shadow px-5 py-4 max-w-[80%] flex flex-col animate-pulse">
                    AI is typing...
                    <span className="text-xs text-gray-400 mt-2 absolute left-4 bottom-2">...</span>
                  </div>
                </div>
              )}
            </div>
            {/* Input Area */}
            <form className="flex items-center gap-2 px-4 py-3 bg-[#1a2233] border-t border-gray-800" onSubmit={handleSubmit}>
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your portfolio..."
                className="flex-1 bg-[#232b3b] border-none focus:ring-0 focus:border-emerald-400 rounded-full px-4 py-2 text-gray-100 shadow"
                autoFocus
                disabled={!isConnected}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !isConnected}
                className="bg-emerald-500 hover:bg-emerald-600 rounded-full p-3 flex items-center justify-center shadow"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M3 12l18-7-7 18-2-7-7-4z" fill="#fff"/>
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}; 