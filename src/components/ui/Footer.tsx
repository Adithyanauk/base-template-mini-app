"use client";

import { Shield, Activity, Search, Zap } from "lucide-react";

export type Tab = "dashboard" | "simulator" | "inspector" | "live-feed";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Footer({ activeTab, setActiveTab }: FooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg backdrop-blur-sm">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
            activeTab === "dashboard" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="w-5 h-5 mb-1" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
            activeTab === "simulator"
              ? "text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="w-5 h-5 mb-1" />
          Simulator
        </button>
        <button
          onClick={() => setActiveTab("inspector")}
          className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
            activeTab === "inspector"
              ? "text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-5 h-5 mb-1" />
          Inspector
        </button>
        <button
          onClick={() => setActiveTab("live-feed")}
          className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
            activeTab === "live-feed"
              ? "text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-5 h-5 mb-1" />
          Live Feed
        </button>
      </div>
    </div>
  );
}
