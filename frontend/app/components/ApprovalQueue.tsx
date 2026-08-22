"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ReceiptStrip, type TrackedProduct } from "./ReceiptStrip";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

import { API_BASE } from "../config";

interface ApprovalQueueProps {
  onRefreshTrigger?: number;
}

export function ApprovalQueue({ onRefreshTrigger }: ApprovalQueueProps) {
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        // Filters to only show deals that qualified as real deals and are pending action
        setProducts(data);
        setError(null);
      } else {
        throw new Error("Failed to load approval list");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, onRefreshTrigger]);

  const handleApprovalAction = async (id: number, action: "approve" | "snooze" | "reject", url?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  approval_status:
                    action === "approve"
                      ? "approved"
                      : action === "snooze"
                        ? "snoozed"
                        : "rejected",
                }
              : p
          )
        );

        if (action === "approve" && url) {
          window.open(url, "_blank");
        }
      }
    } catch {
      // ignore
    }
  };

  const displayedDeals = products.filter(
    (p) => p.verdict?.verdict === "real_deal" && p.approval_status !== "rejected"
  );

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
    return <ErrorState message={error} onRetry={fetchProducts} />;
  }

  if (displayedDeals.length === 0) {
    return <EmptyState type="approvals" onAction={fetchProducts} actionText="Check Queue" />;
  }

  return (
    <div className="space-y-8 animate-receipt-print">
      {displayedDeals.map((product) => {
        const isApproved = product.approval_status === "approved";
        const isSnoozed = product.approval_status === "snoozed";

        return (
          <div key={product.id} className="relative">
            {isSnoozed && (
              <div className="absolute -top-3 left-4 z-10 bg-amber-500 text-ink dark:text-paper font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-amber-600/35 uppercase">
                🔕 Snoozed
              </div>
            )}
            
            <ReceiptStrip
              product={product}
              isApproved={isApproved}
              onApprove={() => handleApprovalAction(product.id, "approve", product.url)}
              onSnooze={() => handleApprovalAction(product.id, "snooze")}
              onReject={() => handleApprovalAction(product.id, "reject")}
              onDelete={() => {
                setProducts((prev) => prev.filter((p) => p.id !== product.id));
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
