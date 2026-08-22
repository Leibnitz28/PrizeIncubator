"use client";

import React from "react";

export function NavButton({ active, onClick, label, title, badge, children }: {
  active: boolean; onClick: () => void; label: string; title: string; badge?: number; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} aria-label={label} title={title}
      className={`group flex items-center justify-center w-10 h-10 rounded-sm relative transition-colors cursor-pointer ${
        active ? "bg-paper/20 text-paper" : "text-ink-soft hover:bg-paper/10 hover:text-paper"
      }`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-verified text-[9px] font-mono text-paper flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}

export type TabId = "deals" | "ledger" | "compare" | "history" | "approvals" | "settings";

interface NavRailProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  approvalCount?: number;
  dealsCount?: number;
  themeToggle?: React.ReactNode;
}

export function NavRail({ activeTab, setActiveTab, approvalCount, dealsCount, themeToggle }: NavRailProps) {
  return (
    <nav className="hidden md:flex flex-col items-center w-[72px] min-h-screen bg-ink dark:bg-[#0C0E14] py-6 gap-6 shrink-0" aria-label="Main navigation">
      <NavButton active={activeTab === "deals"} onClick={() => setActiveTab("deals")} label="Deals" title="Deals Feed"
        badge={dealsCount}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </NavButton>

      <NavButton active={activeTab === "ledger"} onClick={() => setActiveTab("ledger")} label="Ledger" title="Ledger">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M8 7h6" /><path d="M8 11h8" />
      </NavButton>

      <NavButton active={activeTab === "compare"} onClick={() => setActiveTab("compare")} label="Compare" title="Cross-Platform Compare">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M7 8h2" />
        <path d="M15 16h2" />
      </NavButton>

      <NavButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="History" title="Price History">
        <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" />
      </NavButton>

      <NavButton active={activeTab === "approvals"} onClick={() => setActiveTab("approvals")} label="Approvals" title="Approval Queue"
        badge={approvalCount}>
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </NavButton>

      <div className="mt-auto flex flex-col items-center gap-4">
        {themeToggle}
        <NavButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} label="Settings" title="Settings & Pincode">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </NavButton>
      </div>
    </nav>
  );
}

export function MobileNav({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (tab: TabId) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-ink dark:bg-[#0C0E14] flex justify-around items-center h-14 z-50 border-t border-ink-soft/20" aria-label="Mobile navigation">
      {(["deals", "ledger", "compare", "approvals", "settings"] as const).map((tab) => (
        <button key={tab} onClick={() => setActiveTab(tab)}
          className={`flex items-center justify-center w-12 h-12 cursor-pointer ${activeTab === tab ? "text-paper" : "text-ink-soft"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {tab === "deals" && <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />}
            {tab === "ledger" && <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><path d="M8 7h6" /><path d="M8 11h8" /></>}
            {tab === "compare" && <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /></>}
            {tab === "approvals" && <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>}
            {tab === "settings" && <circle cx="12" cy="12" r="3" />}
          </svg>
        </button>
      ))}
    </nav>
  );
}
