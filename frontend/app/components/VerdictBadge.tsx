"use client";

import type { VerdictLabel } from "@/types/verdict";

interface VerdictBadgeProps {
  verdict: VerdictLabel;
  reasoning?: string;
  size?: "sm" | "md" | "lg";
  showReasoning?: boolean;
}

export function VerdictBadge({ verdict, reasoning, size = "md", showReasoning = false }: VerdictBadgeProps) {
  const isRealDeal = verdict === "real_deal";
  const isMrpInflated = verdict === "mrp_inflated";

  const sizeClasses = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div
        className={`
          inline-flex items-center gap-1.5 border-2 rounded uppercase font-mono font-bold tracking-wider
          transform -rotate-4 animate-stamp select-none
          ${sizeClasses[size]}
          ${isRealDeal
            ? "border-verified text-verified bg-verified/5 dark:bg-verified/15"
            : isMrpInflated
              ? "border-flagged text-flagged bg-flagged/5 dark:bg-flagged/15 verdict-badge-inflated"
              : "border-ink dark:border-paper/60 text-ink dark:text-paper/80 bg-ink/5 dark:bg-paper/10"
          }
        `}
      >
        {isRealDeal && (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Verified Deal</span>
          </>
        )}
        {isMrpInflated && (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>MRP Inflated</span>
          </>
        )}
        {!isRealDeal && !isMrpInflated && (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Price Unchanged</span>
          </>
        )}
      </div>

      {showReasoning && reasoning && (
        <p className={`text-right max-w-[240px] leading-snug ${
          isMrpInflated ? "text-flagged/80" : "text-ink-soft dark:text-paper/50"
        } ${size === "sm" ? "text-[9px]" : "text-[10px]"} font-mono`}>
          {reasoning.length > 120 ? reasoning.slice(0, 120) + "…" : reasoning}
        </p>
      )}
    </div>
  );
}
