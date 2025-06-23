import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { publicClient } from "@/wagmi.config";
import { createPublicClient, http } from "viem";
import { lineaSepolia, sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";
import { getAllETHPrices, calculatePortfolioValue, PortfolioData } from "../priceFeeds";

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

export function usePortfolio() {
  const { address, isConnected } = useAccount();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    if (!address || !isConnected) {
      setPortfolioData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch balances across all networks
      const [lineaBalance, sepoliaBalance, arbitrumBalance, optimismBalance] = await Promise.all([
        lineaSepoliaClient.getBalance({ address: address as `0x${string}` }),
        sepoliaClient.getBalance({ address: address as `0x${string}` }),
        arbitrumSepoliaClient.getBalance({ address: address as `0x${string}` }),
        optimismSepoliaClient.getBalance({ address: address as `0x${string}` }),
      ]);

      const balances = {
        lineaSepolia: parseFloat(formatEther(lineaBalance)),
        sepolia: parseFloat(formatEther(sepoliaBalance)),
        arbitrumSepolia: parseFloat(formatEther(arbitrumBalance)),
        optimismSepolia: parseFloat(formatEther(optimismBalance)),
      };

      // Fetch ETH prices from Chainlink price feeds
      const prices = await getAllETHPrices();
      
      // Extract just the price values
      const priceValues: { [network: string]: number } = {};
      Object.keys(prices).forEach(network => {
        priceValues[network] = prices[network].price;
      });

      // Calculate portfolio value
      const portfolio = calculatePortfolioValue(balances, priceValues);
      
      setPortfolioData(portfolio);
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setError("Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchPortfolioData, 30000);
    
    return () => clearInterval(interval);
  }, [address, isConnected]);

  return {
    portfolioData,
    loading,
    error,
    refetch: fetchPortfolioData,
  };
} 