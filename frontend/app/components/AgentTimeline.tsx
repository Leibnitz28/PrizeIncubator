"use client";

import React from "react";

interface AgentLogMessage {
  id: string;
  type: string;
  message: string;
  status: "info" | "success" | "warning" | "error";
  timestamp: string;
}

interface AgentTimelineProps {
  logs: AgentLogMessage[];
  wsConnected: boolean;
  onClear: () => void;
}

export function AgentTimeline({ logs, wsConnected, onClear }: AgentTimelineProps) {
  // Helper to choose icon based on message content
  const getStepIcon = (msg: string, status: string) => {
    const text = msg.toLowerCase();
    if (text.includes("launching") || text.includes("browser") || text.includes("navigating")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    }
    if (text.includes("loaded") || text.includes("page")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    }
    if (text.includes("extracting") || text.includes("title") || text.includes("found")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    }
    if (text.includes("pincode") || text.includes("delivery") || text.includes("📍")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      );
    }
    if (text.includes("coupon") || text.includes("ticket") || text.includes("code") || text.includes("apply") || text.includes("applied")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="10" rx="2" />
          <circle cx="6" cy="12" r="1" />
          <circle cx="18" cy="12" r="1" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      );
    }
    if (text.includes("bank") || text.includes("card") || text.includes("hdfc") || text.includes("icici") || text.includes("sbi") || text.includes("axis")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    }
    if (status === "success") {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (status === "warning" || status === "error") {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    }
    return (
      <div className="w-1.5 h-1.5 rounded-full bg-current" />
    );
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "success":
        return "bg-verified/15 text-verified border-verified/30 dark:bg-verified/25 dark:text-[#3CD070] dark:border-verified/40";
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40";
      case "error":
        return "bg-flagged/10 text-flagged border-flagged/30 dark:bg-flagged/20 dark:text-[#F36B5E] dark:border-flagged/40";
      default:
        return "bg-paper dark:bg-ink border-line dark:border-line/20 text-ink-soft dark:text-paper/60";
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 min-h-screen bg-ink dark:bg-[#0C0E14] border-l border-line/10 shrink-0" aria-label="Agent run log">
      {/* Header */}
      <div className="px-4 py-4 border-b border-line/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-verified dark:bg-[#3CD070] animate-pulse" />
          <h2 className="font-mono text-xs font-semibold text-paper dark:text-paper/80 uppercase tracking-wider">
            Agent Visualizer
          </h2>
        </div>
        <span className="font-mono text-[10px] text-paper/40 bg-paper/5 px-2 py-0.5 rounded">
          {logs.length} steps
        </span>
      </div>

      {/* Timeline steps */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-paper/30 py-8">
            <svg className="w-8 h-8 mb-3 opacity-30 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <p className="font-mono text-xs max-w-[180px] leading-relaxed">
              Waiting for live agent run to begin...
            </p>
          </div>
        ) : (
          <div className="relative border-l border-line/10 ml-3.5 space-y-6">
            {logs.map((log, index) => {
              const isLast = index === logs.length - 1;
              return (
                <div key={log.id} className="relative group animate-receipt-print">
                  {/* Indicator node */}
                  <span
                    className={`
                      absolute -left-[23px] top-1.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-300
                      ${getStatusColors(log.status)}
                      ${isLast && log.status !== "success" && log.status !== "error" ? "animate-pulse ring-4 ring-paper/5" : ""}
                    `}
                  >
                    {getStepIcon(log.message, log.status)}
                  </span>

                  {/* Content details */}
                  <div className="pl-4">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-mono text-[9px] text-paper/30">{log.timestamp}</span>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-paper/40 px-1 bg-paper/5 rounded">
                        {log.type.replace("agent_", "")}
                      </span>
                    </div>
                    <p
                      className={`
                        font-mono text-xs leading-relaxed
                        ${log.status === "success" ? "text-verified dark:text-[#3CD070] font-medium" : ""}
                        ${log.status === "warning" ? "text-amber-400 font-medium" : ""}
                        ${log.status === "error" ? "text-flagged font-medium" : ""}
                        ${log.status === "info" ? "text-paper/80 dark:text-paper/70" : ""}
                      `}
                    >
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / WebSocket Status */}
      <div className="px-4 py-3 border-t border-line/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-verified dark:bg-[#3CD070]" : "bg-flagged animate-pulse"}`} />
          <span className="font-mono text-[10px] text-paper/50 uppercase tracking-wider">
            {wsConnected ? "WS connected" : "WS disconnected"}
          </span>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] font-mono text-paper/40 hover:text-paper/80 cursor-pointer hover:underline"
          >
            Clear Log
          </button>
        )}
      </div>
    </aside>
  );
}
