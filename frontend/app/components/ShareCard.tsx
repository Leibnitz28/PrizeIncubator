"use client";

import React, { useRef, useEffect, useState } from "react";
import type { TrackedProduct } from "./ReceiptStrip";

interface ShareCardModalProps {
  product: TrackedProduct;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareCardModal({ product, isOpen, onClose }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const verdict = product.verdict;
  const isInflated = verdict?.verdict === "mrp_inflated";
  const finalPrice = verdict ? verdict.true_final_price : 0;
  const mrp = verdict ? verdict.mrp : 0;
  const discountPercent = mrp > 0 ? Math.round((1 - finalPrice / mrp) * 100) : 0;
  const title = product.title || verdict?.product || "E-Commerce Product";
  const platform = (product.platform || "amazon").toUpperCase();

  // Draw card on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set 2x resolution for crisp text (600x380)
    const scale = 2;
    canvas.width = 600 * scale;
    canvas.height = 380 * scale;
    ctx.scale(scale, scale);

    // Background - modern deep charcoal paper aesthetic
    const bgGradient = ctx.createLinearGradient(0, 0, 600, 380);
    bgGradient.addColorStop(0, "#161922");
    bgGradient.addColorStop(1, "#0F1118");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 380);

    // Border
    ctx.strokeStyle = isInflated ? "#B23A2E" : "#2EBF6E";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 576, 356);

    // Top Header Banner
    ctx.fillStyle = "#222736";
    ctx.fillRect(14, 14, 572, 42);

    ctx.fillStyle = "#E8E6DF";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText("PRIZEINCUBATOR // AGENT VERIFIED DEAL", 28, 40);

    ctx.fillStyle = "#8A8F9E";
    ctx.font = "11px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(platform + " • PIN " + (product.pincode || "177001"), 565, 40);
    ctx.textAlign = "left";

    // Product Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const displayTitle = title.length > 55 ? title.substring(0, 52) + "…" : title;
    ctx.fillText(displayTitle, 30, 92);

    // True Final Price Section
    ctx.fillStyle = "#8A8F9E";
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillText("TRUE FINAL CHECKOUT PRICE", 30, 130);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.fillText(`₹${finalPrice.toLocaleString("en-IN")}`, 30, 175);

    // MRP & True Discount
    ctx.fillStyle = "#8A8F9E";
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillText(`MRP: ₹${mrp.toLocaleString("en-IN")}`, 250, 155);

    ctx.fillStyle = isInflated ? "#E05A4E" : "#2EBF6E";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(
      isInflated
        ? `[ FAKE DISCOUNT: MRP INFLATED ]`
        : `[ SAVE ${discountPercent}% OFF MRP ]`,
      250,
      175
    );

    // Divider
    ctx.strokeStyle = "#2A2E3A";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 200);
    ctx.lineTo(570, 200);
    ctx.stroke();

    // Applied Offers breakdown
    ctx.fillStyle = "#8A8F9E";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("APPLIED AT CHECKOUT:", 30, 226);

    ctx.fillStyle = "#E8E6DF";
    ctx.font = "12px 'Courier New', monospace";
    if (verdict?.applied_coupon && verdict.coupon_amount > 0) {
      ctx.fillText(`🎟️ Coupon: ${verdict.applied_coupon} (-₹${verdict.coupon_amount.toLocaleString("en-IN")})`, 30, 248);
    } else {
      ctx.fillText("🎟️ Coupon: No stackable coupon code", 30, 248);
    }

    if (verdict?.bank_offer && verdict.bank_amount > 0) {
      ctx.fillText(`🏦 Bank Offer: ${verdict.bank_offer.substring(0, 38)} (-₹${verdict.bank_amount.toLocaleString("en-IN")})`, 30, 270);
    } else {
      ctx.fillText("🏦 Bank Offer: None verified", 30, 270);
    }

    if (verdict?.delivery?.eta) {
      ctx.fillText(`🚚 Delivery: ${verdict.delivery.eta} to ${product.pincode || "177001"}`, 30, 292);
    }

    // Verdict Stamp (Bottom Right Box)
    const stampX = 370;
    const stampY = 220;
    const stampW = 195;
    const stampH = 75;

    ctx.strokeStyle = isInflated ? "#E05A4E" : "#2EBF6E";
    ctx.lineWidth = 2;
    ctx.strokeRect(stampX, stampY, stampW, stampH);

    ctx.fillStyle = isInflated ? "#E05A4E" : "#2EBF6E";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(isInflated ? "⚠ MRP INFLATED" : "✓ VERIFIED DEAL", stampX + stampW / 2, stampY + 32);

    ctx.fillStyle = "#8A8F9E";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText(
      isInflated ? "Artificially marked up" : "Cart & coupon confirmed",
      stampX + stampW / 2,
      stampY + 54
    );
    ctx.textAlign = "left";

    // Footer
    ctx.fillStyle = "#4A4F5E";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText("Autonomous Browser Agent Verification • Human Approval Gate Intact", 30, 345);

  }, [isOpen, product, isInflated, finalPrice, mrp, discountPercent, title, platform, verdict]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `PrizeIncubator-Deal-${platform}-${product.id}.png`;
    link.href = image;
    link.click();
    setDownloading(false);
  };

  const handleCopySummary = () => {
    const summary = `🏷️ ${title}\n🛒 Store: ${platform}\n💰 True Final Price: ₹${finalPrice.toLocaleString("en-IN")} (MRP: ₹${mrp.toLocaleString("en-IN")})\n${
      verdict?.applied_coupon ? `🎟️ Coupon: ${verdict.applied_coupon} (-₹${verdict.coupon_amount})\n` : ""
    }${verdict?.bank_offer ? `🏦 Bank: -₹${verdict.bank_amount}\n` : ""}✅ Verdict: ${
      isInflated ? "MRP INFLATED (Fake discount)" : "VERIFIED REAL DEAL"
    }\n🔗 Check: ${product.url}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141720] border border-line/30 rounded-sm max-w-2xl w-full p-6 text-paper shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-line/20 mb-4">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="w-2 h-2 rounded-full bg-verified animate-ping" />
            <span className="font-bold">Shareable Deal Card</span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-paper text-lg font-mono px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Canvas Display */}
        <div className="overflow-hidden rounded border border-line/30 bg-black/40 flex justify-center mb-5">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[600px] h-auto object-contain"
            style={{ aspectRatio: "600/380" }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-paper font-mono text-xs rounded transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "Copied Summary!" : "Copy Text Summary"}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs text-ink-soft hover:text-paper cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-5 py-2 bg-verified hover:bg-verified/90 text-paper font-mono text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PNG Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
