"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount, useSendTransaction } from "wagmi";
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { parseEther } from "viem";

function formatTime(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        role: "system",
        content: !isConnected
          ? "Please connect your wallet before starting a chat."
          : `Hello! I'm your AI trading assistant. Your connected wallet address is ${address ? address : '[not connected]'}. How can I help you optimize your portfolio today?`,
        id: "system-welcome",
      },
    ],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(!open)}
          className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg"
          size="icon"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-40 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-gray-700 px-4 py-3 rounded-t-xl border-b border-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Portfolio Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
            {messages.map((message) => {
              const isAI = message.role !== "user";
              return (
                <div
                  key={message.id}
                  className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[90%] break-words whitespace-pre-line rounded-lg px-3 py-2 ${
                      isAI
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {isAI && (
                        <Bot className="h-4 w-4 mt-1 text-emerald-400 flex-shrink-0" />
                      )}
                      {!isAI && (
                        <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm break-words">{message.content}</p>
                        {/* Tool results (e.g., balance) */}
                        {Array.isArray(message.toolInvocations) && message.toolInvocations.map((toolInvocation) => {
                          const { toolName, toolCallId, state } = toolInvocation;
                          if (state === "result" && toolName === "displayBalance") {
                            const result = (toolInvocation as any).result;
                            return (
                              <div key={toolCallId} className="mt-2 text-xs text-emerald-300">
                                Balance: {result?.balance} ETH
                              </div>
                            );
                          } else if (toolName === "displayBalance") {
                            return (
                              <div key={toolCallId} className="mt-2 text-xs text-gray-400">
                                Loading balance...
                              </div>
                            );
                          }
                          // Handle CCTP tool calls
                          else if (state === "result" && (toolName === "approveUSDC" || toolName === "depositForBurn" || toolName === "receiveMessage")) {
                            const result = (toolInvocation as any).result;
                            if (result.success && result.transactionData) {
                              return (
                                <div key={toolCallId} className="mt-2 text-xs text-emerald-300">
                                  <p>{result.message}</p>
                                  <Button
                                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => {
                                      const txData = result.transactionData;
                                      sendTransaction({
                                        to: txData.to,
                                        data: txData.data,
                                        value: txData.value ? parseEther(txData.value) : undefined,
                                      });
                                    }}
                                  >
                                    Sign Transaction
                                  </Button>
                                </div>
                              );
                            } else if (result.success) {
                               return (
                                <div key={toolCallId} className="mt-2 text-xs text-emerald-300">
                                  <p>{result.message}</p>
                                </div>
                              );
                            }
                             else {
                              return (
                                <div key={toolCallId} className="mt-2 text-xs text-red-400">
                                  Error: {result.error || 'An unknown error occurred.'}
                                </div>
                              );
                            }
                          } else if (toolName === "approveUSDC" || toolName === "depositForBurn" || toolName === "receiveMessage") {
                            return (
                              <div key={toolCallId} className="mt-2 text-xs text-gray-400">
                                Preparing transaction...
                              </div>
                            );
                          }
                          return null;
                        })}
                        <span className="text-xs opacity-70">
                          {message.createdAt
                            ? formatTime(typeof message.createdAt === 'string' ? message.createdAt : message.createdAt.toISOString())
                            : "09:38"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-emerald-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="p-4 border-t border-gray-700" onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your portfolio..."
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                autoFocus
                disabled={!isConnected}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || !isConnected}
                size="icon"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}; 