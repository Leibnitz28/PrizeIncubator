"use client";

import React, { useState, useEffect } from "react";
import type { Verdict } from "@/types/verdict";
import { VerdictBadge } from "./VerdictBadge";

import { API_BASE } from "../config";

export interface CompareProductItem {
  id: number;
  url: string;
  platform: "amazon" | "flipkart" | "meesho" | "shopsy";
  title?: string;
  pincode?: string;
  product_group_id?: string;
  approval_status?: "pending" | "approved" | "snoozed" | "rejected";
  notification_pref?: "instant" | "daily";
  price_threshold?: number;
  created_at: string;
  updated_at: string;
  verdict?: Verdict | null;
  true_final_price: number;
  listed_price: number;
  mrp: number;
  coupon_amount: number;
  bank_amount: number;
  delivery_eta?: string | null;
  serviceable?: boolean;
}

export interface CompareGroup {
  groupId: string;
  groupTitle: string;
  productCount: number;
  platformCount: number;
  platforms: ("amazon" | "flipkart" | "meesho" | "shopsy")[];
  bestPriceProductId: number;
  bestPlatform: "amazon" | "flipkart" | "meesho" | "shopsy";
  bestTruePrice: number;
  highestTruePrice: number;
  potentialSavings: number;
  isMultiPlatform: boolean;
  products: CompareProductItem[];
}

interface CompareCardProps {
  onTrackPlatform?: (url: string) => void;
  onApprove?: (product: CompareProductItem) => void;
}

