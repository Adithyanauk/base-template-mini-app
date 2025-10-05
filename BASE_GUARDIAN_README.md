# Base Guardian

**Your transaction safety shield for Base network**

Base Guardian is a comprehensive security-focused mini-app designed to protect users from scams, MEV attacks, and malicious contracts on the Base blockchain network. It acts like an antivirus for blockchain transactions, providing real-time risk analysis and security recommendations.

## Features

### 🛡️ Dashboard
- **Transaction Input**: Paste transaction hashes or connect wallet for analysis
- **Risk Score Display**: Color-coded risk indicators (Green = Safe, Yellow = Risky, Red = Dangerous)
- **Quick Stats**: Live counters for safe transactions and threats blocked
- **Recent Activity**: History of analyzed transactions with risk levels

### ⚡ Transaction Simulator
- **Pre-execution Analysis**: Simulate transactions before broadcasting
- **Expected vs Actual Comparison**: See potential MEV impact on your trades
- **Risk Factor Detection**: Identify sandwich attacks, front-running, and high slippage
- **Gas Estimation**: Accurate gas usage predictions
- **Protection Recommendations**: Suggestions for using private mempools

### 🔍 Contract Inspector
- **Smart Contract Auditing**: Comprehensive security analysis of contracts
- **Vulnerability Detection**: Check for reentrancy, access control issues, and more
- **Honeypot Detection**: Identify contracts that prevent selling
- **Source Verification**: Validate if contract source code is verified
- **Risk Scoring**: 0-10 security score with detailed breakdown

### 📊 Live Feed
- **Real-time Threat Detection**: Monitor Base network for suspicious activity
- **MEV Attack Alerts**: Live sandwich attack and front-running detection
- **Rug Pull Warnings**: Early detection of liquidity removal events
- **Community Protection**: Share threat intelligence across users

## Security Checks

Base Guardian analyzes multiple risk factors:

- **MEV (Maximal Extractable Value)**: Front-running and back-running detection
- **Sandwich Attacks**: Identify transactions that manipulate prices around your trade
- **High Slippage**: Warn about trades with excessive price impact
- **Malicious Contracts**: Detect rug pulls, honeypots, and scam tokens
- **Access Control**: Analyze smart contract permission structures
- **Liquidity Analysis**: Check if token liquidity is locked or can be withdrawn

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom security theme
- **Blockchain**: Base network integration via Viem & Wagmi
- **Icons**: Lucide React for clean, modern iconography
- **Frame**: Farcaster Frames v2 compatibility

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test in Warpcast**
   - Open [Warpcast Mini App Developer Tools](https://warpcast.com/~/developers)
   - Enter URL: `http://localhost:3000`
   - Click "Preview" to test the mini app

## Usage

### Analyzing a Transaction
1. Go to the Dashboard tab
2. Choose "Transaction Hash" mode
3. Paste a transaction hash (0x...)
4. Click "Analyze Transaction"
5. Review the risk score and recommendations

### Simulating a Transaction
1. Navigate to the Simulator tab
2. Enter contract address and call data
3. Click "Simulate Transaction"
4. Compare expected vs actual results
5. Review risk factors and gas estimates

### Inspecting a Contract
1. Open the Inspector tab
2. Enter a contract address
3. Click "Analyze Contract"
4. Review security checks and vulnerability report
5. Read the detailed recommendations

### Monitoring Threats
1. Visit the Live Feed tab
2. View real-time suspicious activity
3. See recent MEV attacks and rug pulls
4. Stay informed about network security

## Demo Features

The current implementation includes realistic mock data for demonstration:

- **Sample Transactions**: Try the provided example transaction hashes
- **Risk Scenarios**: Experience different risk levels (safe, risky, dangerous)
- **Security Reports**: See comprehensive contract audit results
- **Live Threats**: View simulated real-time security alerts

## Architecture

```
src/
├── components/
│   ├── BaseGuardian.tsx          # Main app component
│   └── ui/
│       ├── RiskScore.tsx         # Risk analysis display
│       ├── TransactionInput.tsx  # Input interface
│       ├── TransactionSimulator.tsx  # Simulation engine
│       ├── ContractInspector.tsx # Contract auditing
│       ├── Footer.tsx           # Navigation
│       └── Header.tsx           # App header
├── lib/
│   ├── baseGuardian.ts          # Core security services
│   └── constants.ts             # App configuration
└── app/
    ├── api/analyze/             # Analysis API endpoints
    └── globals.css              # Security-themed styling
```

## Future Enhancements

- **Real Blockchain Integration**: Connect to actual Base RPC and security APIs
- **Machine Learning**: AI-powered threat detection and pattern recognition
- **Private Mempool Integration**: Direct integration with MEV protection services
- **Mobile App**: Native iOS/Android app with push notifications
- **DeFi Protocol Analysis**: Specialized analysis for lending, DEX, and yield protocols
- **Cross-chain Support**: Extend to Ethereum, Arbitrum, and other networks

## Security Notice

Base Guardian is designed to enhance transaction security but should not be the only security measure. Always:
- Verify contract addresses from official sources
- Use hardware wallets for large transactions
- Keep private keys secure
- Stay informed about current threats
- Test with small amounts first

## Contributing

Base Guardian is built to protect the Base ecosystem. Contributions are welcome for:
- Additional security check implementations
- UI/UX improvements
- Performance optimizations
- Integration with security services
- Documentation and tutorials

---

**Stay Safe, Trade Smart with Base Guardian** 🛡️