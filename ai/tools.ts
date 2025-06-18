import { tool as createTool } from "ai";
import { z } from "zod";
import { publicClient } from "@/wagmi.config"; 
import { formatEther } from "viem";

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
     sendTransaction: sendTransactionTool,
};