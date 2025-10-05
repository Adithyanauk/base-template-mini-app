// Smart contract ABI and interaction utilities for BaseGuardian
import { createPublicClient, createWalletClient, http, parseEther, formatEther, custom } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Contract ABI (essential functions only)
export const BASE_GUARDIAN_ABI = [
  // Read functions
  {
    "inputs": [{"internalType": "address", "name": "_contractAddress", "type": "address"}],
    "name": "getRiskAnalysis",
    "outputs": [
      {"internalType": "uint8", "name": "riskLevel", "type": "uint8"},
      {"internalType": "uint256", "name": "riskScore", "type": "uint256"},
      {"internalType": "uint256", "name": "reportCount", "type": "uint256"},
      {"internalType": "uint8[]", "name": "threatTypes", "type": "uint8[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_contractAddress", "type": "address"}],
    "name": "isHighRiskContract",
    "outputs": [
      {"internalType": "bool", "name": "isHighRisk", "type": "bool"},
      {"internalType": "uint256", "name": "riskScore", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSecurityMetrics",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "totalContracts", "type": "uint256"},
          {"internalType": "uint256", "name": "flaggedContracts", "type": "uint256"},
          {"internalType": "uint256", "name": "validatedReports", "type": "uint256"},
          {"internalType": "uint256", "name": "falsePositives", "type": "uint256"}
        ],
        "internalType": "struct BaseGuardian.SecurityMetrics",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Write functions
  {
    "inputs": [
      {"internalType": "address", "name": "_targetContract", "type": "address"},
      {"internalType": "uint8", "name": "_threatType", "type": "uint8"},
      {"internalType": "uint256", "name": "_riskScore", "type": "uint256"},
      {"internalType": "string", "name": "_evidence", "type": "string"}
    ],
    "name": "reportThreat",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },

  // View functions for fees
  {
    "inputs": [],
    "name": "reportFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "reporter", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "targetContract", "type": "address"},
      {"indexed": false, "internalType": "uint8", "name": "threatType", "type": "uint8"},
      {"indexed": false, "internalType": "uint256", "name": "riskScore", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "evidence", "type": "string"}
    ],
    "name": "ThreatReported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "contractAddress", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "newScore", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "reportCount", "type": "uint256"}
    ],
    "name": "ReputationUpdated",
    "type": "event"
  }
] as const;

// Contract addresses (to be updated after deployment)
export const CONTRACTS = {
  BASE_MAINNET: '0x0000000000000000000000000000000000000000', // Update after deployment
  BASE_SEPOLIA: '0x0000000000000000000000000000000000000000', // Update after deployment
} as const;

// Enums matching contract
export enum ThreatType {
  HONEYPOT = 0,
  RUGPULL = 1,
  MEV_VULNERABILITY = 2,
  SANDWICH_RISK = 3,
  PHISHING = 4,
  MALICIOUS_CONTRACT = 5
}

export enum RiskLevel {
  SAFE = 0,
  RISKY = 1,
  DANGEROUS = 2
}

// Types
export interface OnChainRiskAnalysis {
  riskLevel: RiskLevel;
  riskScore: bigint;
  reportCount: bigint;
  threatTypes: ThreatType[];
}

export interface SecurityMetrics {
  totalContracts: bigint;
  flaggedContracts: bigint;
  validatedReports: bigint;
  falsePositives: bigint;
}

export interface ThreatReportParams {
  targetContract: `0x${string}`;
  threatType: ThreatType;
  riskScore: number;
  evidence: string;
}

// Contract interaction class
export class BaseGuardianContract {
  private publicClient: any;
  private walletClient: any;
  private contractAddress: `0x${string}`;

