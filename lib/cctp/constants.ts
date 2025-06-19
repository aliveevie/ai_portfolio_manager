import { lineaSepolia, sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";

// Circle-defined domain IDs for CCTP
export const CCTP_DOMAINS = {
  [sepolia.id]: 0,        // Ethereum Sepolia
  [lineaSepolia.id]: 1,   // Linea Sepolia  
  [arbitrumSepolia.id]: 3, // Arbitrum Sepolia
  [optimismSepolia.id]: 2, // Optimism Sepolia
} as const;

// CCTP Contract addresses for each network
export const CCTP_CONTRACTS = {
  [sepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0x7865fafc2db2093669d92c0f33aeef291086befd",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
  [lineaSepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0x7865fafc2db2093669d92c0f33aeef291086befd",
    usdc: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  },
  [arbitrumSepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0xacf1ceef35caac005e15888ddb8a3515c41b4872",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  },
  [optimismSepolia.id]: {
    tokenMessenger: "0x9f3b8679c73c2fef8b59b4f3444d4e156fb70aa5",
    messageTransmitter: "0x7865fafc2db2093669d92c0f33aeef291086befd",
    usdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  },
} as const;

// Network name mappings
export const NETWORK_NAMES = {
  [sepolia.id]: "sepolia",
  [lineaSepolia.id]: "lineaSepolia", 
  [arbitrumSepolia.id]: "arbitrumSepolia",
  [optimismSepolia.id]: "optimismSepolia",
} as const;

// Attestation service URL
export const IRIS_ATTESTATION_API_URL = "https://iris-api-sandbox.circle.com";

// Polling intervals
export const DEFAULT_BLOCKCHAIN_DELAY = 1000; // 1 second
export const DEFAULT_API_DELAY = 5000; // 5 seconds

// USDC decimals
export const USDC_DECIMALS = 6; 