"use client";

import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, Clock, Code, Users } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
}

interface ContractInfo {
  address: string;
  name: string;
  verified: boolean;
  compiler: string;
  createdAt: string;
  creator: string;
  transactionCount: number;
  balance: string;
}

interface AuditResult {
  contractInfo: ContractInfo;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  securityChecks: SecurityCheck[];
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

interface ContractInspectorProps {
  className?: string;
}

export function ContractInspector({ className }: ContractInspectorProps) {
  const [contractAddress, setContractAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const analyzeContract = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Mock audit result
    const mockResult: AuditResult = {
      contractInfo: {
        address: contractAddress,
        name: "SuspiciousToken",
        verified: false,
        compiler: "v0.8.19+commit.7dd6d404",
        createdAt: "2024-01-15T10:30:00Z",
        creator: "0x742d35Cc6635C0532925a3b8D84C4b5C2F8D2",
        transactionCount: 1247,
        balance: "0.0 ETH"
      },
      overallScore: 3.2,
      riskLevel: 'high',
      securityChecks: [
        {
          name: "Reentrancy Protection",
          status: 'fail',
          severity: 'critical',
          description: "Contract lacks reentrancy guards",
          details: "Multiple external calls without proper protection"
        },
        {
          name: "Access Control",
          status: 'warning',
          severity: 'medium',
          description: "Weak access control implementation",
          details: "Some functions lack proper role-based access"
        },
        {
          name: "Integer Overflow",
          status: 'pass',
          severity: 'low',
          description: "SafeMath or Solidity 0.8+ used"
        },
        {
          name: "Honeypot Check",
          status: 'fail',
          severity: 'critical',
          description: "Contract shows honeypot characteristics",
          details: "sell() function may revert under certain conditions"
        },
        {
          name: "Liquidity Lock",
          status: 'fail',
          severity: 'high',
          description: "No liquidity lock detected",
          details: "Liquidity can be withdrawn at any time"
        },
        {
          name: "Source Verification",
          status: 'fail',
          severity: 'medium',
          description: "Contract source code not verified"
        },
        {
          name: "Proxy Pattern",
          status: 'warning',
          severity: 'medium',
          description: "Upgradeable proxy detected",
          details: "Contract can be upgraded by owner"
        }
      ],
      vulnerabilities: {
        critical: 2,
        high: 1,
        medium: 3,
        low: 0
      },
      recommendations: [
        "🚨 DO NOT INTERACT - High risk contract with multiple critical vulnerabilities",
        "Contract appears to be a honeypot - selling may not be possible",
        "Unverified source code makes auditing impossible",
        "Consider waiting for official security audit before interacting",
        "Use only small amounts for testing if you must interact"
      ]
    };
    
    setAuditResult(mockResult);
    setIsAnalyzing(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Contract Analysis</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Contract Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
          </div>
          <Button
            onClick={analyzeContract}
            disabled={!contractAddress || isAnalyzing}
            isLoading={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing Contract..." : "Analyze Contract"}
          </Button>
        </div>
      </div>

      {/* Audit Results */}
      {auditResult && (
        <div className="space-y-6">
          {/* Overall Risk Assessment */}
          <div className={cn(
            "border rounded-lg p-6",
            getRiskColor(auditResult.riskLevel)
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {auditResult.riskLevel} Risk Contract
                  </h3>
                  <p className="text-sm opacity-90">
                    Security Score: {auditResult.overallScore}/10
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{auditResult.overallScore}</div>
                <div className="text-sm opacity-75">/10</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{auditResult.vulnerabilities.critical}</div>
                <div className="text-xs">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{auditResult.vulnerabilities.high}</div>
                <div className="text-xs">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{auditResult.vulnerabilities.medium}</div>
                <div className="text-xs">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{auditResult.vulnerabilities.low}</div>
                <div className="text-xs">Low</div>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Contract Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{auditResult.contractInfo.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-mono text-sm">{auditResult.contractInfo.address}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs",
                    auditResult.contractInfo.verified 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  )}>
                    {auditResult.contractInfo.verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {auditResult.contractInfo.verified ? "Verified" : "Not Verified"}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {new Date(auditResult.contractInfo.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="font-medium">{auditResult.contractInfo.transactionCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="font-medium">{auditResult.contractInfo.balance}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Checks */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Security Checks
            </h3>
            <div className="space-y-4">
              {auditResult.securityChecks.map((check, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">{check.description}</div>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full capitalize",
                      getSeverityColor(check.severity)
                    )}>
                      {check.severity}
                    </span>
                  </div>
                  {check.details && (
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      {check.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Security Recommendations
            </h3>
            <ul className="space-y-3">
              {auditResult.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}