  constructor(isTestnet = false) {
    const chain = isTestnet ? baseSepolia : base;
    this.contractAddress = isTestnet ? CONTRACTS.BASE_SEPOLIA : CONTRACTS.BASE_MAINNET;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http()
    });
  }

  // Initialize wallet client (call when user connects wallet)
  initWalletClient(walletProvider: any) {
    this.walletClient = createWalletClient({
      chain: this.publicClient.chain,
      transport: custom(walletProvider)
    });
  }

  // Read Functions

  /**
   * Get comprehensive risk analysis for a contract address
   */
  async getRiskAnalysis(contractAddress: `0x${string}`): Promise<OnChainRiskAnalysis> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: BASE_GUARDIAN_ABI,
        functionName: 'getRiskAnalysis',
        args: [contractAddress]
      });

      return {
        riskLevel: result[0] as RiskLevel,
        riskScore: result[1],
        reportCount: result[2],
        threatTypes: result[3] as ThreatType[]
      };
    } catch (error) {
      console.error('Failed to get risk analysis:', error);
      throw new Error('Failed to fetch on-chain risk analysis');
    }
  }

  /**
   * Check if a contract is flagged as high risk
   */
  async isHighRiskContract(contractAddress: `0x${string}`): Promise<{ isHighRisk: boolean; riskScore: bigint }> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: BASE_GUARDIAN_ABI,
        functionName: 'isHighRiskContract',
        args: [contractAddress]
      });

      return {
        isHighRisk: result[0],
        riskScore: result[1]
      };
    } catch (error) {
      console.error('Failed to check high risk status:', error);
      throw new Error('Failed to check contract risk status');
    }
  }

  /**
   * Get overall security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: BASE_GUARDIAN_ABI,
        functionName: 'getSecurityMetrics'
      });

      return {
        totalContracts: (result as any).totalContracts,
        flaggedContracts: (result as any).flaggedContracts,
        validatedReports: (result as any).validatedReports,
        falsePositives: (result as any).falsePositives
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      throw new Error('Failed to fetch security metrics');
    }
  }

  /**
   * Get current report fee
   */
  async getReportFee(): Promise<bigint> {
    try {
      const fee = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: BASE_GUARDIAN_ABI,
        functionName: 'reportFee'
      });
      return fee;
    } catch (error) {
      console.error('Failed to get report fee:', error);
      throw new Error('Failed to fetch report fee');
    }
  }

  // Write Functions

  /**
   * Report a threat for a specific contract
   */
  async reportThreat(params: ThreatReportParams, userAddress: `0x${string}`): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get current report fee
      const fee = await this.getReportFee();

      // Validate risk score
      if (params.riskScore < 0 || params.riskScore > 100) {
        throw new Error('Risk score must be between 0 and 100');
      }

      // Prepare transaction
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: BASE_GUARDIAN_ABI,
        functionName: 'reportThreat',
        args: [
          params.targetContract,
          params.threatType,
          BigInt(params.riskScore),
          params.evidence
        ],
        value: fee,
        account: userAddress
      });

      // Execute transaction
      const txHash = await this.walletClient.writeContract(request);
      
      return txHash;
    } catch (error) {
      console.error('Failed to report threat:', error);
      throw new Error('Failed to submit threat report');
    }
  }

  // Event listening

  /**
   * Watch for ThreatReported events
   */
  watchThreatReports(callback: (log: any) => void) {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: BASE_GUARDIAN_ABI,
      eventName: 'ThreatReported',
      onLogs: callback
    });
  }

  /**
   * Watch for ReputationUpdated events
   */
  watchReputationUpdates(callback: (log: any) => void) {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: BASE_GUARDIAN_ABI,
      eventName: 'ReputationUpdated',
      onLogs: callback
    });
  }

  // Utility functions

  /**
   * Format risk score for display
   */
  static formatRiskScore(score: bigint): string {
    return score.toString();
  }

  /**
   * Get risk level color
   */
  static getRiskLevelColor(level: RiskLevel): string {
    switch (level) {
      case RiskLevel.SAFE:
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case RiskLevel.RISKY:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case RiskLevel.DANGEROUS:
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  }

  /**
   * Get threat type display name
   */
  static getThreatTypeName(threatType: ThreatType): string {
    switch (threatType) {
      case ThreatType.HONEYPOT:
        return 'Honeypot';
      case ThreatType.RUGPULL:
        return 'Rug Pull';
      case ThreatType.MEV_VULNERABILITY:
        return 'MEV Vulnerability';
      case ThreatType.SANDWICH_RISK:
        return 'Sandwich Risk';
      case ThreatType.PHISHING:
        return 'Phishing';
      case ThreatType.MALICIOUS_CONTRACT:
        return 'Malicious Contract';
      default:
        return 'Unknown Threat';
    }
  }
}

// Export singleton instance
export const baseGuardianContract = new BaseGuardianContract(false); // Mainnet
export const baseGuardianTestContract = new BaseGuardianContract(true); // Testnet