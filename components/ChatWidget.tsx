"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { MessageCircle, Send, X, Bot, User, Copy, Check } from 'lucide-react';
import { keccak256, decodeEventLog, parseEther, toHex, formatEther } from "viem";
import { toast } from 'react-hot-toast';
import React from 'react';
import { getMessageBytesFromEventLogs, getMessageHashFromBytes } from "@/lib/cctp/utils";
import { pollForAttestation } from "@/lib/cctp/attestation";
import { tools } from '@/ai/tools';

const MESSAGE_TRANSMITTER_ABI = [{"inputs":[{"internalType":"uint32","name":"_localDomain","type":"uint32"},{"internalType":"address","name":"_attester","type":"address"},{"internalType":"uint32","name":"_maxMessageBodySize","type":"uint32"},{"internalType":"uint32","name":"_version","type":"uint32"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"attester","type":"address"}],"name":"AttesterDisabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"attester","type":"address"}],"name":"AttesterEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousAttesterManager","type":"address"},{"indexed":true,"internalType":"address","name":"newAttesterManager","type":"address"}],"name":"AttesterManagerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMaxMessageBodySize","type":"uint256"}],"name":"MaxMessageBodySizeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint32","name":"sourceDomain","type":"uint32"},{"indexed":true,"internalType":"uint64","name":"nonce","type":"uint64"},{"indexed":false,"internalType":"bytes32","name":"sender","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"messageBody","type":"bytes"}],"name":"MessageReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"message","type":"bytes"}],"name":"MessageSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldSignatureThreshold","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newSignatureThreshold","type":"uint256"}],"name":"SignatureThresholdUpdated","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"attesterManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"attester","type":"address"}],"name":"disableAttester","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"attester","type":"address"}],"name":"enableAttester","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"}],"name":"getEnabledAttester","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEnabledAttesters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLocalDomain","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxMessageBodySize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"nextAvailableNonce","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_message","type":"bytes"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"receiveMessage","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAttesterManager","type":"address"}],"name":"setAttesterManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newMaxMessageBodySize","type":"uint256"}],"name":"setMaxMessageBodySize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pauser","type":"address"}],"name":"setPauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"setRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newSignatureThreshold","type":"uint256"}],"name":"setSignatureThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"signatureThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"}] as const;

const ETHERSCAN_BASE = {
  sepolia: 'https://sepolia.etherscan.io/tx/',
  lineaSepolia: 'https://sepolia.lineascan.build/tx/',
  arbitrumSepolia: 'https://sepolia.arbiscan.io/tx/',
  optimismSepolia: 'https://sepolia-optimistic.etherscan.io/tx/',
};

