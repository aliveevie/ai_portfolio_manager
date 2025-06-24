import { tool as createTool } from "ai";
import { z } from "zod";
import { publicClient } from "@/wagmi.config"; 
import { formatEther, formatUnits, getAddress } from "viem";
import { createPublicClient, http } from "viem";
import { lineaSepolia, sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";

// Create public clients for each network
const lineaSepoliaClient = createPublicClient({
  chain: lineaSepolia,
  transport: http(),
});

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

const optimismSepoliaClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(),
});

// ERC20 Token ABI for balance checking
const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
] as const;

// Updated token addresses with verified addresses for each testnet
const KNOWN_TOKENS = {
  sepolia: {
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    USDT: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    DAI: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  },
  lineaSepolia: {
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    USDC: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
    USDT: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
    DAI: "0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5",
    WETH: "0x2C1b868d6596a18e32E61B901E4060C872647b6C",
  },
  arbitrumSepolia: {
    LINK: "0xf97f4df75117a78c1A5a0DBb814af92458539FB4",
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    USDT: "0x2e8F5e00a9c5D450a72700546B89eCc8c56e4e8A",
    DAI: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    WETH: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
  },
  optimismSepolia: {
    LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    USDC: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    USDT: "0x2e8F5e00a9c5D450a72700546B89eCc8c56e4e8A",
    DAI: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    WETH: "0x4200000000000000000000000000000000000006",
  },
};

// Helper function to safely get token info with better error handling
async function getTokenInfo(client: any, tokenAddress: string, userAddress: string) {
  try {
    // Validate addresses first
    if (!tokenAddress || !userAddress) {
      return null;
    }

    // Try to get token info with individual error handling for each call
    let balance, decimals, symbol, name;
    
    try {
      balance = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      });
    } catch (error) {
      return null; // If balanceOf fails, token doesn't exist or is invalid
    }

    try {
      decimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
      });
    } catch (error) {
      decimals = 18; // Default to 18 decimals if call fails
    }

    try {
      symbol = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'symbol',
      });
    } catch (error) {
      symbol = "UNKNOWN"; // Default symbol if call fails
    }

    try {
      name = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'name',
      });
    } catch (error) {
      name = "Unknown Token"; // Default name if call fails
    }

    const formattedBalance = formatUnits(balance as bigint, decimals as number);
    
    // Only return if balance is greater than 0
    if (parseFloat(formattedBalance) > 0) {
      return {
        balance: formattedBalance,
        symbol: symbol as string,
        name: name as string,
        address: tokenAddress,
        decimals: decimals as number,
      };
    }
    
    return null;
  } catch (error) {
    // Silently handle errors for individual tokens
    return null;
  }
}

const balanceTool = createTool({
     description: "Get the balance of the connected wallet",
     parameters: z.object({
       address: z.string().describe("The address of the user"),
     }),
     execute: async ({ address }) => {
       const balance = await publicClient.getBalance({
         address: address as `0x${string}`,
       });
       return { balance: formatEther(balance) };
     },
   });

const multiNetworkBalanceTool = createTool({
  description: "Get the balance of a wallet address across multiple networks (Linea Sepolia, Sepolia, Arbitrum Sepolia, Optimism Sepolia)",
  parameters: z.object({
    address: z.string().describe("The wallet address to check balances for"),
  }),
  execute: async ({ address }) => {
    try {
      const [lineaBalance, sepoliaBalance, arbitrumBalance, optimismBalance] = await Promise.all([
        lineaSepoliaClient.getBalance({ address: address as `0x${string}` }),
        sepoliaClient.getBalance({ address: address as `0x${string}` }),
        arbitrumSepoliaClient.getBalance({ address: address as `0x${string}` }),
        optimismSepoliaClient.getBalance({ address: address as `0x${string}` }),
      ]);

      return {
        lineaSepolia: formatEther(lineaBalance),
        sepolia: formatEther(sepoliaBalance),
        arbitrumSepolia: formatEther(arbitrumBalance),
        optimismSepolia: formatEther(optimismBalance),
      };
    } catch (error) {
      return { error: "Failed to fetch balances across networks" };
    }
  },
});

