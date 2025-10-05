"use client";

import { useState, useCallback } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer, Tab } from "~/components/ui/Footer";
import { TransactionInput } from "~/components/ui/TransactionInput";
import { RiskScore, RiskScoreCard } from "~/components/ui/RiskScore";
import { TransactionSimulator } from "~/components/ui/TransactionSimulator";
import { ContractInspector } from "~/components/ui/ContractInspector";
import { LiveFeed } from "~/components/ui/LiveFeed";
import { Shield, TrendingUp, Users, Clock } from "lucide-react";
import { APP_NAME } from "~/lib/constants";
import { riskAnalysisService, RiskAnalysisResult } from "~/lib/riskAnalysis";

interface BaseGuardianProps {
  title?: string;
}

export default function BaseGuardian({ title = APP_NAME }: BaseGuardianProps) {
  const { isSDKLoaded, context } = useMiniApp();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentAnalysis, setCurrentAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string>("");

  // Enhanced function to analyze transactions using real service
  const analyzeTransaction = useCallback(async (txHash: string) => {
    setIsAnalyzing(true);
    setCurrentTxHash(txHash);
    setCurrentAnalysis(null);
    
    try {
      // Add realistic delay for better UX
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await riskAnalysisService.analyzeTransaction(txHash);
      setCurrentAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Error handling - could show error state
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="min-h-screen bg-background"
    >
      <div className="mx-auto py-2 px-4 pb-20">
        <Header />

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your transaction safety shield for Base network
          </p>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">42.3K</div>
                    <div className="text-xs text-muted-foreground">Safe Transactions</div>
                  </div>
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">1.2K</div>
                    <div className="text-xs text-muted-foreground">Threats Blocked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Input */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Analyze Transaction</h2>
              <TransactionInput
                onAnalyze={analyzeTransaction}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Analysis Results */}
            {currentAnalysis && (
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
                <RiskScore result={currentAnalysis} isLoading={isAnalyzing} />
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {[
                  { type: 'safe', time: '2 min ago', desc: 'Uniswap V3 swap analyzed' },
                  { type: 'risky', time: '5 min ago', desc: 'High slippage detected' },
                  { type: 'safe', time: '8 min ago', desc: 'USDC transfer verified' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'safe' ? 'bg-green-500' : 
                        activity.type === 'risky' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span>{activity.desc}</span>
                    </div>
                    <span className="text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Simulator Tab */}
        {activeTab === "simulator" && (
          <div className="space-y-6">
            <TransactionSimulator />
          </div>
        )}

        {/* Contract Inspector Tab */}
        {activeTab === "inspector" && (
          <div className="space-y-6">
            <ContractInspector />
          </div>
        )}

        {/* Live Feed Tab */}
        {activeTab === "live-feed" && (
          <div className="space-y-6">
            <LiveFeed />
          </div>
        )}

        <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}