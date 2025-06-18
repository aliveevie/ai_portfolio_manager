import { ethers } from "ethers";

// Chainlink AggregatorV3Interface ABI
export const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// ETH/USD Price Feed addresses for different networks
export const ETH_PRICE_FEEDS = {
  sepolia: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD on Sepolia
  lineaSepolia: "0x4aDC67696bA383cC43E6Ea7494F3260277CE36B9", // ETH/USD on Linea Sepolia
  arbitrumSepolia: "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08", // ETH/USD on Arbitrum Sepolia
  optimismSepolia: "0x4aDC67696bA383cC43E6Ea7494F3260277CE36B9", // ETH/USD on Optimism Sepolia
};

// RPC URLs for different networks
export const RPC_URLS = {
  sepolia: "https://rpc.ankr.com/eth_sepolia",
  lineaSepolia: "https://rpc.sepolia.linea.build",
  arbitrumSepolia: "https://sepolia-rollup.arbitrum.io/rpc",
  optimismSepolia: "https://sepolia.optimism.io",
};

export interface PriceData {
  price: number;
  timestamp: number;
  network: string;
}

export interface PortfolioData {
  total: number;
  invested: number;
  gain: number;
  today: number;
  todayPct: number;
  aiScore: number;
  balances: {
    [network: string]: number;
  };
  prices: {
    [network: string]: number;
  };
}

// Function to get ETH price from Chainlink price feed
export async function getETHPrice(network: keyof typeof ETH_PRICE_FEEDS): Promise<PriceData> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[network]);
    const priceFeed = new ethers.Contract(
      ETH_PRICE_FEEDS[network],
      aggregatorV3InterfaceABI,
      provider
    );

    const roundData = await priceFeed.latestRoundData();
    const price = parseFloat(ethers.utils.formatUnits(roundData.answer, 8)); // ETH/USD has 8 decimals
    
    return {
      price,
      timestamp: roundData.updatedAt.toNumber() * 1000, // Convert to milliseconds
      network,
    };
  } catch (error) {
    console.error(`Error fetching ETH price for ${network}:`, error);
    // Fallback to a default price if the price feed fails
    return {
      price: 3000, // Fallback price
      timestamp: Date.now(),
      network,
    };
  }
}

// Function to get all ETH prices across networks
export async function getAllETHPrices(): Promise<{ [network: string]: PriceData }> {
  const networks = Object.keys(ETH_PRICE_FEEDS) as Array<keyof typeof ETH_PRICE_FEEDS>;
  const pricePromises = networks.map(network => getETHPrice(network));
  
  try {
    const prices = await Promise.all(pricePromises);
    const priceMap: { [network: string]: PriceData } = {};
    
    prices.forEach(priceData => {
      priceMap[priceData.network] = priceData;
    });
    
    return priceMap;
  } catch (error) {
    console.error("Error fetching all ETH prices:", error);
    return {};
  }
}

// Function to calculate portfolio value from balances and prices
export function calculatePortfolioValue(
  balances: { [network: string]: number },
  prices: { [network: string]: number }
): PortfolioData {
  let total = 0;
  let totalInvested = 0; // This would come from historical data in a real app
  
  // Calculate total value
  Object.keys(balances).forEach(network => {
    const balance = balances[network];
    const price = prices[network] || 0;
    total += balance * price;
  });
  
  // For demo purposes, assume invested amount is 90% of current total
  totalInvested = total * 0.9;
  const gain = total - totalInvested;
  
  // Calculate today's change (mock data for now)
  const today = gain * 0.1; // 10% of total gain as today's change
  const todayPct = (today / total) * 100;
  
  // Calculate AI score based on portfolio performance
  const aiScore = Math.min(10, Math.max(1, 5 + (gain / totalInvested) * 5));
  
  return {
    total,
    invested: totalInvested,
    gain,
    today,
    todayPct,
    aiScore: Math.round(aiScore * 10) / 10,
    balances,
    prices,
  };
} 