const tokenBalanceTool = createTool({
  description: "Get the balance of any ERC20 token (including LINK, USDC, USDT, DAI, WETH, or any custom token) across multiple networks",
  parameters: z.object({
    address: z.string().describe("The wallet address to check token balances for"),
    tokenSymbol: z.string().optional().describe("Token symbol (e.g., 'LINK', 'USDC', 'USDT', 'DAI', 'WETH') or leave empty to check all known tokens"),
    tokenAddress: z.string().optional().describe("Custom token contract address (if not using a known token symbol)"),
    network: z.enum(["sepolia", "lineaSepolia", "arbitrumSepolia", "optimismSepolia", "all"]).optional().describe("Specific network to check or 'all' for all networks"),
  }),
  execute: async ({ address, tokenSymbol, tokenAddress, network = "all" }) => {
    try {
      const networks = network === "all" 
        ? ["sepolia", "lineaSepolia", "arbitrumSepolia", "optimismSepolia"] 
        : [network];
      
      const clients = {
        sepolia: sepoliaClient,
        lineaSepolia: lineaSepoliaClient,
        arbitrumSepolia: arbitrumSepoliaClient,
        optimismSepolia: optimismSepoliaClient,
      };

      const results: any = {};

      for (const net of networks) {
        const client = clients[net as keyof typeof clients];
        results[net] = {};

        if (tokenAddress) {
          // Check specific token address
          const tokenInfo = await getTokenInfo(client, tokenAddress, address);
          if (tokenInfo) {
            results[net][tokenInfo.symbol] = tokenInfo;
          }
        } else if (tokenSymbol) {
          // Check specific known token
          const knownTokens = KNOWN_TOKENS[net as keyof typeof KNOWN_TOKENS];
          const tokenAddr = knownTokens[tokenSymbol.toUpperCase() as keyof typeof knownTokens];
          
          if (tokenAddr) {
            const tokenInfo = await getTokenInfo(client, tokenAddr, address);
            if (tokenInfo) {
              results[net][tokenInfo.symbol] = tokenInfo;
            }
          }
        } else {
          // Check all known tokens
          const knownTokens = KNOWN_TOKENS[net as keyof typeof KNOWN_TOKENS];
          
          // Process tokens sequentially to avoid overwhelming the RPC
          for (const [symbol, tokenAddr] of Object.entries(knownTokens)) {
            const tokenInfo = await getTokenInfo(client, tokenAddr, address);
            if (tokenInfo) {
              results[net][tokenInfo.symbol] = tokenInfo;
            }
          }
        }
      }

      // Remove empty network results
      Object.keys(results).forEach(net => {
        if (Object.keys(results[net]).length === 0) {
          delete results[net];
        }
      });

      return results;
    } catch (error) {
      console.error("Error in tokenBalanceTool:", error);
      return { error: "Failed to fetch token balances" };
    }
  },
});

const sendTransactionTool = createTool({
    description: "Initiate a transaction to the provided wallet address",
    parameters: z.object({
      to: z.string().describe("The wallet address of the user"),
      amount: z.string().describe("The amount of ether to send"),
    }),
    execute: async ({ to, amount }) => {
      return { to, amount };
    },
});

