"use client";

import { Shield, AlertTriangle, ShieldAlert, CheckCircle, Clock, TrendingUp, Zap, Eye } from "lucide-react";
import { cn } from "~/lib/utils";
import { RiskAnalysisResult, ThreatDetails } from "~/lib/riskAnalysis";

interface RiskScoreProps {
  result: RiskAnalysisResult | null;
  isLoading?: boolean;
  className?: string;
}

export function RiskScore({ result, isLoading = false, className }: RiskScoreProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'risky':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'dangerous':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'safe':
        return <CheckCircle className="w-6 h-6" />;
      case 'risky':
        return <AlertTriangle className="w-6 h-6" />;
      case 'dangerous':
        return <ShieldAlert className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'mev':
        return <Zap className="w-4 h-4" />;
      case 'sandwich':
        return <TrendingUp className="w-4 h-4" />;
      case 'honeypot':
        return <AlertTriangle className="w-4 h-4" />;
      case 'rugpull':
        return <ShieldAlert className="w-4 h-4" />;
      case 'phishing':
        return <Eye className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Risk Score Card */}
      <div className={cn(
        "border rounded-lg p-6 transition-all duration-200",
        getRiskColor(result.level)
      )}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {getRiskIcon(result.level)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize">
                {result.level} Transaction
              </h3>
              <div className="text-2xl font-bold">
                {result.score}/100
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    result.level === 'safe' && "bg-green-600",
                    result.level === 'risky' && "bg-yellow-600",
                    result.level === 'dangerous' && "bg-red-600"
                  )}
                  style={{ width: `${Math.min(result.score, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {result.transactionDetails && (
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-3 text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Transaction Details
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">From:</span>
              <p className="font-mono text-xs">{result.transactionDetails.from.slice(0, 20)}...</p>
            </div>
            <div>
              <span className="text-muted-foreground">To:</span>
              <p className="font-mono text-xs">{result.transactionDetails.to?.slice(0, 20) || 'Contract Creation'}...</p>
            </div>
            <div>
              <span className="text-muted-foreground">Value:</span>
              <p>{(parseFloat(result.transactionDetails.value) / 1e18).toFixed(4)} ETH</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className={cn(
                "capitalize",
                result.transactionDetails.status === 'success' ? 'text-green-600' : 
                result.transactionDetails.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
              )}>
                {result.transactionDetails.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detected Threats */}
      {result.threats.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-3 text-foreground">Detected Threats ({result.threats.length})</h4>
          <div className="space-y-3">
            {result.threats.map((threat, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getThreatIcon(threat.type)}
                    <div>
                      <div className="font-medium capitalize">{threat.type.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-sm text-muted-foreground">{threat.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full capitalize",
                      getSeverityColor(threat.severity)
                    )}>
                      {threat.severity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {threat.confidence}% confidence
                    </span>
                  </div>
                </div>
                {threat.evidence.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Evidence:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {threat.evidence.map((evidence, evidenceIndex) => (
                        <li key={evidenceIndex} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gas Analysis */}
      {result.gasAnalysis && (
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-3 text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Gas Analysis
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Gas Used:</span>
              <p>{result.gasAnalysis.actualGas || result.gasAnalysis.estimatedGas}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gas Price:</span>
              <p>{(parseFloat(result.gasAnalysis.gasPrice) / 1e9).toFixed(2)} Gwei</p>
            </div>
            <div>
              <span className="text-muted-foreground">Premium:</span>
              <p className={cn(
                result.gasAnalysis.gasPremium > 0.5 ? 'text-red-600' : 'text-green-600'
              )}>
                {(result.gasAnalysis.gasPremium * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">MEV Risk:</span>
              <p className={cn(
                result.gasAnalysis.mevRisk ? 'text-red-600' : 'text-green-600'
              )}>
                {result.gasAnalysis.mevRisk ? 'High' : 'Low'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-3 text-foreground">Security Recommendations</h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function RiskScoreCard({ result, className }: { result: RiskAnalysisResult | null; className?: string }) {
  if (!result) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
      case 'risky':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800';
      case 'dangerous':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'safe':
        return <CheckCircle className="w-5 h-5" />;
      case 'risky':
        return <AlertTriangle className="w-5 h-5" />;
      case 'dangerous':
        return <ShieldAlert className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all duration-200 hover:shadow-md",
      getRiskColor(result.level),
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getRiskIcon(result.level)}
          <div>
            <div className="font-medium capitalize">{result.level}</div>
            <div className="text-sm opacity-75">Risk Score</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{result.score}</div>
          <div className="text-sm opacity-75">/100</div>
        </div>
      </div>
    </div>
  );
}