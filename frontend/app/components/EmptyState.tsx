"use client";

import React from "react";

export type EmptyStateType = "deals" | "ledger" | "approvals" | "compare" | "history" | "logs";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ type, title, description, actionText, onAction }: EmptyStateProps) {
  const meta: Record<EmptyStateType, { defaultTitle: string; defaultDesc: string; icon: React.ReactNode }> = {
    deals: {
      defaultTitle: "No Verified Deals in Feed",
      defaultDesc: "All tracked products are either at standard pricing or have inflated MRP discounts filtered out. Track more products to uncover deep price drops.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft dark:text-paper/60">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          <path d="M9 14l6-6" />
        </svg>
      ),
    },
    ledger: {
      defaultTitle: "Nothing on the Ledger Yet",
      defaultDesc: "Paste a product URL from Amazon, Flipkart, Meesho, or Shopsy above to let the browser agent verify true checkout pricing.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft dark:text-paper/60">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    approvals: {
      defaultTitle: "Approval Queue Clear",
      defaultDesc: "No verified deals are currently pending checkout approval. When a verified real deal drops below market average, it will appear here for 1-click human approval.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-verified">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    compare: {
      defaultTitle: "No Cross-Platform Items",
      defaultDesc: "Track identical items across multiple e-commerce platforms (Amazon, Flipkart, Meesho, Shopsy) to unlock real-time side-by-side deal analysis.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft dark:text-paper/60">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    history: {
      defaultTitle: "No Price History Logs",
      defaultDesc: "Price trends and 90-day percentile ranges will be recorded as the agent periodically checks pricing.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft dark:text-paper/60">
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
      ),
    },
    logs: {
      defaultTitle: "Agent Waiting for URL",
      defaultDesc: "Submit a product URL above to watch the headless browser agent execute real-time checkout verification.",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft dark:text-paper/60">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  };

  const current = meta[type] || meta.ledger;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-[#1C1F2E] border border-dashed border-line dark:border-line/20 rounded-sm">
      <div className="w-16 h-16 mb-5 flex items-center justify-center rounded-full bg-paper/80 dark:bg-ink/40 border border-line/50 dark:border-line/20 shadow-inner">
        {current.icon}
      </div>
      <h3 className="font-display text-lg sm:text-xl text-ink dark:text-paper">
        {title || current.defaultTitle}
      </h3>
      <p className="mt-2 text-ink-soft dark:text-paper/60 font-body text-sm max-w-md leading-relaxed">
        {description || current.defaultDesc}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 bg-ink dark:bg-paper text-paper dark:text-ink font-body text-xs font-medium rounded-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
