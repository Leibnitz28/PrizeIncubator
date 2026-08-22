"use client";

import React from "react";
import type { RecoveryEvent } from "@/types/verdict";

interface RecoveryTimelineProps {
  events: RecoveryEvent[];
}

export function RecoveryTimeline({ events }: RecoveryTimelineProps) {
  if (!events || events.length === 0) return null;

  // Icon mapping for common issues
  const getIssueIcon = (issue: string) => {
    const text = issue.toLowerCase();
    if (text.includes("pincode") || text.includes("modal")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      );
    }
    if (text.includes("coupon") || text.includes("expired") || text.includes("invalid")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="7" width="20" height="10" rx="2" />
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      );
    }
    if (text.includes("offers") || text.includes("bank") || text.includes("collapsed")) {
      return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  };

  return (
    <div className="mt-5 p-4 border border-dashed border-line dark:border-line/20 rounded bg-paper/30 dark:bg-ink/10">
      <div className="flex items-center gap-2 mb-4 border-b border-line dark:border-line/20 pb-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verified dark:bg-[#3CD070] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-verified dark:bg-[#3CD070]"></span>
        </span>
        <h4 className="font-mono text-[10px] font-bold text-ink-soft dark:text-paper/60 uppercase tracking-wider">
          Technical Depth & Self-Healing Log ({events.length} events)
        </h4>
      </div>

      <div className="relative border-l border-line/40 dark:border-line/10 ml-2.5 pl-4 space-y-4">
        {events.map((event, index) => (
          <div key={index} className="relative font-mono text-xs leading-relaxed animate-receipt-print">
            {/* Step node */}
            <span className="absolute -left-[25px] top-0.5 w-4.5 h-4.5 rounded-full bg-paper dark:bg-ink border border-line dark:border-line/20 flex items-center justify-center text-flagged dark:text-[#F36B5E] shadow-sm">
              {getIssueIcon(event.issue)}
            </span>

            {/* Event Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-flagged dark:text-[#F36B5E] font-semibold bg-flagged/5 dark:bg-flagged/10 px-1 py-0.2 rounded border border-flagged/10">
                  INTERCEPTED
                </span>
                <span className="text-ink dark:text-paper/90 font-medium">{event.issue}</span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-ink-soft dark:text-paper/60 pl-1.5">
                <span className="text-verified dark:text-[#3CD070] font-bold">↳ ACTION:</span>
                <span className="flex-1 text-verified dark:text-[#3CD070] font-medium">{event.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
