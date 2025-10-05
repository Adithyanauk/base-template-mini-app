# BaseGuardian Smart Contract

A decentralized security analysis and reputation system for the Base blockchain ecosystem.

## Overview

The BaseGuardian smart contract provides on-chain threat reporting, reputation tracking, and security analysis for smart contracts on the Base network. It creates a community-driven security layer where users can report threats and validators can confirm findings.

## Features

### 🛡️ Core Security Functions
- **Threat Reporting**: Community-driven threat identification and reporting
- **Risk Analysis**: On-chain risk scoring and categorization
- **Reputation System**: Contract reputation tracking based on community reports
- **Validator Network**: Trusted validators confirm threat reports
- **Security Metrics**: Network-wide security statistics

### 🔍 Threat Types Supported
- **Honeypot**: Contracts that prevent token selling
- **Rug Pull**: Projects that remove liquidity unexpectedly
- **MEV Vulnerability**: Contracts susceptible to MEV attacks
- **Sandwich Risk**: Contracts vulnerable to sandwich attacks
- **Phishing**: Malicious contracts designed to steal funds
- **Malicious Contract**: General malicious behavior

### 📊 Risk Levels
- **Safe** (0-30): Low risk, generally safe to interact with
- **Risky** (31-70): Moderate risk, proceed with caution
- **Dangerous** (71-100): High risk, avoid interaction

## Contract Architecture

```solidity
BaseGuardian.sol
├── Threat Reporting System
│   ├── reportThreat() - Submit threat reports
│   ├── validateReport() - Validator confirmation
│   └── ThreatReport struct - Report data structure
├── Risk Analysis
│   ├── getRiskAnalysis() - Comprehensive risk data
│   ├── isHighRiskContract() - Quick risk check
│   └── ContractReputation mapping - Reputation storage
├── Validator System
│   ├── addValidator() - Add trusted validators
│   ├── removeValidator() - Remove validators
│   └── Validator rewards and penalties
└── Security Metrics
    ├── getSecurityMetrics() - Network statistics
    └── Real-time threat monitoring
```

## Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @openzeppelin/contracts @nomicfoundation/hardhat-toolbox
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your private key and API keys:
```bash
PRIVATE_KEY=your_private_key_without_0x
BASESCAN_API_KEY=your_basescan_api_key
```

### Deploy to Base Sepolia (Testnet)
```bash
npx hardhat run scripts/deploy-contract.js --network baseSepolia
```

### Deploy to Base Mainnet
```bash
npx hardhat run scripts/deploy-contract.js --network base
```

### Verify Contract
```bash
npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS
```

## Usage Examples

### Frontend Integration

```typescript
import { baseGuardianContract, ThreatType } from './lib/baseGuardianContract';

// Check if a contract is high risk
const riskCheck = await baseGuardianContract.isHighRiskContract('0x...');
if (riskCheck.isHighRisk) {
  console.log(`⚠️ High risk contract detected! Score: ${riskCheck.riskScore}`);
}

// Get comprehensive risk analysis
const analysis = await baseGuardianContract.getRiskAnalysis('0x...');
console.log(`Risk Level: ${analysis.riskLevel}`);
console.log(`Report Count: ${analysis.reportCount}`);
console.log(`Threat Types: ${analysis.threatTypes}`);

// Report a threat (requires wallet connection)
await baseGuardianContract.reportThreat({
  targetContract: '0x...',
  threatType: ThreatType.HONEYPOT,
  riskScore: 85,
  evidence: 'Contract prevents token selling after purchase'
}, userAddress);
```

### Direct Contract Interaction

```javascript
// Using ethers.js
const contract = new ethers.Contract(contractAddress, abi, signer);

// Report a honeypot
await contract.reportThreat(
  "0x1234567890abcdef1234567890abcdef12345678",
  0, // ThreatType.HONEYPOT
  85,
  "Contract prevents selling tokens",
  { value: ethers.parseEther("0.001") }
);

// Get risk analysis
const [riskLevel, riskScore, reportCount, threatTypes] = 
  await contract.getRiskAnalysis("0x1234567890abcdef1234567890abcdef12345678");
```

