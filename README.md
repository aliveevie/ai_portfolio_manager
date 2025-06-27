# 🚀 AI Portfolio Manager: Intelligent Multi-Chain Wallet Intelligence

> **Transform your crypto portfolio management with AI-powered insights, seamless cross-chain operations, and intelligent automation.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-aiportoliceo.vercel.app-blue?style=for-the-badge)](https://aiportoliceo.vercel.app/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/aliveevie/ai_portfolio_manager/pulls)

## ✨ What Makes This Special

The **AI Portfolio Manager** is a revolutionary Web3 application that combines artificial intelligence with comprehensive portfolio management across multiple blockchain networks. Built for the modern DeFi enthusiast, it provides real-time insights, automated recommendations, and seamless cross-chain functionality.

### 🎯 Core Features

#### 🧠 **AI-Powered Intelligence**
- **Smart Portfolio Analysis**: Advanced AI algorithms analyze your holdings across multiple networks
- **Personalized Recommendations**: Get AI-driven investment suggestions based on market trends and your portfolio composition
- **Real-time Risk Assessment**: Continuous monitoring with intelligent risk scoring (1-10 scale)
- **Interactive AI Chat**: Natural language interface for portfolio queries and transaction planning

#### 🌐 **Multi-Chain Portfolio Tracking**
- **Cross-Network Visibility**: Monitor balances across Ethereum Sepolia, Linea Sepolia, Arbitrum Sepolia, and Optimism Sepolia
- **Real-time Token Discovery**: Automatic detection of ERC-20 tokens with live balance updates
- **Performance Analytics**: Historical performance tracking with customizable time periods (1D, 1W, 1M, 3M, 1Y)
- **Visual Portfolio Breakdown**: Interactive pie charts and performance graphs

#### 🔄 **Seamless Cross-Chain Operations**
- **Li.Fi Integration**: Built-in cross-chain bridge and swap functionality
- **Circle CCTP Implementation**: Advanced cross-chain transfer protocol for USDC transfers
- **One-Click Bridging**: Simplified interface for moving assets between networks
- **Optimal Route Finding**: AI-assisted route optimization for lowest fees and fastest transfers

#### 🛡️ **Enterprise-Grade Security**
- **MetaMask Integration**: Secure wallet connection with industry-standard practices
- **Non-Custodial**: You maintain complete control of your assets at all times
- **Privacy-First**: No personal data storage, all operations happen client-side

## 🏗️ Architecture & Technology Stack

### **Frontend Excellence**
- **Next.js 15**: Latest React framework with app router
- **TypeScript**: Full type safety across the entire application
- **Tailwind CSS**: Beautiful, responsive, and accessible UI components
- **Recharts**: Professional data visualization for portfolio analytics

### **Blockchain Integration**
- **Wagmi v2**: Modern React hooks for Ethereum integration
- **Viem**: Type-safe Ethereum library for blockchain interactions
- **Multi-Client Architecture**: Dedicated clients for each supported network

### **AI & Analytics**
- **OpenAI Integration**: GPT-powered portfolio analysis and recommendations
- **Custom AI Tools**: Specialized functions for balance checking, market analysis, and strategy suggestions
- **Real-time Data Processing**: Live market data integration for accurate portfolio valuation

### **Cross-Chain Infrastructure**
- **Li.Fi SDK**: Comprehensive cross-chain infrastructure
- **Circle CCTP**: Cross-Chain Transfer Protocol for seamless USDC transfers
- **Multi-Network Support**: Ethereum, Arbitrum, Optimism, and Linea testnets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- MetaMask or compatible Web3 wallet
- Testnet ETH for transaction fees

### Installation

```bash
# Clone the repository
git clone https://github.com/aliveevie/ai_portfolio_manager.git

# Navigate to project directory
cd wallet-agent

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` and connect your wallet to start exploring!

## 📊 Portfolio Analytics Dashboard

### **Real-Time Metrics**
- Total portfolio value with 24h change indicators
- Network-specific balance breakdowns
- Profit/loss tracking with percentage calculations
- AI-generated portfolio health score

### **Performance Visualization**
- Interactive charts with multiple timeframe options
- Network allocation pie charts with color-coded segments
- Historical performance trends
- Comparative analysis across different chains

### **AI Recommendations Engine**
- Market sentiment analysis
- Diversification suggestions
- Risk management alerts
- Optimal rebalancing strategies

## 🔧 Advanced Features

### **Chat-Based Interface**
Interact with your portfolio using natural language:
- *"What's my current ETH balance?"*
- *"Show me opportunities to increase yield"*
- *"Help me rebalance my portfolio"*
- *"What are the gas fees for transferring to Arbitrum?"*

### **Cross-Chain Bridge Integration**
Seamlessly move assets between networks:
- **Li.Fi Widget**: Professional bridging interface with optimal route finding
- **CCTP Integration**: Fast and efficient USDC transfers between supported chains
- **Fee Comparison**: Real-time fee estimates across different bridge providers

### **Smart Contract Interactions**
- ERC-20 token balance tracking
- Multi-network transaction broadcasting
- Smart contract state monitoring
- Gas optimization suggestions

## 🛠️ Development & Contributing

### **Key Implementation Highlights**

#### **Circle CCTP Integration** ([PR #1](https://github.com/aliveevie/ai_portfolio_manager/pull/1))
- Advanced cross-chain transfer protocol implementation
- Automated attestation handling
- Multi-network USDC transfer capabilities

#### **Li.Fi SDK Integration** ([PR #2](https://github.com/aliveevie/ai_portfolio_manager/pull/2))
- Comprehensive bridge and swap functionality
- Professional widget integration
- Optimal route calculation

### **Project Structure**
```
wallet-agent/
├── ai/                    # AI tools and integrations
│   └── tools.ts          # Custom AI functions for portfolio management
├── app/                  # Next.js app router pages
├── components/           # React components
│   ├── Dashboard.tsx     # Main portfolio dashboard
│   ├── Chat.tsx         # AI chat interface
│   └── ui/              # Reusable UI components
├── lib/                 # Utility libraries
│   ├── cctp/           # Circle CCTP implementation
│   └── hooks/          # Custom React hooks
└── wagmi.config.ts     # Blockchain configuration
```

## 🎯 Roadmap & Future Enhancements

- [ ] **Mainnet Support**: Production deployment with real assets
- [ ] **DeFi Protocol Integration**: Lending, borrowing, and yield farming
- [ ] **Advanced AI Features**: Predictive analytics and automated trading
- [ ] **Mobile Application**: React Native mobile app
- [ ] **Portfolio Sharing**: Social features for portfolio comparison
- [ ] **Advanced Charting**: Professional trading view integration

## 🤝 Contributing

We welcome contributions! Please check out our [contributing guidelines](./CONTRIBUTING.md) and feel free to submit pull requests or open issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the DeFi community**

[🌐 Live Demo](https://aiportoliceo.vercel.app/) | [🐦 Twitter](https://twitter.com/iabdulkarim472) | [💬 Telegram](https://t.me/ibrahim_193)
</div>