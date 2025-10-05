"use client";

import { useState, useEffect } from "react";
import { Search, Wallet, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { Button } from "./Button";
import { Input } from "./input";
import { cn } from "~/lib/utils";

// Create Base network client
const baseClient = createPublicClient({
  chain: base,
  transport: http()
});

interface TransactionInputProps {
  onAnalyze: (txHash: string) => void;
  isAnalyzing?: boolean;
  className?: string;
}

export function TransactionInput({ onAnalyze, isAnalyzing = false, className }: TransactionInputProps) {
  const [txHash, setTxHash] = useState("");
  const [inputMode, setInputMode] = useState<"hash" | "wallet">("hash");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [recentTxs, setRecentTxs] = useState<string[]>([]);
  
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  // Check if we're on Base network
  const isOnBase = chain?.id === base.id;

  const isValidTxHash = (hash: string) => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  };

  // Validate transaction exists on Base network
  const validateTransaction = async (hash: string) => {
    try {
      setIsValidating(true);
      setError(null);

      if (!isValidTxHash(hash)) {
        throw new Error("Invalid transaction hash format");
      }

      // Check if transaction exists on Base
      const tx = await baseClient.getTransaction({ hash: hash as `0x${string}` });
      
      if (!tx) {
        throw new Error("Transaction not found on Base network");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to validate transaction");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Fetch recent transactions for connected wallet
  const fetchRecentTransactions = async () => {
    if (!address || !isOnBase) return;

    try {
      setError(null);
      
      // Get latest block number
      const latestBlock = await baseClient.getBlockNumber();
      
      // Get recent transactions (simplified approach)
      const recentBlocks = await Promise.all([
        baseClient.getBlock({ blockNumber: latestBlock }),
        baseClient.getBlock({ blockNumber: latestBlock - 1n }),
        baseClient.getBlock({ blockNumber: latestBlock - 2n }),
      ]);

      const userTxs: string[] = [];
      for (const block of recentBlocks) {
        if (block.transactions) {
          for (const txHash of block.transactions) {
            try {
              const tx = await baseClient.getTransaction({ hash: txHash });
              if (tx.from?.toLowerCase() === address.toLowerCase()) {
                userTxs.push(txHash);
                if (userTxs.length >= 5) break;
              }
            } catch (e) {
              // Skip failed transaction fetches
            }
          }
          if (userTxs.length >= 5) break;
        }
      }

      setRecentTxs(userTxs);
    } catch (err: any) {
      console.error("Failed to fetch recent transactions:", err);
      setError("Failed to fetch recent transactions");
    }
  };

  // Switch to Base network if not already connected
  const ensureBaseNetwork = async () => {
    if (!isOnBase && switchChain) {
      try {
        await switchChain({ chainId: base.id });
      } catch (err: any) {
        setError("Please switch to Base network to continue");
      }
    }
  };

  // Fetch recent transactions when wallet connects and on Base
  useEffect(() => {
    if (isConnected && isOnBase && inputMode === "wallet") {
      fetchRecentTransactions();
    }
  }, [isConnected, isOnBase, inputMode, address]);

  const handleAnalyze = async () => {
    setError(null);
    
    if (inputMode === "hash") {
      if (isValidTxHash(txHash)) {
        const isValid = await validateTransaction(txHash);
        if (isValid) {
          onAnalyze(txHash);
        }
      }
    } else if (inputMode === "wallet") {
      if (!isConnected) {
        setError("Please connect your wallet first");
        return;
      }
      
      if (!isOnBase) {
        await ensureBaseNetwork();
        return;
      }

      if (recentTxs.length > 0) {
        // Analyze the most recent transaction
        onAnalyze(recentTxs[0]);
      } else {
        setError("No recent transactions found for this wallet");
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {isConnected && !isOnBase && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Switch to Base Network</span>
            </div>
            <Button 
              onClick={ensureBaseNetwork}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-sm"
            >
              Switch Network
            </Button>
          </div>
        </div>
      )}

      {/* Input Mode Toggle */}
      <div className="flex bg-muted rounded-lg p-1">
        <button
          onClick={() => {
            setInputMode("hash");
            setError(null);
          }}
          className={cn(
            "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
            inputMode === "hash"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Transaction Hash
        </button>
        <button
          onClick={() => {
            setInputMode("wallet");
            setError(null);
            if (isConnected && isOnBase) {
              fetchRecentTransactions();
            }
          }}
          className={cn(
            "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
            inputMode === "wallet"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Wallet className="w-4 h-4 inline mr-2" />
          Connect Wallet
        </button>
      </div>

      {/* Transaction Hash Input */}
      {inputMode === "hash" && (
        <div className="space-y-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter transaction hash (0x...)"
              value={txHash}
              onChange={(e) => {
                setTxHash(e.target.value);
                setError(null);
              }}
              className={cn(
                "pr-12",
                txHash && !isValidTxHash(txHash) && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          
          {txHash && !isValidTxHash(txHash) && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              Please enter a valid transaction hash
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!isValidTxHash(txHash) || isAnalyzing || isValidating}
            isLoading={isAnalyzing || isValidating}
            className="w-full"
          >
            {isValidating 
              ? "Validating..." 
              : isAnalyzing 
                ? "Analyzing Transaction..." 
                : "Analyze Transaction"
            }
          </Button>
        </div>
      )}

      {/* Wallet Connection */}
      {inputMode === "wallet" && (
        <div className="space-y-3">
          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Connect your wallet to analyze recent transactions on Base
              </div>
              <div className="space-y-2">
                {connectors.map((connector: any) => (
                  <Button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect {connector.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Wallet Connected</span>
                      {isOnBase && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Network: {chain?.name || "Unknown"}
                    </div>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isOnBase ? "bg-green-500" : "bg-yellow-500"
                  )} />
                </div>
              </div>

              {/* Recent Transactions */}
              {isOnBase && recentTxs.length > 0 && (
                <div className="bg-card border rounded-lg p-4">
                  <div className="font-medium text-sm mb-2">Recent Transactions ({recentTxs.length})</div>
                  <div className="space-y-1">
                    {recentTxs.slice(0, 3).map((tx, index) => (
                      <div key={tx} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">#{index + 1}:</span>
                        <span className="font-mono">{tx.slice(0, 10)}...{tx.slice(-6)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isOnBase || recentTxs.length === 0}
                isLoading={isAnalyzing}
                className="w-full"
              >
                {!isOnBase 
                  ? "Switch to Base Network" 
                  : recentTxs.length === 0 
                    ? "No Recent Transactions Found"
                    : isAnalyzing 
                      ? "Analyzing Recent Transactions..." 
                      : `Analyze Recent Transaction (${recentTxs.length} found)`
                }
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                This will analyze your most recent transaction for security risks
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Examples */}
      <div className="border-t pt-4">
        <div className="text-sm font-medium mb-2">Quick Examples</div>
        <div className="space-y-2">
          <button
            onClick={() => {
              setInputMode("hash");
              setTxHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
              setError(null);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Try sample safe transaction
          </button>
          <button
            onClick={() => {
              setInputMode("hash");
              setTxHash("0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
              setError(null);
            }}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Try sample risky transaction
          </button>
        </div>
      </div>
    </div>
  );
}