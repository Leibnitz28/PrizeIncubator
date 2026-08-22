"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ReceiptStrip, type TrackedProduct } from "./ReceiptStrip";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

import { API_BASE } from "../config";

interface DealsFeedProps {
  approvedIds: number[];
  onApprove: (product: TrackedProduct) => void;
  onDelete: (id: number) => void;
  onRefreshTrigger?: number; // toggle to trigger reload
}

export function DealsFeed({ approvedIds, onApprove, onDelete, onRefreshTrigger }: DealsFeedProps) {
  const [deals, setDeals] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/deals`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
        setError(null);
      } else {
        throw new Error("Failed to load deals feed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals, onRefreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6 animate-pulse">
            <div className="h-5 bg-line/60 dark:bg-line/20 rounded w-3/4 mb-3" />
            <div className="h-3 bg-line/40 dark:bg-line/10 rounded w-1/2 mb-6" />
            <div className="space-y-2">
              <div className="h-3 bg-line/40 dark:bg-line/10 rounded w-full" />
              <div className="h-3 bg-line/40 dark:bg-line/10 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDeals} />;
  }

  if (deals.length === 0) {
    return <EmptyState type="deals" onAction={fetchDeals} actionText="Refresh Feed" />;
  }

  return (
    <div className="space-y-8">
      {deals.map((product, index) => (
        <div key={product.id} className="relative">
          {/* Rank Ribbon */}
          <div className="absolute -top-3 left-4 z-10 bg-verified dark:bg-[#3CD070] text-paper dark:text-ink font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-verified/25 select-none uppercase">
            Rank #{index + 1} • {product.verdict?.history.percentile}th percentile
          </div>
          
          <ReceiptStrip
            product={product}
            isApproved={approvedIds.includes(product.id)}
            onApprove={() => onApprove(product)}
            onDelete={() => {
              onDelete(product.id);
              setDeals(prev => prev.filter(d => d.id !== product.id));
            }}
          />
        </div>
      ))}
    </div>
  );
}