function formatTime(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const truncate = (str: string, len: number = 10) => {
  if (!str) return '';
  if (str.length <= len + 2) return str;
  const separator = '...';
  const charsToShow = len;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return str.substring(0, frontChars + 2) + separator + str.substring(str.length - backChars);
};

const CodeBlock = ({ text }: { text: string }) => (
  <span className="inline-block bg-gray-800 text-gray-200 px-2 py-1 rounded-md font-mono text-xs break-all">
    {text}
  </span>
);

const FormattedMessage = ({ content }: { content: string }) => {
  const parts = content.split(/(`[^`]+`)/g);

  return (
    <p className="text-sm break-words">
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <CodeBlock key={i} text={part.slice(1, -1)} />;
        }
        // Replace **bold** with <strong>
        const boldParts = part.split(/(\*\*.*?\*\*)/g);
        return boldParts.map((boldPart, j) => {
          if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
            return <strong key={`${i}-${j}`}>{boldPart.slice(2, -2)}</strong>;
          }
          return boldPart;
        });
      })}
    </p>
  );
};

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-white transition-colors">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
};

const TransactionCard = ({ txData }: { txData: any }) => {
  if (!txData) return null;

  const details = [
    { label: 'To', value: txData.to, copyable: true },
    { label: 'Value', value: `${formatEther(BigInt(txData.value))} ETH`, copyable: false },
    { label: 'Data', value: txData.data, copyable: true },
  ];

  return (
    <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-600 text-xs">
      <div className="space-y-2">
        {details.map(({ label, value, copyable }) => (
          <div key={label} className="flex justify-between items-center text-gray-300">
            <span className="font-medium text-gray-400">{label}</span>
            <div className="flex items-center space-x-2 font-mono bg-gray-800 px-2 py-1 rounded">
              <span className="break-all">{truncate(value, 18)}</span>
              {copyable && <CopyButton textToCopy={value} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function asHexString(hash: string | undefined): `0x${string}` | undefined {
  if (typeof hash === 'string' && /^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return hash as `0x${string}`;
  }
  return undefined;
}

function parseSwapIntent(prompt: string) {
  // Example: "swap 1 usdc from sepolia to arbitrumSepolia"
  const regex = /swap\s+(\d+(?:\.\d+)?)\s+(\w+)\s+from\s+(\w+)\s+to\s+(\w+)/i;
  const match = prompt.match(regex);
  if (match) {
    return {
      amount: match[1],
      tokenSymbol: match[2],
      fromChain: match[3],
      toChain: match[4],
    };
  }
  return null;
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

  // Professional CCTP flow state
  const [cctpFlow, setCctpFlow] = useState<{
    step: 'idle' | 'approve' | 'burn' | 'attestation' | 'mint' | 'done';
    sourceChain?: string;
    destinationChain?: string;
    amount?: string;
    recipientAddress?: string;
    walletAddress?: string;
    messageHash?: string;
    messageBytes?: string;
    attestation?: string;
    txHashes?: { [step: string]: string };
    error?: string;
    approveTxData?: any;
    burnTxData?: any;
    mintTxData?: any;
  }>({ step: 'idle', txHashes: {} });

  // Helper to start the CCTP flow
  const startCCTPFlow = useCallback((params: {
    sourceChain: string;
    destinationChain: string;
    amount: string;
    recipientAddress: string;
    walletAddress: string;
  }) => {
    setCctpFlow({ step: 'approve', ...params, txHashes: {} });
  }, []);

  // Helper: parse transfer intent from user prompt
  function parseTransferIntent(prompt: string) {
    // Example: "transfer 10 usdc from sepolia to arbitrumSepolia to 0x123..."
    const regex = /transfer\s+(\d+(?:\.\d+)?)\s*usdc\s+from\s+(\w+)\s+to\s+(\w+)\s+to\s+(0x[a-fA-F0-9]{40})/i;
    const match = prompt.match(regex);
    if (match) {
      return {
        amount: match[1],
        sourceChain: match[2],
        destinationChain: match[3],
        recipientAddress: match[4],
      };
    }
    return null;
  }

  // Add swap state:
  const [swapFlow, setSwapFlow] = useState<{
    step: 'idle' | 'quote' | 'approve' | 'done';
    fromChain?: string;
    toChain?: string;
    fromToken?: string;
    toToken?: string;
    amount?: string;
    fromAddress?: string;
    quote?: any;
    error?: string;
    txData?: any;
    txHash?: string;
  }>({ step: 'idle' });

  // Intercept chat submission
  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    const swap = parseSwapIntent(input.trim());
    if (swap && address) {
      append({ role: 'user', content: input });
      append({ role: 'assistant', content: `Fetching swap quote for ${swap.amount} ${swap.tokenSymbol} from ${swap.fromChain} to ${swap.toChain}...` });
      // Remove KNOWN_TOKENS/__zod_schema usage and use a type-safe tokenMap
      const tokenMap: Record<string, Record<string, string>> = {
        sepolia: {
          USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        },
        lineaSepolia: {
          USDC: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
        },
        arbitrumSepolia: {
          USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
        },
        optimismSepolia: {
          USDC: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
        },
      };
      const fromToken = tokenMap[swap.fromChain]?.[swap.tokenSymbol.toUpperCase()];
      const toToken = tokenMap[swap.toChain]?.[swap.tokenSymbol.toUpperCase()];
      if (!fromToken || !toToken) {
        append({ role: 'assistant', content: `❌ Token not supported on selected chains.` });
        return;
      }
      // Convert amount to smallest units (assume 6 decimals for USDC)
      const fromAmount = (BigInt(Math.floor(parseFloat(swap.amount) * 1e6))).toString();
      try {
        const quote = await tools.lifiSwap.execute({
          fromChain: swap.fromChain,
          toChain: swap.toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress: address,
        });
        if (typeof quote === 'object' && 'error' in quote && quote.error) {
          append({ role: 'assistant', content: `❌ Swap quote error: ${quote.error}` });
          return;
        }
        setSwapFlow({
          step: 'quote',
          fromChain: swap.fromChain,
          toChain: swap.toChain,
          fromToken,
          toToken,
          amount: swap.amount,
          fromAddress: address,
          quote,
        });
        const estimate = (typeof quote === 'object' && 'estimate' in quote) ? quote.estimate : undefined;
        append({ role: 'assistant', content: `Swap quote found! Estimated output: ${estimate?.toAmountMin || estimate?.toAmount || '?'} ${swap.tokenSymbol} on ${swap.toChain}.\n\nDo you want to proceed? Type 'yes' to approve and sign the transaction.` });
      } catch (err: any) {
        append({ role: 'assistant', content: `❌ Failed to fetch swap quote: ${err?.message}` });
      }
      return;
    }
    // fallback to normal chat
    handleSubmit(e);
  };

  // Show CCTP progress in chat
  useEffect(() => {
    if (cctpFlow.step === 'approve') {
      append({ role: 'assistant', content: 'Step 1: Approving USDC for transfer...' });
    } else if (cctpFlow.step === 'burn') {
      append({ role: 'assistant', content: 'Step 2: Burning USDC on source chain...' });
    } else if (cctpFlow.step === 'attestation') {
      append({ role: 'assistant', content: 'Step 3: Waiting for attestation...' });
    } else if (cctpFlow.step === 'mint') {
      append({ role: 'assistant', content: 'Step 4: Minting USDC on destination chain...' });
    } else if (cctpFlow.step === 'done') {
      append({ role: 'assistant', content: '✅ USDC transfer complete! Check your wallet on the destination chain.' });
    }
    if (cctpFlow.error) {
      append({ role: 'assistant', content: `❌ Error: ${cctpFlow.error}` });
    }
  }, [cctpFlow.step, cctpFlow.error]);

  // Add useEffect for burn -> attestation
  useEffect(() => {
    if (cctpFlow.step === 'burn' && receipt && receipt.logs) {
      try {
        const topic = 'MessageSent(bytes)';
        if (!topic) {
          setCctpFlow((prev) => ({ ...prev, error: 'Missing event topic for message extraction.' }));
          return;
        }
        const messageBytes = getMessageBytesFromEventLogs(receipt.logs, topic);
        const messageHash = getMessageHashFromBytes(messageBytes);
        setCctpFlow((prev) => ({
          ...prev,
          step: 'attestation',
          messageBytes,
          messageHash,
        }));
      } catch (err: any) {
        setCctpFlow((prev) => ({ ...prev, error: err?.message || 'Failed to extract message bytes' }));
      }
    }
  }, [cctpFlow.step, receipt]);

  // Add useEffect for attestation -> mint
  useEffect(() => {
    const fetchAttestation = async () => {
      if (cctpFlow.step === 'attestation' && cctpFlow.messageHash) {
        try {
          const attestationResult = await pollForAttestation(cctpFlow.messageHash);
          if (attestationResult && typeof attestationResult.message === 'string') {
            setCctpFlow((prev) => ({
              ...prev,
              step: 'mint',
              attestation: attestationResult.message || undefined,
            }));
            append({ role: 'assistant', content: 'Attestation received. Please sign the mint transaction.' });
          } else {
            setCctpFlow((prev) => ({ ...prev, error: 'Attestation not found' }));
          }
        } catch (err: any) {
          setCctpFlow((prev) => ({ ...prev, error: err?.message || 'Attestation polling failed' }));
        }
      }
    };
    fetchAttestation();
    // Only run when step or messageHash changes
  }, [cctpFlow.step, cctpFlow.messageHash]);

  // Add useEffect for mint -> done
  useEffect(() => {
    const doMint = async () => {
      if (cctpFlow.step === 'mint' && cctpFlow.attestation && cctpFlow.messageBytes && cctpFlow.destinationChain && cctpFlow.walletAddress) {
        try {
          // Call backend to get mint transaction data
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const res = await fetch(`${baseUrl}/api/circle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'receiveMessage',
              destinationChain: cctpFlow.destinationChain,
              messageBytes: cctpFlow.messageBytes,
              attestation: cctpFlow.attestation,
              walletAddress: cctpFlow.walletAddress,
            }),
          });
          const data = await res.json();
          if (data.success && data.transactionData) {
            // Prompt user to sign mint transaction
            // You may want to show a button or auto-sign here
            // For now, just set the transaction data in cctpFlow
            setCctpFlow((prev) => ({
              ...prev,
              mintTxData: data.transactionData,
            }));
          } else {
            setCctpFlow((prev) => ({ ...prev, error: data.error || 'Failed to prepare mint transaction' }));
          }
        } catch (err: any) {
          setCctpFlow((prev) => ({ ...prev, error: err?.message || 'Mint step failed' }));
        }
      }
    };
    doMint();
  }, [cctpFlow.step, cctpFlow.attestation, cctpFlow.messageBytes, cctpFlow.destinationChain, cctpFlow.walletAddress]);

  // Add a useEffect to handle the guided CCTP flow
  useEffect(() => {
    // Step 1: After approval is signed and confirmed, prompt for burn
    if (cctpFlow.step === 'approve' && cctpFlow.approveTxData && cctpFlow.txHashes?.approve) {
      // Wait for approval receipt
      const approveHash = asHexString(cctpFlow.txHashes?.approve);
      if (approveHash) {
        const { data: approveReceipt } = useWaitForTransactionReceipt({ hash: approveHash });
        if (approveReceipt && approveReceipt.status === 'success') {
          append({ role: 'assistant', content: 'Approval confirmed. Please sign the burn transaction.' });
          setCctpFlow((prev) => ({ ...prev, step: 'burn' }));
        }
      }
    }
    // Step 2: After burn is signed and confirmed, extract message bytes, get attestation, and prompt for mint
    if (cctpFlow.step === 'burn' && cctpFlow.burnTxData && cctpFlow.txHashes?.burn) {
      const burnHash = asHexString(cctpFlow.txHashes?.burn);
      if (burnHash) {
        const { data: burnReceipt } = useWaitForTransactionReceipt({ hash: burnHash });
        if (burnReceipt && burnReceipt.status === 'success') {
          try {
            const topic = 'MessageSent(bytes)';
            if (!topic) {
              setCctpFlow((prev) => ({ ...prev, error: 'Missing event topic for message extraction.' }));
              return;
            }
            const messageBytes = getMessageBytesFromEventLogs(burnReceipt.logs, topic);
            const messageHash = getMessageHashFromBytes(messageBytes);
            setCctpFlow((prev) => ({ ...prev, messageBytes, messageHash, step: 'attestation' }));
            append({ role: 'assistant', content: 'Burn confirmed. Fetching attestation...' });
          } catch (err: any) {
            setCctpFlow((prev) => ({ ...prev, error: err?.message || 'Failed to extract message bytes' }));
          }
        }
      }
    }
    // Step 3: After attestation is received, prompt for mint
    if (cctpFlow.step === 'attestation' && cctpFlow.messageHash) {
      (async () => {
        try {
          const attestationResult = await pollForAttestation(cctpFlow.messageHash);
          if (attestationResult && typeof attestationResult.message === 'string') {
            setCctpFlow((prev) => ({ ...prev, attestation: attestationResult.message || undefined, step: 'mint' }));
            append({ role: 'assistant', content: 'Attestation received. Please sign the mint transaction.' });
          } else {
            setCctpFlow((prev) => ({ ...prev, error: 'Attestation not found' }));
          }
        } catch (err: any) {
          setCctpFlow((prev) => ({ ...prev, error: err?.message || 'Attestation polling failed' }));
        }
      })();
    }
    // Step 4: After mint is signed and confirmed, show final hash and success
    if (cctpFlow.step === 'mint' && cctpFlow.mintTxData && cctpFlow.txHashes?.mint) {
      const mintHash = asHexString(cctpFlow.txHashes?.mint);
      if (mintHash) {
        const { data: mintReceipt } = useWaitForTransactionReceipt({ hash: mintHash });
        if (mintReceipt && mintReceipt.status === 'success') {
          setCctpFlow((prev) => ({ ...prev, step: 'done' }));
          append({ role: 'assistant', content: `✅ USDC transfer complete! Final transaction hash: ${cctpFlow.txHashes.mint}` });
        }
      }
    }
  }, [cctpFlow, append]);

  // Add effect to listen for user confirmation to proceed with swap
  useEffect(() => {
    if (swapFlow.step === 'quote' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user' && lastMsg.content.trim().toLowerCase() === 'yes') {
        // Prepare transaction data for signing
        const txData = swapFlow.quote?.transactionRequest;
        if (!txData) {
          append({ role: 'assistant', content: '❌ No transaction data available for this swap.' });
          return;
        }
        setSwapFlow((prev) => ({ ...prev, step: 'approve', txData }));
        append({ role: 'assistant', content: 'Please sign the swap transaction in your wallet.' });
      }
    }
  }, [swapFlow, messages]);

  // Add effect to send transaction when in approve step
  useEffect(() => {
    if (swapFlow.step === 'approve' && swapFlow.txData) {
      (async () => {
        try {
          // Use wagmi's sendTransaction hook, which is already set up
          sendTransaction({
            to: swapFlow.txData.to,
            data: swapFlow.txData.data,
            value: swapFlow.txData.value ? BigInt(swapFlow.txData.value) : BigInt(0),
          });
          setSwapFlow((prev) => ({ ...prev, step: 'done', txHash: undefined }));
          append({ role: 'assistant', content: `✅ Swap transaction sent! Please check your wallet for confirmation.` });
        } catch (err: any) {
          setSwapFlow((prev) => ({ ...prev, error: err?.message || 'Swap transaction failed' }));
          append({ role: 'assistant', content: `❌ Swap transaction failed: ${err?.message}` });
        }
      })();
    }
  }, [swapFlow.step, swapFlow.txData]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignTransaction = async (toolName: string, transactionData: any) => {
    try {
      if (!transactionData || !transactionData.to) {
        toast.error('Invalid transaction data.');
        return;
      }
      const tx = await sendTransaction({
        to: transactionData.to,
        data: transactionData.data,
        value: transactionData.value ? BigInt(transactionData.value) : BigInt(0),
      });
      const hexTxHash = asHexString(transactionData.hash);
      if (hexTxHash) {
        setPendingTx({ hash: hexTxHash, toolName });
        setCctpFlow((prev) => {
          const txHashes = { ...prev.txHashes };
          if (toolName === 'approve') txHashes.approve = hexTxHash;
          if (toolName === 'burn') txHashes.burn = hexTxHash;
          if (toolName === 'mint') txHashes.mint = hexTxHash;
          return {
            ...prev,
            txHashes,
            [`${toolName}TxData`]: transactionData,
          };
        });
        toast.success('Transaction sent!');
      } else {
        toast.error('Failed to get valid transaction hash from transactionData.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Transaction failed.');
    }
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
                    className={`max-w-[90%] break-words whitespace-pre-line rounded-lg px-4 py-3 ${
                      isAI
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {isAI && (
                        <Bot className="h-4 w-4 mt-1 text-emerald-400 flex-shrink-0" />
                      )}
                      {!isAI && (
                        <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                      )}
                      <div className="w-full">
                        <FormattedMessage content={message.content} />
                        {/* Tool results */}
                        {Array.isArray(message.toolInvocations) && message.toolInvocations.map((toolInvocation) => {
                          const { toolName, toolCallId, state } = toolInvocation;
                          if (state === "result") {
                            const result = (toolInvocation as any).result;
                            if (result.success && result.transactionData) {
                              return (
                                <div key={toolCallId} className="w-full mt-2">
                                  <p className="text-sm text-gray-100">{result.message}</p>
                                  <TransactionCard txData={result.transactionData} />
                                  <Button
                                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
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
          <form className="p-4 border-t border-gray-700" onSubmit={handleChatSubmit}>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your portfolio or transfer USDC..."
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