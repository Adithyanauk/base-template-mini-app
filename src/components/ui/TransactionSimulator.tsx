"use client";

import { useState } from "react";
import { ArrowRight, AlertTriangle, CheckCircle, DollarSign, Clock, TrendingDown } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface TokenAmount {
  symbol: string;
  amount: string;
  decimals: number;
  address: string;
}

interface SimulationResult {
  expectedInput: TokenAmount;
  expectedOutput: TokenAmount;
  actualInput: TokenAmount;
  actualOutput: TokenAmount;
  slippage: number;
  priceImpact: number;
  gasUsed: string;
  riskFactors: {
    mevRisk: boolean;
    sandwichRisk: boolean;
    frontRunRisk: boolean;
    highSlippage: boolean;
  };
  recommendations: string[];
}

interface TransactionSimulatorProps {
  className?: string;
}

export function TransactionSimulator({ className }: TransactionSimulatorProps) {
  const [contractAddress, setContractAddress] = useState("");
  const [calldata, setCalldata] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const simulateTransaction = async () => {
    setIsSimulating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock simulation result
    const mockResult: SimulationResult = {
      expectedInput: {
        symbol: "WETH",
        amount: "1.0",
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      },
      expectedOutput: {
        symbol: "USDC",
        amount: "2,847.52",
        decimals: 6,
        address: "0xA0b86a33E6417b15A62c7BDbdCD35c0bD8Ba8Cff"
      },
      actualInput: {
        symbol: "WETH",
        amount: "1.0",
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      },
      actualOutput: {
        symbol: "USDC",
        amount: "2,805.23",
        decimals: 6,
        address: "0xA0b86a33E6417b15A62c7BDbdCD35c0bD8Ba8Cff"
      },
      slippage: 1.49,
      priceImpact: 0.32,
      gasUsed: "147,832",
      riskFactors: {
        mevRisk: true,
        sandwichRisk: true,
        frontRunRisk: false,
        highSlippage: false
      },
      recommendations: [
        "Consider using a private mempool to avoid MEV",
        "Sandwich attack risk detected - use lower slippage tolerance",
        "Transaction likely to succeed with minimal price impact"
      ]
    };
    
    setSimulationResult(mockResult);
    setIsSimulating(false);
  };

  const getRiskLevel = (result: SimulationResult): 'low' | 'medium' | 'high' => {
    const riskCount = Object.values(result.riskFactors).filter(Boolean).length;
    if (riskCount === 0) return 'low';
    if (riskCount <= 2) return 'medium';
    return 'high';
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction Parameters</h3>
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
          <div>
            <label className="block text-sm font-medium mb-2">Call Data</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="0x..."
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
            />
          </div>
          <Button
            onClick={simulateTransaction}
            disabled={!contractAddress || !calldata || isSimulating}
            isLoading={isSimulating}
            className="w-full"
          >
            {isSimulating ? "Simulating Transaction..." : "Simulate Transaction"}
          </Button>
        </div>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className={cn(
            "border rounded-lg p-6",
            getRiskColor(getRiskLevel(simulationResult))
          )}>
            <div className="flex items-center gap-3 mb-3">
              {getRiskLevel(simulationResult) === 'low' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
              <h3 className="text-lg font-semibold capitalize">
                {getRiskLevel(simulationResult)} Risk Transaction
              </h3>
            </div>
            <p className="text-sm opacity-90">
              {getRiskLevel(simulationResult) === 'low' 
                ? "Transaction appears safe to execute with minimal risks detected."
                : getRiskLevel(simulationResult) === 'medium'
                ? "Moderate risks detected. Consider additional precautions."
                : "High risk transaction. Consider avoiding or using protection measures."
              }
            </p>
          </div>

          {/* Token Swap Comparison */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Expected vs Actual Results</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Expected */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Expected</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{simulationResult.expectedInput.amount}</div>
                    <div className="text-sm text-muted-foreground">{simulationResult.expectedInput.symbol}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{simulationResult.expectedOutput.amount}</div>
                    <div className="text-sm text-muted-foreground">{simulationResult.expectedOutput.symbol}</div>
                  </div>
                </div>
              </div>

              {/* Actual */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Simulated Actual</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{simulationResult.actualInput.amount}</div>
                    <div className="text-sm text-muted-foreground">{simulationResult.actualInput.symbol}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-red-600">{simulationResult.actualOutput.amount}</div>
                    <div className="text-sm text-muted-foreground">{simulationResult.actualOutput.symbol}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Difference Alert */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {((parseFloat(simulationResult.expectedOutput.amount.replace(/,/g, '')) - 
                     parseFloat(simulationResult.actualOutput.amount.replace(/,/g, ''))) / 
                     parseFloat(simulationResult.expectedOutput.amount.replace(/,/g, '')) * 100).toFixed(2)}% 
                  less output than expected due to slippage and MEV
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{simulationResult.slippage}%</div>
                  <div className="text-xs text-muted-foreground">Slippage</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{simulationResult.priceImpact}%</div>
                  <div className="text-xs text-muted-foreground">Price Impact</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{simulationResult.gasUsed}</div>
                  <div className="text-xs text-muted-foreground">Gas Used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Analysis</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {Object.entries(simulationResult.riskFactors).map(([key, active]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    active ? "bg-red-500" : "bg-green-500"
                  )} />
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    active 
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  )}>
                    {active ? "Detected" : "Clear"}
                  </span>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {simulationResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}