export function CompareCard({ onTrackPlatform, onApprove }: CompareCardProps) {
  const [groups, setGroups] = useState<CompareGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "multi">("all");

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/compare`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to load comparisons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisons();
  }, []);

  const platformMeta = {
    amazon: { name: "Amazon", color: "text-[#FF9900] bg-[#FF9900]/10 border-[#FF9900]/30", badge: "bg-[#FF9900] text-black" },
    flipkart: { name: "Flipkart", color: "text-[#2874F0] bg-[#2874F0]/10 border-[#2874F0]/30", badge: "bg-[#2874F0] text-white" },
    meesho: { name: "Meesho", color: "text-[#9E206A] bg-[#9E206A]/10 border-[#9E206A]/30", badge: "bg-[#9E206A] text-white" },
    shopsy: { name: "Shopsy", color: "text-[#E85D04] bg-[#E85D04]/10 border-[#E85D04]/30", badge: "bg-[#E85D04] text-white" },
  };

  const filteredGroups = groups.filter((g) => {
    if (filter === "multi") return g.isMultiPlatform;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#1C1F2E] p-4 border border-line dark:border-line/20 rounded-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 font-mono text-xs rounded transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-ink text-paper dark:bg-paper dark:text-ink font-semibold"
                : "bg-paper/50 dark:bg-ink/50 text-ink-soft dark:text-paper/70 hover:bg-paper dark:hover:bg-ink"
            }`}
          >
            All Products ({groups.length})
          </button>
          <button
            onClick={() => setFilter("multi")}
            className={`px-3 py-1.5 font-mono text-xs rounded transition-colors cursor-pointer ${
              filter === "multi"
                ? "bg-verified text-paper font-semibold"
                : "bg-paper/50 dark:bg-ink/50 text-ink-soft dark:text-paper/70 hover:bg-paper dark:hover:bg-ink"
            }`}
          >
            Cross-Platform Only ({groups.filter((g) => g.isMultiPlatform).length})
          </button>
        </div>

        <button
          onClick={fetchComparisons}
          className="font-mono text-xs text-ink-soft dark:text-paper/60 hover:text-ink dark:hover:text-paper flex items-center gap-1.5 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Refresh Prices
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6 animate-pulse">
              <div className="h-6 bg-line/60 dark:bg-line/20 rounded w-2/3 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="h-40 bg-line/30 dark:bg-line/10 rounded" />
                <div className="h-40 bg-line/30 dark:bg-line/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1C1F2E] border border-dashed border-line dark:border-line/20 rounded-sm p-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-paper dark:bg-ink/40 text-ink-soft">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="font-display text-lg text-ink dark:text-paper">No Cross-Platform Comparisons Yet</h3>
          <p className="text-ink-soft dark:text-paper/60 text-sm mt-2 max-w-md mx-auto">
            Track the same product on multiple stores (e.g. Sony XM5 on Amazon and Flipkart) to unlock real-time side-by-side deal analysis!
          </p>
        </div>
      ) : (
        filteredGroups.map((group) => (
          <div
            key={group.groupId}
            className={`bg-white dark:bg-[#1C1F2E] border rounded-sm p-6 transition-all ${
              group.isMultiPlatform && group.potentialSavings > 0
                ? "border-verified/40 dark:border-verified/40 shadow-sm"
                : "border-line dark:border-line/20"
            }`}
          >
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-line dark:border-line/20">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-lg sm:text-xl text-ink dark:text-paper leading-tight">
                    {group.groupTitle}
                  </h2>
                  {group.isMultiPlatform ? (
                    <span className="px-2 py-0.5 bg-verified/10 text-verified text-[11px] font-mono font-medium rounded border border-verified/30">
                      {group.platformCount} Stores Compared
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-paper/60 dark:bg-ink/40 text-ink-soft dark:text-paper/50 text-[11px] font-mono rounded border border-line dark:border-line/20">
                      1 Store Tracked
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-ink-soft dark:text-paper/50 mt-1">
                  Group ID: <span className="text-ink dark:text-paper/70 font-semibold">{group.groupId}</span>
                </p>
              </div>

              {group.isMultiPlatform && group.potentialSavings > 0 && (
                <div className="sm:text-right shrink-0 bg-verified/10 dark:bg-verified/15 px-3 py-2 rounded border border-verified/30">
                  <div className="text-xs font-mono text-verified dark:text-[#3CD070] font-bold">
                    Arbitrage Savings: ₹{group.potentialSavings.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] font-mono text-ink-soft dark:text-paper/60 mt-0.5">
                    Cheaper on {platformMeta[group.bestPlatform]?.name || group.bestPlatform}
                  </div>
                </div>
              )}
            </div>

            {/* Side-by-side store cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {group.products.map((prod) => {
                const isWinner = group.isMultiPlatform && prod.id === group.bestPriceProductId && group.potentialSavings > 0;
                const meta = platformMeta[prod.platform] || platformMeta.amazon;

                return (
                  <div
                    key={prod.id}
                    className={`relative p-5 rounded-sm border transition-all flex flex-col justify-between ${
                      isWinner
                        ? "bg-verified/5 dark:bg-verified/10 border-verified/50 shadow-sm"
                        : "bg-paper/30 dark:bg-ink/20 border-line dark:border-line/20"
                    }`}
                  >
                    {isWinner && (
                      <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-verified text-paper font-mono text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                        ★ Best Price Store
                      </div>
                    )}

                    <div>
                      {/* Platform header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${meta.color}`}>
                          {meta.name}
                        </span>
                        {prod.verdict && (
                          <div className="scale-75 origin-right">
                            <VerdictBadge verdict={prod.verdict.verdict} size="sm" />
                          </div>
                        )}
                      </div>

                      {/* True Final Price */}
                      <div className="mb-4">
                        <div className="text-[11px] font-mono text-ink-soft dark:text-paper/60">True Final Price</div>
                        <div className="font-mono text-2xl font-bold text-ink dark:text-paper mt-0.5">
                          ₹{(prod.true_final_price || prod.listed_price).toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-ink-soft dark:text-paper/50 mt-1">
                          <span className="line-through">MRP ₹{prod.mrp.toLocaleString("en-IN")}</span>
                          <span>•</span>
                          <span>Listed: ₹{prod.listed_price.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Breakdown lines */}
                      <div className="space-y-1.5 py-3 border-t border-b border-line/50 dark:border-line/20 text-xs font-mono">
                        {prod.coupon_amount > 0 ? (
                          <div className="flex items-center justify-between text-verified dark:text-[#3CD070]">
                            <span>🎟️ Coupon Discount</span>
                            <span>-₹{prod.coupon_amount.toLocaleString("en-IN")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-ink-soft/60 dark:text-paper/40">
                            <span>🎟️ Coupon</span>
                            <span>None verified</span>
                          </div>
                        )}

                        {prod.bank_amount > 0 ? (
                          <div className="flex items-center justify-between text-verified dark:text-[#3CD070]">
                            <span>🏦 Bank Offer</span>
                            <span>-₹{prod.bank_amount.toLocaleString("en-IN")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-ink-soft/60 dark:text-paper/40">
                            <span>🏦 Bank Offer</span>
                            <span>None</span>
                          </div>
                        )}

                        {prod.delivery_eta && (
                          <div className="flex items-center justify-between text-ink-soft dark:text-paper/60 pt-1">
                            <span>🚚 Delivery</span>
                            <span>{prod.delivery_eta}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-2 flex items-center justify-between gap-3">
                      <a
                        href={prod.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 text-center py-2 px-3 rounded-sm font-mono text-xs font-medium transition-all ${
                          isWinner
                            ? "bg-verified text-paper hover:bg-verified/90 font-semibold"
                            : "bg-ink dark:bg-paper text-paper dark:text-ink hover:opacity-90"
                        }`}
                      >
                        Open on {meta.name} →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
