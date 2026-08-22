"use client";

import React, { useState, useEffect } from "react";
import type { TrackedProduct } from "./ReceiptStrip";

import { API_BASE } from "../config";

interface SettingsPageProps {
  pincode: string;
  onPincodeChange: (pincode: string) => void;
  products: TrackedProduct[];
  onRefreshProducts: () => void;
  onDeleteProduct: (id: number) => void;
}

export function SettingsPage({
  pincode,
  onPincodeChange,
  products,
  onRefreshProducts,
  onDeleteProduct,
}: SettingsPageProps) {
  const [localPincode, setLocalPincode] = useState(pincode);
  const [pincodeSaved, setPincodeSaved] = useState(false);
  const [globalNotifPref, setGlobalNotifPref] = useState("instant");
  const [discountThreshold, setDiscountThreshold] = useState("15");
  const [savingProductId, setSavingProductId] = useState<number | null>(null);

  useEffect(() => {
    setLocalPincode(pincode);
  }, [pincode]);

  const handleSavePincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(localPincode.trim())) return;

    onPincodeChange(localPincode.trim());
    try {
      await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: localPincode.trim() }),
      });
      setPincodeSaved(true);
      setTimeout(() => setPincodeSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save pincode to server:", err);
    }
  };

  const handleUpdateProductSetting = async (
    productId: number,
    updates: { notification_pref?: string; price_threshold?: number | null }
  ) => {
    try {
      setSavingProductId(productId);
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error("Failed to update product setting:", err);
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Delivery Location ── */}
      <div className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-verified">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h2 className="font-display text-lg text-ink dark:text-paper">Delivery Location (Pincode)</h2>
        </div>
        <p className="text-xs text-ink-soft dark:text-paper/60 leading-relaxed max-w-xl">
          The browser agent inputs this postal code into Amazon, Flipkart, Meesho, and Shopsy product pages to extract real-world delivery serviceability, extra shipping charges, and delivery timelines.
        </p>

        <form onSubmit={handleSavePincode} className="mt-4 flex items-center gap-3 max-w-sm">
          <input
            type="text"
            value={localPincode}
            onChange={(e) => setLocalPincode(e.target.value)}
            maxLength={6}
            className="flex-1 px-3.5 py-2 font-mono text-sm bg-paper/30 dark:bg-ink/30 border border-line dark:border-line/20 rounded-sm text-ink dark:text-paper focus:outline-none focus:border-ink dark:focus:border-paper"
            placeholder="e.g. 177001"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-ink dark:bg-paper text-paper dark:text-ink font-mono text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            {pincodeSaved ? "Saved ✓" : "Update PIN"}
          </button>
        </form>
      </div>

      {/* ── Notification & Alert Preferences ── */}
      <div className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2874F0]">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <h2 className="font-display text-lg text-ink dark:text-paper">Notification Alerts</h2>
        </div>
        <p className="text-xs text-ink-soft dark:text-paper/60 leading-relaxed">
          Configure how PrizeIncubator alerts you when a verified deal is discovered.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

          <div className="p-4 rounded border border-line/50 dark:border-line/20 bg-paper/20 dark:bg-ink/20">
            <label className="block font-mono text-xs font-semibold text-ink dark:text-paper mb-1">
              Minimum True Discount Threshold
            </label>
            <select
              value={discountThreshold}
              onChange={(e) => setDiscountThreshold(e.target.value)}
              className="w-full px-2.5 py-1.5 font-mono text-xs bg-white dark:bg-ink/40 border border-line dark:border-line/30 rounded text-ink dark:text-paper"
            >
              <option value="5">Alert on any drop (≥5%)</option>
              <option value="15">Moderate deals (≥15% off)</option>
              <option value="25">Deep discounts only (≥25% off)</option>
              <option value="40">Historic drops only (≥40% off)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Per-Product Management & Thresholds ── */}
      <div className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6">
        <div className="flex items-center justify-between pb-3 border-b border-line dark:border-line/20 mb-4">
          <div>
            <h2 className="font-display text-lg text-ink dark:text-paper">Tracked Products Management</h2>
            <p className="text-xs text-ink-soft dark:text-paper/60 mt-0.5">
              Customize alert frequency and target price triggers per product.
            </p>
          </div>
          <span className="font-mono text-xs text-ink-soft dark:text-paper/50">
            {products.length} Products
          </span>
        </div>

        {products.length === 0 ? (
          <p className="text-xs font-mono text-ink-soft dark:text-paper/50 py-4 text-center">
            No products tracked yet. Add products via the Ledger or Deals tab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-line/60 dark:border-line/20 text-ink-soft dark:text-paper/50">
                  <th className="py-2.5 px-3">Product / Store</th>
                  <th className="py-2.5 px-3">Current True Price</th>
                  <th className="py-2.5 px-3">Alert Mode</th>
                  <th className="py-2.5 px-3">Target Price Trigger</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 dark:divide-line/10">
                {products.map((p) => {
                  const finalPrice = p.verdict?.true_final_price || 0;
                  return (
                    <tr key={p.id} className="hover:bg-paper/20 dark:hover:bg-ink/20">
                      <td className="py-3 px-3">
                        <div className="font-medium text-ink dark:text-paper max-w-[220px] truncate" title={p.title || p.url}>
                          {p.title || p.url}
                        </div>
                        <span className="inline-block uppercase text-[10px] text-ink-soft dark:text-paper/50 font-bold mt-0.5">
                          {p.platform}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-ink dark:text-paper font-bold">
                        ₹{finalPrice ? finalPrice.toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={p.notification_pref || "instant"}
                          onChange={(e) =>
                            handleUpdateProductSetting(p.id, { notification_pref: e.target.value })
                          }
                          disabled={savingProductId === p.id}
                          className="px-2 py-1 bg-white dark:bg-ink/40 border border-line dark:border-line/20 rounded text-[11px] text-ink dark:text-paper"
                        >
                          <option value="instant">Instant (Push)</option>
                          <option value="daily">Daily Digest</option>
                          <option value="muted">Muted</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-ink-soft dark:text-paper/40">≤ ₹</span>
                          <input
                            type="number"
                            defaultValue={p.price_threshold || ""}
                            onBlur={(e) => {
                              const val = e.target.value.trim() ? Number(e.target.value) : null;
                              handleUpdateProductSetting(p.id, { price_threshold: val });
                            }}
                            placeholder="Target ₹"
                            className="w-24 px-2 py-1 bg-white dark:bg-ink/40 border border-line dark:border-line/20 rounded text-[11px] text-ink dark:text-paper"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-flagged/80 hover:text-flagged text-xs cursor-pointer p-1"
                          title="Remove product"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Agent Safety & Guardrails ── */}
      <div className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-verified">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h2 className="font-display text-lg text-ink dark:text-paper">Agent Guardrails & Safety Architecture</h2>
        </div>
        <p className="text-xs text-ink-soft dark:text-paper/60 leading-relaxed mb-4">
          Strict safety boundaries enforced at both the browser driver and API gateway levels.
        </p>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 p-2.5 rounded bg-verified/5 dark:bg-verified/10 border border-verified/20 text-ink dark:text-paper">
            <span className="text-verified font-bold text-sm">✓</span>
            <span>Autonomous Cart & Coupon Application: <strong>ENABLED</strong></span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded bg-verified/5 dark:bg-verified/10 border border-verified/20 text-ink dark:text-paper">
            <span className="text-verified font-bold text-sm">✓</span>
            <span>Navigate to Final Checkout Review Stage: <strong>ENABLED</strong></span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded bg-flagged/5 dark:bg-flagged/10 border border-flagged/30 text-flagged font-semibold">
            <span className="font-bold text-sm">✕</span>
            <span>Automated Payment / CVV / OTP Submission: <strong>HARD BLOCKED (Human in the Loop)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
