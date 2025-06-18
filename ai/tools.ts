import { tool as createTool } from "ai";
import { z } from "zod";
import { publicClient } from "@/wagmi.config"; 
import { formatEther } from "viem";
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
  
export const tools = {
     displayBalance: balanceTool,
     multiNetworkBalance: multiNetworkBalanceTool,
     sendTransaction: sendTransactionTool,
};