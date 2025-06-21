"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { keccak256, decodeEventLog, parseEther, toHex } from "viem";
import { toast } from 'react-hot-toast';

const MESSAGE_TRANSMITTER_ABI = [{"inputs":[{"internalType":"uint32","name":"_localDomain","type":"uint32"},{"internalType":"address","name":"_attester","type":"address"},{"internalType":"uint32","name":"_maxMessageBodySize","type":"uint32"},{"internalType":"uint32","name":"_version","type":"uint32"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"attester","type":"address"}],"name":"AttesterDisabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"attester","type":"address"}],"name":"AttesterEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousAttesterManager","type":"address"},{"indexed":true,"internalType":"address","name":"newAttesterManager","type":"address"}],"name":"AttesterManagerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMaxMessageBodySize","type":"uint256"}],"name":"MaxMessageBodySizeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint32","name":"sourceDomain","type":"uint32"},{"indexed":true,"internalType":"uint64","name":"nonce","type":"uint64"},{"indexed":false,"internalType":"bytes32","name":"sender","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"messageBody","type":"bytes"}],"name":"MessageReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"message","type":"bytes"}],"name":"MessageSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldSignatureThreshold","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newSignatureThreshold","type":"uint256"}],"name":"SignatureThresholdUpdated","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"attesterManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"attester","type":"address"}],"name":"disableAttester","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"attester","type":"address"}],"name":"enableAttester","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"}],"name":"getEnabledAttester","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEnabledAttesters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLocalDomain","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxMessageBodySize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"nextAvailableNonce","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_message","type":"bytes"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"receiveMessage","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAttesterManager","type":"address"}],"name":"setAttesterManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newMaxMessageBodySize","type":"uint256"}],"name":"setMaxMessageBodySize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pauser","type":"address"}],"name":"setPauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"setRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newSignatureThreshold","type":"uint256"}],"name":"setSignatureThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"signatureThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"}] as const;

function formatTime(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState<{ hash: `0x${string}`; toolName: string } | null>(null);
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
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
  
  const { data: receipt, isLoading: isReceiptLoading } = useWaitForTransactionReceipt({ 
    hash: pendingTx?.hash,
  });

  useEffect(() => {
    if (receipt && pendingTx) {
      if (pendingTx.toolName === 'depositForBurn') {
        const messageSentLog = receipt.logs.find(
          (log: any) => log.topics[0] === keccak256(toHex('MessageSent(bytes)'))
        );

        if (messageSentLog) {
          const decodedLog = decodeEventLog({
            abi: MESSAGE_TRANSMITTER_ABI,
            data: messageSentLog.data,
            topics: messageSentLog.topics,
          });

          const message = (decodedLog.args as any).message;
          const messageHash = keccak256(message);

          append({
            role: 'user',
            content: `The burn transaction was successful. Get the attestation for message hash: ${messageHash}`,
          });
          
          toast.success("Burn successful! Fetching attestation...");
        } else {
          toast.error("Could not find MessageSent event in the transaction logs.");
        }
      } else {
        toast.success(`Transaction ${pendingTx.hash.slice(0, 10)}... confirmed!`);
      }
      setPendingTx(null);
    }
  }, [receipt, pendingTx, append]);


  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignTransaction = (toolName: string, transactionData: any) => {
    sendTransaction({
      to: transactionData.to,
      data: transactionData.data,
      value: BigInt(transactionData.value)
    }, {
      onSuccess: (hash) => {
        toast.loading(`Transaction sent: ${hash.slice(0, 10)}... Waiting for confirmation.`);
        if (toolName === 'depositForBurn') {
          setPendingTx({ hash, toolName });
        } else {
          toast.success(`Transaction confirmed: ${hash.slice(0, 10)}...`);
        }
      },
      onError: (error) => {
        toast.error(`Transaction failed: ${error.message}`);
      }
    });
  };

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
                        {/* Tool results */}
                        {Array.isArray(message.toolInvocations) && message.toolInvocations.map((toolInvocation) => {
                          const { toolName, toolCallId, state } = toolInvocation;
                          if (state === "result") {
                            const result = (toolInvocation as any).result;
                            if (result.success && result.transactionData) {
                              return (
                                <div key={toolCallId} className="mt-2 text-xs text-emerald-300">
                                  <p>{result.message}</p>
                                  <Button
                                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isLoading || (pendingTx?.toolName === toolName && isReceiptLoading)}
                                    onClick={() => handleSignTransaction(toolName, result.transactionData)}
                                  >
                                    {pendingTx && isReceiptLoading ? 'Verifying...' : 'Sign Transaction'}
                                  </Button>
                                </div>
                              );
                            } else if (result.success) {
                               return (
                                <div key={toolCallId} className="mt-2 text-xs text-emerald-300">
                                  <p>{result.message}</p>
                                </div>
                              );
                            } else if (result.error) {
                              return (
                                <div key={toolCallId} className="mt-2 text-xs text-red-400">
                                  Error: {result.error}
                                </div>
                              );
                            } else if (result.balance) { // For balance tool
                                return (
                                  <div key={toolCallId} className="mt-2 text-xs text-emerald-300">
                                    Balance: {result.balance} ETH
                                  </div>
                                );
                            }
                          } else { // Catches 'loading' and other states
                            return (
                              <div key={toolCallId} className="mt-2 text-xs text-gray-400">
                                Loading...
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