## Economics

### Fees
- **Report Fee**: 0.001 ETH per threat report
- **Validation Reward**: 0.0005 ETH per validated report

### Incentive Structure
- **Reporters**: Earn reputation for accurate reports, penalized for false reports
- **Validators**: Earn rewards for confirming reports
- **Users**: Access to community-verified security data

## Testing

Run the test suite:
```bash
npx hardhat test
```

Expected test coverage:
- ✅ Contract deployment and initialization
- ✅ Threat reporting with fees
- ✅ Risk analysis calculations
- ✅ Validator management
- ✅ Security metrics tracking
- ✅ Fee management
- ✅ Emergency functions

## API Reference

### Read Functions

#### `getRiskAnalysis(address _contractAddress)`
Returns comprehensive risk analysis for a contract.
- **Returns**: `(RiskLevel, uint256, uint256, ThreatType[])`

#### `isHighRiskContract(address _contractAddress)`
Quick check if contract is flagged as high risk.
- **Returns**: `(bool, uint256)`

#### `getSecurityMetrics()`
Returns network-wide security statistics.
- **Returns**: `SecurityMetrics struct`

### Write Functions

#### `reportThreat(address _target, ThreatType _type, uint256 _score, string _evidence)`
Submit a threat report (requires fee payment).
- **Fee**: Current `reportFee` value
- **Emits**: `ThreatReported` event

#### `validateReport(bytes32 _reportId, bool _isValid)`
Validate a threat report (validators only).
- **Restriction**: Only authorized validators
- **Emits**: Report validation events

## Security Considerations

### Access Control
- **Owner**: Can add/remove validators, update fees, emergency withdraw
- **Validators**: Can validate reports and earn rewards
- **Users**: Can report threats and query data

### Economic Security
- Report fees prevent spam
- Validator rewards incentivize honest validation
- Reporter reputation system discourages false reports

### Upgrade Safety
- Contract is not upgradeable (immutable deployment)
- Owner functions are limited to configuration
- No proxy patterns used

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality  
4. Run the test suite
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Contract Addresses

### Local Development (Deployed)
```
Contract: 0x4815A8Ba613a3eB21A920739dE4cA7C439c7e1b1
Block Number: 2
Transaction Hash: 0xc7c8e2cc14f863bd046abbe77e4bce92776c6a9bea96d2323608a014d73d42f2
Owner: 0x20af820E454948de0D40bf93bFb79f97A575631b
Gas Used: 2,590,131 gas
Status: ✅ Successfully Deployed
```

### Base Mainnet
```
Contract: [To be deployed]
Explorer: https://basescan.org/address/[ADDRESS]
```

### Base Sepolia (Testnet)
```
Contract: [To be deployed]
Explorer: https://sepolia.basescan.org/address/[ADDRESS]
```

## Deployment Details

### Latest Deployment Transaction
```
[vm] from: 0x4B2...C02db
to: BaseGuardian.(constructor)
value: 0 wei
data: 0x608...5631b
logs: 1
hash: 0xc7c...d42f2

status: 0x1 Transaction mined and execution succeed
transaction hash: 0xc7c8e2cc14f863bd046abbe77e4bce92776c6a9bea96d2323608a014d73d42f2
block hash: 0x504d62431b59b741f839911dcfe44c3853dc1556f680fc979930aa6514056f8c
block number: 2
contract address: 0x4815A8Ba613a3eB21A920739dE4cA7C439c7e1b1
from: 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
to: BaseGuardian.(constructor)
gas: 2978651 gas
transaction cost: 2590131 gas 
execution cost: 2355233 gas 
```

### Contract Events
```
OwnershipTransferred Event:
- From: 0x0000000000000000000000000000000000000000
- To: 0x20af820E454948de0D40bf93bFb79f97A575631b
- Topic: 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0
```

### Constructor Parameters
```
address initialOwner: 0x20af820E454948de0D40bf93bFb79f97A575631b
```

---

**⚠️ Security Notice**: This contract handles financial transactions and security data. Always verify contract addresses and perform due diligence before interacting with any smart contract.