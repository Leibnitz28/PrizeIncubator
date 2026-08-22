"use client";

import React from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Connection Error",
  message = "Failed to communicate with PrizeIncubator backend agent server.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-flagged/5 dark:bg-flagged/10 border border-flagged/30 rounded-sm">
      <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-full bg-flagged/10 text-flagged">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="font-display text-lg text-flagged font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs font-mono text-ink-soft dark:text-paper/60 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-4 py-1.5 bg-flagged text-paper font-mono text-xs font-semibold rounded-sm hover:bg-flagged/90 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