// Individual CCTP tools for step-by-step operations
const approveUSDCTool = createTool({
  description: "Approve USDC spending for cross-chain transfers",
  parameters: z.object({
    sourceChain: z.enum(["sepolia", "lineaSepolia", "arbitrumSepolia", "optimismSepolia"]).describe("The source chain"),
    amount: z.string().describe("The amount of USDC to approve"),
    walletAddress: z.string().describe("The wallet address to approve from"),
  }),
  execute: async ({ sourceChain, amount, walletAddress }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/circle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          sourceChain,
          amount,
          walletAddress,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { error: `Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
});

const depositForBurnTool = createTool({
  description: "Burn USDC on source chain for cross-chain transfer",
  parameters: z.object({
    sourceChain: z.enum(["sepolia", "lineaSepolia", "arbitrumSepolia", "optimismSepolia"]).describe("The source chain"),
    destinationChain: z.enum(["sepolia", "lineaSepolia", "arbitrumSepolia", "optimismSepolia"]).describe("The destination chain"),
    amount: z.string().describe("The amount of USDC to burn"),
    recipientAddress: z.string().describe("The recipient address on destination chain"),
    walletAddress: z.string().describe("The sender wallet address"),
  }),
  execute: async ({ sourceChain, destinationChain, amount, recipientAddress, walletAddress }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/circle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "depositForBurn",
          sourceChain,
          destinationChain,
          amount,
          recipientAddress,
          walletAddress,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { error: `DepositForBurn failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
});

const getAttestationTool = createTool({
  description: "Get attestation for a cross-chain transfer message",
  parameters: z.object({
    messageHash: z.string().describe("The message hash from the depositForBurn transaction"),
  }),
  execute: async ({ messageHash }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/circle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getAttestation",
          messageHash,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { error: `Attestation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
});

const receiveMessageTool = createTool({
  description: "Mint USDC on destination chain using message and attestation",
  parameters: z.object({
    destinationChain: z.enum(["sepolia", "lineaSepolia", "arbitrumSepolia", "optimismSepolia"]).describe("The destination chain"),
    messageBytes: z.string().describe("The message bytes from attestation"),
    attestation: z.string().describe("The attestation signature"),
    walletAddress: z.string().describe("The recipient wallet address"),
  }),
  execute: async ({ destinationChain, messageBytes, attestation, walletAddress }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/circle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "receiveMessage",
          destinationChain,
          messageBytes,
          attestation,
          walletAddress,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { error: `ReceiveMessage failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },
});

// --- AI Recommendation Tool ---
import { z as zod } from "zod";

const aiRecommendationTool = createTool({
  description: "Get AI-powered investment recommendations for real/testnet tokens based on wallet balances and price changes.",
  parameters: zod.object({
    address: zod.string().describe("The wallet address to analyze for recommendations"),
  }),
  execute: async ({ address }) => {
    // For demo: Use testnet ETH balances as 'tokens' and mock price changes
    const networks = [
      { key: "sepolia", label: "Sepolia" },
      { key: "lineaSepolia", label: "Linea" },
      { key: "arbitrumSepolia", label: "Arbitrum" },
      { key: "optimismSepolia", label: "Optimism" },
    ];
    const clients = {
      sepolia: sepoliaClient,
      lineaSepolia: lineaSepoliaClient,
      arbitrumSepolia: arbitrumSepoliaClient,
      optimismSepolia: optimismSepoliaClient,
    };
    // Simulate price and change for each network (in real app, fetch from price API)
    const priceMap = {
      sepolia: { price: 1875.3, change: 2.4 },
      lineaSepolia: { price: 485.2, change: -1.2 },
      arbitrumSepolia: { price: 180.45, change: 0.8 },
      optimismSepolia: { price: 92.1, change: 3.1 },
    };
    // Heuristic for recommendation
    function getRecommendation(change: number) {
      if (change > 2) return { action: "Strong Buy", confidence: 92, note: "Positive momentum expected" };
      if (change < -1) return { action: "Consider Sell", confidence: 78, note: "Negative trend detected" };
      return { action: "Hold", confidence: 85, note: "Stable performance expected" };
    }
    // Fetch balances and build recommendations
    const recs = [];
    for (const net of networks) {
      try {
        const balance = await clients[net.key as keyof typeof clients].getBalance({ address: address as `0x${string}` });
        const { price, change } = priceMap[net.key as keyof typeof priceMap];
        const { action, confidence, note } = getRecommendation(change);
        recs.push({
          symbol: net.label.toUpperCase(),
          action,
          price,
          change,
          confidence,
          note: `${note} (Balance: ${formatEther(balance)} ETH)`
        });
      } catch (e) {
        // skip network if error
      }
    }
    return recs;
  },
});

export const tools = {
     displayBalance: balanceTool,
     multiNetworkBalance: multiNetworkBalanceTool,
     tokenBalance: tokenBalanceTool,
     sendTransaction: sendTransactionTool,
     approveUSDC: approveUSDCTool,
     depositForBurn: depositForBurnTool,
     getAttestation: getAttestationTool,
     receiveMessage: receiveMessageTool,
     aiRecommendation: aiRecommendationTool,
};