import { keccak256, defaultAbiCoder } from "viem";
import type { Log } from "viem";

/**
 * Converts an address to bytes32 format for CCTP
 * @param address The address to convert
 * @returns The address in bytes32 format
 */
export function addressToBytes32(address: string): `0x${string}` {
  return `0x000000000000000000000000${address.slice(2)}` as `0x${string}`;
}

/**
 * Extracts message bytes from transaction logs
 * @param logs The transaction logs
 * @param topic The topic to filter for
 * @returns The message bytes
 */
export function getMessageBytesFromEventLogs(
  logs: Log[],
  topic: string
): `0x${string}` {
  const eventTopic = keccak256(topic as `0x${string}`);
  const log = logs.find((l) => l.topics[0] === eventTopic);
  if (!log) {
    throw new Error("MessageSent event not found in logs");
  }
  return defaultAbiCoder.decode(["bytes"], log.data)[0] as `0x${string}`;
}

/**
 * Generates message hash from message bytes
 * @param message The message bytes
 * @returns The message hash
 */
export function getMessageHashFromBytes(message: `0x${string}`): string {
  return keccak256(message);
}

/**
 * Generates a unique idempotency key for transactions
 * @returns A unique idempotency key
 */
export function generateIdempotencyKey(): string {
  return `cctp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats USDC amount to smallest unit (6 decimals)
 * @param amount The amount in USDC units
 * @returns The amount in smallest units
 */
export function formatUSDCAmount(amount: string): string {
  const usdcAmount = parseFloat(amount);
  if (isNaN(usdcAmount) || usdcAmount <= 0) {
    throw new Error(`Invalid USDC amount: ${amount}`);
  }
  return Math.floor(usdcAmount * 1000000).toString();
}

/**
 * Validates if a chain ID is supported for CCTP
 * @param chainId The chain ID to validate
 * @returns True if supported, false otherwise
 */
export function isSupportedChain(chainId: number): boolean {
  return [11155111, 59141, 421614, 11155420].includes(chainId);
} 