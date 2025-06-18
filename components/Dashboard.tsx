"use client";

import { ConnectButton } from "@/components/ConnectButton";
import { Chat } from "@/components/Chat";
import { useAccount } from "wagmi";
import { useState } from "react";

const mockPortfolio = {
  total: 126082.5,
  invested: 120000,
  gain: 5750,
  today: 3179.41,
  todayPct: 2.58,
  aiScore: 8.7,
};

const mockRecommendations = [
  { symbol: "NVDA", action: "Strong Buy", price: 875.3, change: 2.4, confidence: 92, note: "AI chip demand surge expected" },
  { symbol: "META", action: "Consider Sell", price: 485.2, change: -1.2, confidence: 78, note: "Regulatory concerns increasing" },
  { symbol: "AAPL", action: "Hold", price: 180.45, change: 0.8, confidence: 85, note: "Stable performance expected" },
];

const mockAllocation = [
  { label: "Tech Stocks", value: 45, color: "#22d3ee" },
  { label: "Blue Chips", value: 25, color: "#818cf8" },
  { label: "Crypto", value: 15, color: "#a78bfa" },
  { label: "Bonds", value: 10, color: "#fbbf24" },
  { label: "Cash", value: 5, color: "#a3a3a3" },
];

const mockRisk = [
  { label: "Portfolio Beta", value: 1.23, desc: "vs S&P 500" },
  { label: "Sharpe Ratio", value: 1.87, desc: "Risk-adjusted return" },
  { label: "Max Drawdown", value: "12.4%", desc: "Worst decline" },
];

const mockTrades = [
  { type: "BUY", symbol: "AAPL", amount: 9022.5, shares: 50, price: 180.45, time: "2 hours ago" },
  { type: "SELL", symbol: "TSLA", amount: 6145, shares: 25, price: 245.8, time: "5 hours ago" },
  { type: "BUY", symbol: "MSFT", amount: 11346, shares: 30, price: 378.2, time: "1 day ago" },
  { type: "SELL", symbol: "GOOGL", amount: 2139.75, shares: 15, price: 142.65, time: "2 days ago" },
];

const mockNews = [
  { title: "Fed Signals Potential Rate Cut", source: "Financial Times", time: "1 hour ago", sentiment: "positive" },
  { title: "Tech Earnings Beat Expectations", source: "Bloomberg", time: "3 hours ago", sentiment: "positive" },
  { title: "Oil Prices Surge on Supply Concerns", source: "Reuters", time: "6 hours ago", sentiment: "neutral" },
  { title: "Crypto Market Shows Volatility", source: "CoinDesk", time: "12 hours ago", sentiment: "negative" },
];

export const Dashboard = () => {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState("1D");

  return (
    <div className="min-h-screen bg-[#181f2a] text-white p-6 sm:p-10 font-sans">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-green-300 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          AI Portfolio Manager
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">AI Engine Active</span>
          <ConnectButton />
          <div className="rounded-full bg-gray-700 px-4 py-2 text-sm font-medium">John Doe</div>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Overview */}
        <section className="col-span-2 bg-[#232b3b] rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Portfolio Overview</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl font-bold">${mockPortfolio.total.toLocaleString()}</span>
                <span className="text-green-400 text-sm">+${mockPortfolio.today.toLocaleString()} ({mockPortfolio.todayPct}%) Today</span>
              </div>
              <div className="flex gap-8 mt-4 text-gray-300">
                <div>
                  <div className="font-bold text-white">${mockPortfolio.invested.toLocaleString()}</div>
                  <div className="text-xs">Total Invested</div>
                </div>
                <div>
                  <div className="font-bold text-green-400">+${mockPortfolio.gain.toLocaleString()}</div>
                  <div className="text-xs">Total Gain</div>
                </div>
                <div>
                  <div className="font-bold text-blue-400">{mockPortfolio.aiScore}/10</div>
                  <div className="text-xs">AI Score</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="flex items-center gap-2 text-green-400 text-xs"><span className="w-2 h-2 bg-green-400 rounded-full"></span>Live</span>
            </div>
          </div>
          {isConnected && <div className="mt-6"><Chat /></div>}
        </section>
        {/* AI Recommendations */}
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">AI Recommendations</h2>
            <span className="text-xs text-gray-400">Updated 2m ago</span>
          </div>
          {mockRecommendations.map((rec) => (
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
          ))}
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
          <div className="h-56 flex items-center justify-center text-gray-400">[Mock Line Chart Here]</div>
        </section>
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="2"/></svg> Asset Allocation</h2>
          <div className="h-48 flex items-center justify-center">
            {/* Mock Donut Chart */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {(() => {
                  let acc = 0;
                  return mockAllocation.map((a, i) => {
                    const val = (a.value / 100) * 100;
                    const dash = val * 1.13;
                    const gap = 113 - dash;
                    const offset = acc;
                    acc += dash;
                    return (
                      <circle
                        key={a.label}
                        cx="18" cy="18" r="18"
                        fill="transparent"
                        stroke={a.color}
                        strokeWidth="6"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">100%</div>
            </div>
          </div>
          <ul className="mt-6 space-y-2">
            {mockAllocation.map((a) => (
              <li key={a.label} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: a.color }}></span>
                {a.label} <span className="ml-auto font-bold">{a.value}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {/* Risk, Trades, News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v10l6 4" stroke="#fbbf24" strokeWidth="2"/></svg> Risk Analysis</h2>
          {mockRisk.map((r) => (
            <div key={r.label} className="bg-[#1a2233] rounded-lg p-4 flex flex-col gap-1">
              <div className="font-bold text-lg">{r.value}</div>
              <div className="text-xs text-gray-400">{r.label}</div>
              <div className="text-xs text-gray-500">{r.desc}</div>
            </div>
          ))}
          <div className="bg-blue-950 rounded-lg p-3 mt-2 text-xs text-blue-200">
            <b>AI Risk Assessment</b><br />Your portfolio shows moderate risk with good diversification. Consider reducing exposure to high-beta stocks for better stability.
          </div>
        </section>
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="#22d3ee" strokeWidth="2"/></svg> Recent Trades</h2>
          {mockTrades.map((t, i) => (
            <div key={i} className="bg-[#1a2233] rounded-lg p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className={`font-bold ${t.type === "BUY" ? "text-green-400" : "text-red-400"}`}>{t.type} {t.symbol}</span>
                <span className="text-xs text-gray-400">{t.shares} shares @ ${t.price}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">${t.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{t.time}</div>
              </div>
            </div>
          ))}
          <button className="mt-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-4 py-2 text-xs">View All Trades</button>
        </section>
        <section className="bg-[#232b3b] rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#22d3ee" strokeWidth="2"/></svg> Market News</h2>
          {mockNews.map((n, i) => (
            <div key={i} className="bg-[#1a2233] rounded-lg p-4 flex flex-col gap-1">
              <div className="font-bold text-sm">{n.title}</div>
              <div className="text-xs text-gray-400">{n.source} • {n.time}</div>
              <div className={`text-xs font-bold ${n.sentiment === "positive" ? "text-green-400" : n.sentiment === "negative" ? "text-red-400" : "text-yellow-400"}`}>{n.sentiment}</div>
            </div>
          ))}
          <button className="mt-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-4 py-2 text-xs">View More News</button>
        </section>
      </div>
    </div>
  );
}; 