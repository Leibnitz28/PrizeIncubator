"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Verdict } from "@/types/verdict";
import { NavRail, MobileNav, type TabId } from "./components/NavRail";
import { TrackForm } from "./components/TrackForm";
import { ReceiptStrip, type TrackedProduct } from "./components/ReceiptStrip";
import { ThemeToggle } from "./components/ThemeToggle";
import { AgentTimeline } from "./components/AgentTimeline";
import { DealsFeed } from "./components/DealsFeed";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { CompareCard } from "./components/CompareCard";
import { SettingsPage } from "./components/SettingsPage";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";

interface AgentLogMessage {
  id: string;
  type: string;
  message: string;
  status: "info" | "success" | "warning" | "error";
  timestamp: string;
}

import { API_BASE, getWsUrl } from "./config";

export default function Home() {
  const [pincode, setPincode] = useState("177001");
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("deals");
  const [refreshDealsTrigger, setRefreshDealsTrigger] = useState(0);
  const [logs, setLogs] = useState<AgentLogMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [approvedIds, setApprovedIds] = useState<number[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ── WebSocket connection ──
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      try {
        const wsUrl = getWsUrl();
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "connected") return;

            setLogs((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                type: data.type || "agent_step",
                message: data.message || "",
                status: data.status || "info",
                timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString("en-IN", { hour12: false }),
              },
            ]);
          } catch {
            // ignore malformed messages
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch {
        // connection failed, will retry
      }
    };

    connectWs();
    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // silently fail — servers may not be up yet
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Auto-scroll log ──
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ── Delete product ──
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  // ── Approve product ──
  const handleApprove = (product: TrackedProduct) => {
    setApprovedIds((prev) => [...prev, product.id]);
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "approval",
        message: `✓ Human approved checkout for: ${product.title || product.url}`,
        status: "success",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      },
    ]);
    window.open(product.url, "_blank");
  };

  // ── Filter by tab ──
  const displayedProducts = products.filter((p) => {
    if (activeTab === "approvals") return p.verdict?.verdict === "real_deal";
    return true;
  });

  const approvalCount = products.filter((p) => p.verdict?.verdict === "real_deal").length || undefined;

  return (
    <div className="flex min-h-screen">
      {/* ── Left Rail (NavRail) ── */}
      <NavRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        approvalCount={approvalCount}
        themeToggle={<ThemeToggle />}
      />

      {/* ── Main Column ── */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-20 md:pb-10">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <header className="mb-8">
            <div className="flex items-baseline justify-between">
              <h1 className="font-display text-3xl tracking-tight text-ink dark:text-paper">PrizeIncubator</h1>
              <span className="font-mono text-xs text-ink-soft dark:text-paper/60 bg-white dark:bg-ink/30 px-2 py-0.5 border border-line dark:border-line/20 rounded">
                PIN: {pincode}
              </span>
            </div>
            <p className="mt-2 text-ink-soft dark:text-paper/60 font-body text-sm">
              Honest price intelligence — verified by a browser agent, not scraped from HTML.
            </p>
          </header>

          {/* Track Form (only visible in ledger/deals view) */}
          {(activeTab === "ledger" || activeTab === "deals") && (
            <TrackForm
              pincode={pincode}
              onTracked={() => {
                fetchProducts();
                setRefreshDealsTrigger(prev => prev + 1);
              }}
              onError={setError}
            />
          )}

          {error && (
            <div className="mb-6 p-3 bg-flagged/10 border border-flagged/30 text-flagged rounded text-sm font-body">
              {error}
            </div>
          )}

          {/* Section header */}
          <div className="border-t border-line dark:border-line/20 mb-8 flex items-center justify-between pt-2">
            <span className="font-mono text-xs text-ink-soft dark:text-paper/50 uppercase tracking-wider">
              {activeTab === "deals" && `Top Deals Feed`}
              {activeTab === "ledger" && `Ledger Entries (${displayedProducts.length})`}
              {activeTab === "compare" && `Cross-Platform Intelligence`}
              {activeTab === "history" && "Price History Records"}
              {activeTab === "approvals" && `Ready for Approval (${displayedProducts.length})`}
              {activeTab === "settings" && "Configuration & Tracked Products"}
            </span>
            {products.length > 0 && (activeTab === "ledger" || activeTab === "history") && (
              <button onClick={fetchProducts} className="font-mono text-xs text-ink dark:text-paper hover:underline cursor-pointer">
                Refresh
              </button>
            )}
          </div>

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <SettingsPage
              pincode={pincode}
              onPincodeChange={setPincode}
              products={products}
              onRefreshProducts={fetchProducts}
              onDeleteProduct={handleDelete}
            />
          )}

          {/* Compare Tab */}
          {activeTab === "compare" && (
            <CompareCard onApprove={handleApprove} />
          )}

          {/* Deals Feed */}
          {activeTab === "deals" && (
            <DealsFeed
              approvedIds={approvedIds}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onRefreshTrigger={refreshDealsTrigger}
            />
          )}

          {/* Approvals Queue */}
          {activeTab === "approvals" && (
            <ApprovalQueue onRefreshTrigger={refreshDealsTrigger} />
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {products.length === 0 ? (
                <EmptyState type="history" />
              ) : (
                <div className="space-y-6">
                  {products.map((p) => {
                    const v = p.verdict;
                    return (
                      <div key={p.id} className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-5 font-mono text-xs">
                        <div className="flex items-start justify-between gap-4 pb-3 border-b border-line/40 dark:border-line/10">
                          <div>
                            <span className="uppercase text-[10px] font-bold text-ink-soft dark:text-paper/50">{p.platform}</span>
                            <h3 className="font-display text-base text-ink dark:text-paper mt-0.5">{p.title || p.url}</h3>
                          </div>
                          <span className="text-base font-bold text-ink dark:text-paper">
                            ₹{v ? v.true_final_price.toLocaleString("en-IN") : "—"}
                          </span>
                        </div>
                        {v && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-1 text-[11px] text-ink-soft dark:text-paper/60">
                            <div>MRP: <span className="font-semibold text-ink dark:text-paper">₹{v.mrp.toLocaleString("en-IN")}</span></div>
                            <div>90-Day Low: <span className="font-semibold text-verified dark:text-[#3CD070]">₹{v.history["90_day_low"].toLocaleString("en-IN")}</span></div>
                            <div>90-Day High: <span className="font-semibold text-ink dark:text-paper">₹{v.history["90_day_high"].toLocaleString("en-IN")}</span></div>
                            <div>Percentile: <span className="font-semibold text-ink dark:text-paper">{v.history.percentile}th</span></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Ledger list */}
          {activeTab === "ledger" && (
            <div className="space-y-8">
              {initialLoading ? (
                /* Loading skeleton */
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-[#1C1F2E] border border-line dark:border-line/20 rounded-sm p-6 animate-pulse">
                      <div className="h-5 bg-line/60 dark:bg-line/20 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-line/40 dark:bg-line/10 rounded w-1/2 mb-6" />
                      <div className="space-y-2">
                        <div className="h-3 bg-line/40 dark:bg-line/10 rounded w-full" />
                        <div className="h-3 bg-line/40 dark:bg-line/10 rounded w-full" />
                        <div className="h-4 bg-line/60 dark:bg-line/20 rounded w-2/3 mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedProducts.length === 0 ? (
                <EmptyState type="ledger" />
              ) : (
                displayedProducts.map((product) => (
                  <ReceiptStrip
                    key={product.id}
                    product={product}
                    isApproved={approvedIds.includes(product.id)}
                    onApprove={() => handleApprove(product)}
                    onDelete={() => handleDelete(product.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Right Rail — Agent Run Log (Timeline) ── */}
      <AgentTimeline
        logs={logs}
        wsConnected={wsConnected}
        onClear={() => setLogs([])}
      />

      {/* ── Mobile Bottom Bar (MobileNav) ── */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
