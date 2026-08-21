"use client";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* ── Left Rail — icon-only nav, ink background ── */}
      <nav
        className="hidden md:flex flex-col items-center w-[72px] min-h-screen bg-ink py-6 gap-6"
        aria-label="Main navigation"
      >
        {/* Ledger (home) — active */}
        <a
          href="/"
          className="group flex items-center justify-center w-10 h-10 rounded-sm text-paper hover:bg-paper/10 transition-colors"
          aria-label="Ledger"
          aria-current="page"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-paper"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
        </a>

        {/* History */}
        <a
          href="#history"
          className="group flex items-center justify-center w-10 h-10 rounded-sm text-ink-soft hover:bg-paper/10 hover:text-paper transition-colors"
          aria-label="History"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v5h5" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <path d="M12 7v5l4 2" />
          </svg>
        </a>

        {/* Approvals */}
        <a
          href="#approvals"
          className="group flex items-center justify-center w-10 h-10 rounded-sm text-ink-soft hover:bg-paper/10 hover:text-paper transition-colors"
          aria-label="Approvals"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </a>

        {/* Settings — pushed to bottom */}
        <div className="mt-auto">
          <a
            href="#settings"
            className="group flex items-center justify-center w-10 h-10 rounded-sm text-ink-soft hover:bg-paper/10 hover:text-paper transition-colors"
            aria-label="Settings"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ── Main Column — stacked ledger, single scrollable column ── */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Header */}
          <header className="mb-10">
            <h1 className="font-display text-3xl tracking-tight text-ink">
              PrizeIncubator
            </h1>
            <p className="mt-2 text-ink-soft font-body text-sm">
              Honest price intelligence — verified by a browser agent, not scraped from HTML.
            </p>
          </header>

          {/* Track Form — single field, single button, no card chrome */}
          <form
            className="flex gap-3 mb-10"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              id="track-url-input"
              type="url"
              placeholder="Paste an Amazon or Flipkart product URL"
              className="flex-1 px-4 py-2.5 bg-white border border-line rounded-sm font-body text-sm text-ink placeholder:text-ink-soft/60 focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-0"
              aria-label="Product URL"
            />
            <button
              id="track-submit-btn"
              type="submit"
              className="px-5 py-2.5 bg-ink text-paper font-body text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors"
            >
              Track
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-line mb-10" />

          {/* Empty state — exact copy from spec §3 */}
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 mb-6 flex items-center justify-center border-2 border-dashed border-line rounded-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ink-soft/50"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <p className="text-ink-soft font-body text-sm leading-relaxed max-w-xs">
              Nothing on the ledger yet. Paste a product URL to start tracking.
            </p>
          </div>
        </div>
      </main>

      {/* ── Right Rail — AgentRunLog, desktop only ── */}
      <aside
        className="hidden lg:flex flex-col w-80 min-h-screen bg-ink border-l border-ink-soft/20"
        aria-label="Agent run log"
      >
        <div className="px-4 py-4 border-b border-ink-soft/20">
          <h2 className="font-mono text-xs font-medium text-paper/70 uppercase tracking-wider">
            Agent Run Log
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Empty log state */}
          <div className="flex items-center gap-2 text-ink-soft/50">
            <div className="w-1.5 h-1.5 rounded-full bg-ink-soft/30" />
            <span className="font-mono text-xs">
              Waiting for agent activity…
            </span>
          </div>
        </div>

        {/* Connection status bar */}
        <div className="px-4 py-3 border-t border-ink-soft/20 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-ink-soft/40" />
          <span className="font-mono text-[10px] text-ink-soft/40 uppercase tracking-wider">
            Disconnected
          </span>
        </div>
      </aside>

      {/* ── Mobile Bottom Bar — replaces left rail on small screens ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden bg-ink flex justify-around items-center h-14 z-50"
        aria-label="Mobile navigation"
      >
        <a
          href="/"
          className="flex items-center justify-center w-12 h-12 text-paper"
          aria-label="Ledger"
          aria-current="page"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" /><path d="M8 11h8" />
          </svg>
        </a>
        <a href="#history" className="flex items-center justify-center w-12 h-12 text-ink-soft" aria-label="History">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" />
          </svg>
        </a>
        <a href="#approvals" className="flex items-center justify-center w-12 h-12 text-ink-soft" aria-label="Approvals">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </a>
        <a href="#settings" className="flex items-center justify-center w-12 h-12 text-ink-soft" aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </a>
      </nav>
    </div>
  );
}
