"use client";

import { ConnectButton } from "@/components/ConnectButton";
import { Chat } from "@/components/Chat";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { ChatWidget } from "@/components/ChatWidget";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import dynamic from 'next/dynamic';
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

// Dynamically import LiFiWidget for SSR safety

// Define the widget config for professional appearance
const widgetConfig: WidgetConfig = {
  theme: {
    container: {
      border: '1px solid rgb(234, 234, 234)',
      borderRadius: '16px',
    },
  },
};

export const Dashboard = () => {
  const { isConnected, address } = useAccount();
  const [tab, setTab] = useState("1D");
  const { portfolioData, loading, error } = usePortfolio();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  // Add widget modal state
  const [showLifiWidget, setShowLifiWidget] = useState(false);

  // Fetch AI recommendations when address changes
  useEffect(() => {
    if (!address) {
      setRecommendations([]);
      return;
    }
    setRecLoading(true);
    setRecError(null);
    fetch("/api/ai-recommendations?address=" + address)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        return res.json();
      })
      .then((data) => {
        setRecommendations(data);
        setRecLoading(false);
      })
      .catch((err) => {
        setRecError(err.message || "Unknown error");
        setRecLoading(false);
      });
  }, [address]);

  // Calculate real allocation based on actual balances
  const calculateRealAllocation = () => {
    if (!portfolioData) return [];
    const totalValue = portfolioData.total;
    if (totalValue === 0) return [];
    const allocation: { label: string; value: number; color: string; }[] = [];
    Object.keys(portfolioData.balances).forEach(network => {
      const balance = portfolioData.balances[network];
      const price = portfolioData.prices[network] || 0;
      const value = balance * price;
      const percentage = (value / totalValue) * 100;
      if (percentage > 0) {
        allocation.push({
          label: network.charAt(0).toUpperCase() + network.slice(1),
          value: Math.round(percentage * 100) / 100,
          color: getNetworkColor(network),
        });
      }
    });
    return allocation;
  };

  const getNetworkColor = (network: string) => {
    const colors = {
      sepolia: "#22d3ee",
      lineaSepolia: "#818cf8", 
      arbitrumSepolia: "#a78bfa",
      optimismSepolia: "#fbbf24",
    };
    return colors[network as keyof typeof colors] || "#a3a3a3";
  };

  const realAllocation = calculateRealAllocation();

  // Simulate historical data for the performance chart
  const generatePerformanceData = () => {
    if (!portfolioData) return [];
    const now = new Date();
    let points = 0;
    let interval = 1; // in hours
    switch (tab) {
      case '1D': points = 24; interval = 1; break;
      case '1W': points = 7; interval = 24; break;
      case '1M': points = 30; interval = 24; break;
      case '3M': points = 12; interval = 7 * 24; break;
      case '1Y': points = 12; interval = 30 * 24; break;
      case 'ALL': points = 24; interval = 30 * 24; break;
      default: points = 24; interval = 1;
    }
    // Simulate a random walk for demo, starting from invested up to total
    const start = portfolioData.invested;
    const end = portfolioData.total;
    const data = [];
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      // Linear interpolation + some noise
      const value = start + (end - start) * t + (Math.random() - 0.5) * (end - start) * 0.03;
      const date = new Date(now.getTime() - (points - 1 - i) * interval * 60 * 60 * 1000);
      data.push({
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: Math.max(0, value),
      });
    }
    return data;
  };
  const performanceData = generatePerformanceData();

  return (
    <div className="min-h-screen bg-[#181f2a] text-white p-6 sm:p-10 font-sans">
      {/* Li.Fi Widget Button at the top */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold"
          onClick={() => setShowLifiWidget(true)}
        >
          Open Li.Fi Widget
        </button>
      </div>
      {/* Widget Modal */}
      {showLifiWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-4 relative w-[400px] max-w-full">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowLifiWidget(false)}
            >
              ✕
            </button>
            {/* Official Li.Fi Widget integration */}
            <LiFiWidget integrator="AI Portfolio Manager" config={widgetConfig} />
          </div>
        </div>
      )}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-green-300 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          AI Portfolio Manager
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">AI Engine Active</span>
          <ConnectButton />
          <div className="rounded-full bg-gray-700 px-4 py-2 text-sm font-medium"></div>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Overview */}
        <section className="col-span-2 bg-[#232b3b] rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Portfolio Overview</h2>
              {loading ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  <span className="text-gray-400">Loading portfolio data...</span>
                </div>
              ) : error ? (
                <div className="text-red-400 mt-2">Error: {error}</div>
              ) : !isConnected ? (
                <div className="text-gray-400 mt-2">Please connect your wallet to view portfolio</div>
              ) : portfolioData ? (
                <>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold">${portfolioData.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`text-sm ${portfolioData.today >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {portfolioData.today >= 0 ? "+" : ""}${portfolioData.today.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({portfolioData.todayPct >= 0 ? "+" : ""}{portfolioData.todayPct.toFixed(2)}%) Today
                    </span>
                  </div>
                  <div className="flex gap-8 mt-4 text-gray-300">
                    <div>
                      <div className="font-bold text-white">${portfolioData.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-xs">Total Invested</div>
                    </div>
                    <div>
                      <div className={`font-bold ${portfolioData.gain >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {portfolioData.gain >= 0 ? "+" : ""}${portfolioData.gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs">Total Gain</div>
                    </div>
                    <div>
                      <div className="font-bold text-blue-400">{portfolioData.aiScore}/10</div>
                      <div className="text-xs">AI Score</div>
                    </div>
                  </div>
                  {/* Network Balances */}
                  <div className="mt-4 p-3 bg-[#1a2233] rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">Network Balances</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(portfolioData.balances).map(network => {
                        const balance = portfolioData.balances[network];
                        const price = portfolioData.prices[network] || 0;
                        const value = balance * price;
                        return (
                          <div key={network} className="flex justify-between text-xs">
                            <span className="text-gray-300">{network.charAt(0).toUpperCase() + network.slice(1)}:</span>
                            <span className="text-white">
                              {balance.toFixed(4)} ETH (${value.toFixed(2)})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 mt-2">No portfolio data available</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="flex items-center gap-2 text-green-400 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {loading ? "Loading..." : "Live"}
              </span>
            </div>
          </div>
        </section>
        {/* AI Recommendations */}
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">AI Recommendations</h2>
            <span className="text-xs text-gray-400">{recLoading ? "Loading..." : "Updated just now"}</span>
          </div>
          {!isConnected ? (
            <div className="text-gray-400 mt-2">Please connect your wallet to view recommendations</div>
          ) : recLoading ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-gray-400">Loading recommendations...</span>
            </div>
          ) : recError ? (
            <div className="text-red-400 mt-2">Error: {recError}</div>
          ) : recommendations.length === 0 ? (
            <div className="text-gray-400 mt-2">No recommendations available</div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.symbol} className="bg-[#1a2233] rounded-lg p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">{rec.symbol} <span className={`ml-2 text-xs px-2 py-1 rounded ${rec.action === "Strong Buy" ? "bg-green-900 text-green-300" : rec.action === "Hold" ? "bg-yellow-900 text-yellow-300" : "bg-red-900 text-red-300"}`}>{rec.action}</span></div>
                  <div className="text-right">
                    <div className="font-bold text-xl">${rec.price.toFixed(2)}</div>
                    <div className={`text-sm ${rec.change >= 0 ? "text-green-400" : "text-red-400"}`}>{rec.change >= 0 ? "+" : ""}{rec.change}%</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">AI Confidence <span className="font-bold text-white ml-1">{rec.confidence}%</span></div>
                <div className="w-full bg-gray-700 h-2 rounded mt-1 mb-2"><div className="h-2 rounded" style={{ width: `${rec.confidence}%`, background: rec.action === "Strong Buy" ? "#22d3ee" : rec.action === "Hold" ? "#fbbf24" : "#f87171" }}></div></div>
                <div className="text-xs text-gray-300">{rec.note}</div>
              </div>
            ))
          )}
        </section>
      </div>
      {/* Performance & Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <section className="col-span-2 bg-[#232b3b] rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 3v18h18" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/></svg> Portfolio Performance</h2>
          <div className="flex gap-4 mb-4">
            {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab === t ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}>{t}</button>
            ))}
          </div>
          <div className="h-56">
            {loading || !portfolioData ? (
              <div className="flex items-center justify-center h-full text-gray-400">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[dataMin => Math.floor(dataMin * 0.98), dataMax => Math.ceil(dataMax * 1.02)]} />
                  <Tooltip contentStyle={{ background: '#232b3b', border: 'none', color: '#fff' }} formatter={(v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} name="Portfolio Value" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="2"/></svg> Asset Allocation</h2>
          <div className="h-56 flex flex-col items-center justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={realAllocation}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  isAnimationActive={false}
                >
                  {realAllocation.map((entry, idx) => (
                    <Cell key={`cell-${entry.label}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#232b3b', border: 'none', color: '#fff', fontSize: 14 }} 
                  formatter={(v, n, p) => [`${v}%`, p?.payload?.label]} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -60%)', pointerEvents: 'none' }}>
              <span className="text-lg font-bold text-white">Total Allocation</span>
              <span className="text-2xl font-bold text-blue-300">{realAllocation.reduce((sum, a) => sum + a.value, 0).toFixed(1)}%</span>
            </div>
          </div>
          {/* Horizontal legend below chart */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {realAllocation.map((a) => (
              <div key={a.label} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: a.color }}></span>
                <span className="text-gray-200">{a.label}</span>
                <span className="font-bold text-white">{a.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* Risk, Trades, News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v10l6 4" stroke="#fbbf24" strokeWidth="2"/></svg> Risk Analysis</h2>
          <div className="flex flex-col gap-2">
            <div className="bg-[#1a2233] rounded-lg p-4 text-center mb-2">
              <div className="text-gray-300 text-sm mb-1">BTC Realized Price (Short-Term Holders)</div>
              <div className="text-2xl font-bold text-blue-300">$98,200</div>
            </div>
            <div className="bg-[#1a2233] rounded-lg p-4 text-center">
              <div className="text-gray-300 text-sm mb-1">ETH Realized Price (Short-Term Holders)</div>
              <div className="text-2xl font-bold text-purple-300">$3,200</div>
            </div>
          </div>
        </section>
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="#22d3ee" strokeWidth="2"/></svg> Recent Trades</h2>
          <div className="flex flex-col gap-2">
            <div className="bg-[#1a2233] rounded-lg p-4 text-xs text-gray-200">
              <div className="font-bold text-base mb-2">BTC/USDT Recent Trades (WhiteBIT)</div>
              <div className="grid grid-cols-3 gap-2 mb-1 text-gray-400">
                <span>Price</span><span>Amount</span><span>Type</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-1">
                <span className="text-green-400">$101,000</span><span>0.25</span><span>Buy</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-1">
                <span className="text-red-400">$100,950</span><span>0.10</span><span>Sell</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-1">
                <span className="text-green-400">$101,020</span><span>0.05</span><span>Buy</span>
              </div>
            </div>
          </div>
          <button className="mt-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-4 py-2 text-xs" disabled>View All Trades</button>
        </section>
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#22d3ee" strokeWidth="2"/></svg> Market News</h2>
          <div className="flex flex-col gap-2">
            <div className="bg-[#1a2233] rounded-lg p-4 text-gray-200">
              <div className="font-bold text-base mb-4">Latest Crypto Headlines</div>
              <div className="flex flex-col gap-4">
                <a href="https://www.coindesk.com/markets/2025/06/23/bitcoin-bounces-after-war-driven-dip-usd98-2k-emerges-as-key-level-to-maintain-bullish-momentum" target="_blank" rel="noopener noreferrer" className="block text-lg font-semibold text-blue-100 hover:text-blue-300 transition-colors rounded-lg px-4 py-3 bg-[#232b3b] hover:bg-[#334155] shadow-md no-underline">BTC Bounces After War-Driven Dip, Eyes $98.2K as Key Bull Market Line</a>
                <a href="https://www.coindesk.com/markets/2025/06/03/atom-surges-5-before-forming-bearish-head-and-shoulders-pattern" target="_blank" rel="noopener noreferrer" className="block text-lg font-semibold text-blue-100 hover:text-blue-300 transition-colors rounded-lg px-4 py-3 bg-[#232b3b] hover:bg-[#334155] shadow-md no-underline">ATOM Surges 5% Before Forming Bearish Head-and-Shoulders Pattern</a>
                <a href="https://www.coindesk.com/markets/2025/05/30/ftx-repayments-may-have-positive-market-impact-coinbase" target="_blank" rel="noopener noreferrer" className="block text-lg font-semibold text-blue-100 hover:text-blue-300 transition-colors rounded-lg px-4 py-3 bg-[#232b3b] hover:bg-[#334155] shadow-md no-underline">FTX Repayments May Have Positive Market Impact This Time: Coinbase Analysts</a>
              </div>
            </div>
          </div>
          <button className="mt-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-4 py-2 text-xs" disabled>View More News</button>
        </section>
      </div>
      <ChatWidget />
    </div>
  );
}; 