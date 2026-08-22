"use client";

import { useState } from "react";

import { API_BASE } from "../config";

interface TrackFormProps {
  pincode: string;
  onTracked: () => void;
  onError: (msg: string) => void;
}

export function TrackForm({ pincode, onTracked, onError }: TrackFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const prefillDemo = (demoUrl: string) => {
    setUrl(demoUrl);
    onError("");
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUrl = url.trim();

    if (!targetUrl) {
      onError("Please paste a product URL");
      return;
    }
    if (
      !targetUrl.includes("amazon.in") &&
      !targetUrl.includes("amazon.com") &&
      !targetUrl.includes("flipkart.com") &&
      !targetUrl.includes("meesho.com") &&
      !targetUrl.includes("shopsy.in")
    ) {
      onError("Please enter a valid Amazon, Flipkart, Meesho, or Shopsy product URL");
      return;
    }

    onError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, pincode: pincode || "177001" }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start agent tracking");
      }

      setUrl("");
      onTracked();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to track product";
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="flex flex-col sm:flex-row gap-3 mb-5" onSubmit={handleTrack}>
        <input
          id="track-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste an Amazon, Flipkart, Meesho, or Shopsy product URL"
          className="flex-1 px-4 py-2.5 bg-white dark:bg-ink/40 border border-line dark:border-line/30 rounded-sm font-body text-sm text-ink dark:text-paper placeholder:text-ink-soft/60 dark:placeholder:text-paper/40 focus-visible:outline-ink dark:focus-visible:outline-paper focus-visible:outline-2 focus-visible:outline-offset-0 disabled:opacity-50"
          aria-label="Product URL"
          disabled={loading}
        />
        <button
          id="track-submit-btn"
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-ink dark:bg-paper text-paper dark:text-ink font-body text-sm font-medium rounded-sm hover:bg-ink/90 dark:hover:bg-paper/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-paper/30 dark:border-ink/30 border-t-paper dark:border-t-ink rounded-full animate-spin" />
              <span>Verifying…</span>
            </>
          ) : (
            "Track"
          )}
        </button>
      </form>

      {/* Demo Presets */}
      <div className="mb-8 flex flex-wrap items-center gap-2 text-xs font-mono text-ink-soft dark:text-paper/50">
        <span className="text-ink-soft/70 dark:text-paper/30">Try:</span>
        <button type="button" onClick={() => prefillDemo("https://www.amazon.in/dp/B09V48Z769-sony-wh-1000xm5")}
          className="px-2 py-1 bg-white dark:bg-ink/30 border border-line dark:border-line/30 rounded hover:border-ink dark:hover:border-paper/50 transition-colors cursor-pointer">
          Sony XM5 (Amazon)
        </button>
        <button type="button" onClick={() => prefillDemo("https://www.flipkart.com/sony-wh-1000xm5-headphones")}
          className="px-2 py-1 bg-white dark:bg-ink/30 border border-line dark:border-line/30 rounded hover:border-ink dark:hover:border-paper/50 transition-colors cursor-pointer text-[#2874F0]">
          + Sony XM5 (Flipkart)
        </button>
        <button type="button" onClick={() => prefillDemo("https://www.flipkart.com/apple-iphone-15-pro")}
          className="px-2 py-1 bg-white dark:bg-ink/30 border border-line dark:border-line/30 rounded hover:border-ink dark:hover:border-paper/50 transition-colors cursor-pointer">
          iPhone 15 Pro (Flipkart)
        </button>
        <button type="button" onClick={() => prefillDemo("https://www.meesho.com/oneplus-nord-ce4-lite")}
          className="px-2 py-1 bg-white dark:bg-ink/30 border border-line dark:border-line/30 rounded hover:border-ink dark:hover:border-paper/50 transition-colors cursor-pointer">
          OnePlus Nord (Meesho)
        </button>
        <button type="button" onClick={() => prefillDemo("https://www.shopsy.in/realme-narzo-70x")}
          className="px-2 py-1 bg-white dark:bg-ink/30 border border-line dark:border-line/30 rounded hover:border-ink dark:hover:border-paper/50 transition-colors cursor-pointer">
          Realme Narzo (Shopsy)
        </button>
        <button type="button" onClick={() => prefillDemo("https://www.amazon.in/fake-deal-inflated-mrp-product")}
          className="px-2 py-1 bg-white dark:bg-ink/30 border border-line dark:border-line/30 text-flagged rounded hover:border-flagged transition-colors cursor-pointer">
          ⚠ Inflated MRP Test
        </button>
      </div>
    </div>
  );
}
