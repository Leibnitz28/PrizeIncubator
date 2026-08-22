"use client";

import React from "react";
import type { Verdict } from "@/types/verdict";
import { PriceLine } from "./PriceLine";
import { VerdictBadge } from "./VerdictBadge";
import { RecoveryTimeline } from "./RecoveryTimeline";
import { ShareCardModal } from "./ShareCard";

export interface TrackedProduct {
  id: number;
  url: string;
  platform: "amazon" | "flipkart" | "meesho" | "shopsy";
  title?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
  verdict?: Verdict | null;
  approval_status?: "pending" | "approved" | "snoozed" | "rejected";
  notification_pref?: "instant" | "daily";
  price_threshold?: number;
}

interface ReceiptStripProps {
  product: TrackedProduct;
  isApproved: boolean;
  onApprove: () => void;
  onDelete: () => void;
  onSnooze?: () => void;
  onReject?: () => void;
  showTimeline?: boolean;
}

export function ReceiptStrip({
  product,
  isApproved,
  onApprove,
  onDelete,
  onSnooze,
  onReject,
  showTimeline = true,
}: ReceiptStripProps) {
  const [showShareModal, setShowShareModal] = React.useState(false);
  const v = product.verdict;
  const isRealDeal = v?.verdict === "real_deal";
  const isMrpInflated = v?.verdict === "mrp_inflated";

  // Calculate savings percentage
  const savingsPercent = v && v.mrp > 0 
    ? Math.round(((v.mrp - v.true_final_price) / v.mrp) * 100)
    : 0;

  return (
    <article className="relative bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm shadow-sm pt-6 pb-6 px-6 animate-receipt-print overflow-hidden">
      {/* Perforation top */}
      <div className="absolute top-0 left-0 right-0 h-2 border-b border-dashed border-line dark:border-line/20" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl text-ink dark:text-paper leading-snug">
            {product.title || v?.product || "E-Commerce Product"}
          </h2>
          <div className="flex items-center gap-2 mt-1 font-body text-xs text-ink-soft dark:text-paper/60 flex-wrap">
            <span className="uppercase font-mono font-medium tracking-wide">{product.platform}</span>
            <span>•</span>
            <span>
              {new Date(product.updated_at || product.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink dark:text-paper hover:underline truncate max-w-[180px]"
            >
              Source ↗
            </a>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowShareModal(true)}
            className="text-ink-soft hover:text-ink dark:hover:text-paper transition-colors p-1.5 rounded hover:bg-paper dark:hover:bg-ink cursor-pointer"
            title="Share Deal Card"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-ink-soft/40 hover:text-flagged transition-colors p-1.5 rounded hover:bg-flagged/5 cursor-pointer"
            title="Remove"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t border-line dark:border-line/20 my-4" />

      {/* Price Table */}
      <div className="space-y-2 font-mono text-xs text-ink dark:text-paper/90">
        <PriceLine label="MRP" value={v?.mrp} className="text-ink-soft dark:text-paper/50" strikethrough />
        <PriceLine label="Listed price" value={v?.listed_price} className="text-ink-soft dark:text-paper/50" />

        {v && v.coupon_amount !== undefined && v.coupon_amount > 0 && v.applied_coupon && (
          <PriceLine label={`Coupon (${v.applied_coupon})`} value={-v.coupon_amount} className="text-verified dark:text-[#3CD070]" />
        )}

        {v && v.bank_amount !== undefined && v.bank_amount > 0 && v.bank_offer && (
          <PriceLine label={`Bank offer (${v.bank_offer.split("(")[0].trim()})`} value={-v.bank_amount} className="text-verified dark:text-[#3CD070]" />
        )}

        <div className="border-t border-line dark:border-line/20 my-2 pt-2" />

        <div className="flex justify-between items-center text-sm font-semibold text-ink dark:text-paper">
          <span className="uppercase tracking-wider font-mono">True Final Price</span>
          <div className="flex items-baseline gap-2">
            {savingsPercent > 0 && (
              <span className="text-[10px] font-mono text-verified dark:text-[#3CD070] bg-verified/5 dark:bg-verified/15 px-1 py-0.5 rounded border border-verified/10">
                {savingsPercent}% OFF
              </span>
            )}
            <span className="text-base font-bold tabular-nums">
              ₹{v ? v.true_final_price.toLocaleString("en-IN") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* History & Delivery */}
      {v && (
        <div className="mt-4 pt-3 border-t border-line/60 dark:border-line/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-ink-soft dark:text-paper/50 gap-2">
          <div>
            90-day low: ₹{v.history["90_day_low"].toLocaleString("en-IN")} ({v.history.percentile}th percentile)
          </div>
          <div>📍 {v.delivery.eta} (PIN {v.delivery.pincode})</div>
        </div>
      )}

      {/* Badge & Reasoning */}
      <div className="mt-5 p-3.5 bg-paper/50 dark:bg-ink/30 border border-line/70 dark:border-line/10 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="font-body text-xs text-ink dark:text-paper leading-relaxed min-w-0 flex-1">
          <p className="font-semibold text-ink dark:text-paper mb-0.5">Agent Reasoning:</p>
          <p className="text-ink-soft dark:text-paper/70">{v?.reasoning || "Pending agent analysis..."}</p>
        </div>

        {v && (
          <div className="shrink-0">
            <VerdictBadge verdict={v.verdict} size="md" />
          </div>
        )}
      </div>

      {/* Recovery events timeline */}
      {v?.recovery_events && v.recovery_events.length > 0 && showTimeline && (
        <RecoveryTimeline events={v.recovery_events} />
      )}

      {/* Approval bar */}
      <div className="mt-5 pt-3 border-t border-line dark:border-line/20 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] font-body text-ink-soft dark:text-paper/50">
          {isApproved ? (
            <span className="text-verified dark:text-[#3CD070] font-mono font-medium">✓ Approved for checkout</span>
          ) : (
            <span>Human confirmation required before order placement</span>
          )}
        </div>
        <div className="flex gap-2">
          {onSnooze && !isApproved && (
            <button
              onClick={onSnooze}
              className="px-3 py-1.5 text-xs font-mono text-ink-soft dark:text-paper/60 border border-line dark:border-line/20 rounded-sm hover:bg-paper/20 dark:hover:bg-ink/50 cursor-pointer"
            >
              Snooze
            </button>
          )}
          {onReject && !isApproved && (
            <button
              onClick={onReject}
              className="px-3 py-1.5 text-xs font-mono text-flagged/80 border border-flagged/20 rounded-sm hover:bg-flagged/5 cursor-pointer"
            >
              Not Interested
            </button>
          )}
          <button
            onClick={onApprove}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
              isApproved
                ? "bg-verified text-paper"
                : "bg-ink dark:bg-paper text-paper dark:text-ink hover:bg-ink/90 dark:hover:bg-paper/90"
            }`}
          >
            {isApproved ? "Open Checkout Again" : "Approve & Open Checkout"}
          </button>
        </div>
      </div>

      {/* Perforation bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2 border-t border-dashed border-line dark:border-line/20" />

      {/* Share Card Modal */}
      <ShareCardModal
        product={product}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </article>
  );
}
