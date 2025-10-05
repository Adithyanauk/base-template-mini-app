"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Shield, Clock, TrendingUp, Zap, Eye, ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";

interface ThreatAlert {
  id: string;
  timestamp: Date;
  type: 'mev' | 'sandwich' | 'honeypot' | 'rugpull' | 'phishing' | 'flashloan';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedContract?: string;
  transactionHash?: string;
  estimatedLoss?: string;
  status: 'active' | 'resolved' | 'monitoring';
}

interface LiveFeedProps {
  className?: string;
}

export function LiveFeed({ className }: LiveFeedProps) {
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching live threat feed
    const fetchThreats = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockThreats: ThreatAlert[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          type: 'sandwich',
          severity: 'high',
          title: 'Sandwich Attack Detected',
          description: 'Large sandwich attack targeting WETH/USDC swaps with 2.3% slippage',
          affectedContract: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
          transactionHash: '0xabc123...',
          estimatedLoss: '$12,450',
          status: 'active'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
          type: 'honeypot',
          severity: 'critical',
          title: 'New Honeypot Contract Deployed',
          description: 'Suspicious token contract deployed mimicking popular DeFi token',
          affectedContract: '0x1234567890abcdef1234567890abcdef12345678',
          estimatedLoss: 'Unknown',
          status: 'monitoring'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 28 * 60 * 1000), // 28 minutes ago
          type: 'mev',
          severity: 'medium',
          title: 'High MEV Activity',
          description: 'Increased MEV bot activity detected in block range 19,234,567-19,234,580',
          status: 'active'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          type: 'flashloan',
          severity: 'critical',
          title: 'Flash Loan Attack',
          description: 'Multi-million dollar flash loan attack exploiting price oracle manipulation',
          affectedContract: '0xdef456...',
          transactionHash: '0x789def...',
          estimatedLoss: '$3.2M',
          status: 'resolved'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 72 * 60 * 1000), // 1 hour 12 minutes ago
          type: 'phishing',
          severity: 'high',
          title: 'Phishing Site Detected',
          description: 'Fake Uniswap frontend detected harvesting wallet signatures',
          status: 'resolved'
        }
      ];
      
      setThreats(mockThreats);
      setIsLoading(false);
    };

    fetchThreats();
    
    // Update feed every 30 seconds
    const interval = setInterval(fetchThreats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'mev':
        return <Zap className="w-4 h-4" />;
      case 'sandwich':
        return <TrendingUp className="w-4 h-4" />;
      case 'honeypot':
        return <AlertTriangle className="w-4 h-4" />;
      case 'rugpull':
        return <Shield className="w-4 h-4" />;
      case 'phishing':
        return <Eye className="w-4 h-4" />;
      case 'flashloan':
        return <Zap className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500';
      case 'monitoring':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 mb-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Live Threat Feed</h3>
              <p className="text-sm text-muted-foreground">Real-time security alerts for Base network</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Live</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {threats.filter(t => t.severity === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {threats.filter(t => t.severity === 'high').length}
            </div>
            <div className="text-xs text-muted-foreground">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {threats.filter(t => t.severity === 'medium').length}
            </div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {threats.filter(t => t.status === 'resolved').length}
            </div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
        </div>
      </div>

      {/* Threat Alerts */}
      <div className="space-y-4">
        {threats.map((threat) => (
          <div key={threat.id} className={cn(
            "border rounded-lg p-4 transition-all duration-200 hover:shadow-md",
            getSeverityColor(threat.severity)
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getThreatIcon(threat.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{threat.title}</h4>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusColor(threat.status)
                    )} />
                  </div>
                  <p className="text-sm opacity-90 mb-2">{threat.description}</p>
                  
                  {/* Additional Details */}
                  <div className="space-y-1">
                    {threat.affectedContract && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="font-mono">{threat.affectedContract.slice(0, 20)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                    {threat.transactionHash && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Tx Hash:</span>
                        <span className="font-mono">{threat.transactionHash.slice(0, 20)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                    {threat.estimatedLoss && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Est. Loss:</span>
                        <span className="font-semibold text-red-600">{threat.estimatedLoss}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(threat.timestamp)}
                </div>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full capitalize",
                  threat.status === 'active' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  threat.status === 'monitoring' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                  threat.status === 'resolved' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}>
                  {threat.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-muted-foreground">
        Feed updates every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}