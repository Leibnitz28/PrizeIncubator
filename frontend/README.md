# Deal Ledger — Frontend

Next.js + Tailwind CSS dashboard for the Deal Ledger browser agent. This doc is the design spec — read it before generating any component. The goal is a frontend that looks like it belongs to a real product with a point of view, not a default AI-generated SaaS template.

---

## 0. Design brief, in one sentence

**This is a ledger, not a dashboard.** The subject matter is price honesty — MRP tricks, real discounts, receipts, verified numbers. Every design decision should come from that world (paper, ink, tabular figures, stamps, receipts) rather than from generic "startup dashboard" defaults (cream background, terracotta accent, big rounded cards, gradient hero).

**Explicitly avoid:**
- Warm cream (`#F4F1EA`)-background + terracotta/clay accent + serif hero — this is the single most common AI-generated look right now and will read as templated.
- Near-black background with one neon-green or vermilion accent.
- Broadsheet newspaper columns with hairline rules and zero border-radius everywhere.
- Generic dashboard clichés: soft rounded stat cards with big numbers and a small gray label, gradient blobs, purple/blue SaaS gradients.

---

## 1. Token System

### Palette — "Ink on paper, one verified-green stamp"

| Name | Hex | Use |
|---|---|---|
| `paper` | `#EFEDE6` | Base background — slightly cooler and greyer than "cream," reads as ledger paper, not bakery branding |
| `ink` | `#1B1F2A` | Primary text, headers, receipt borders — deep blue-black, not pure black |
| `ink-soft` | `#4A4F5E` | Secondary text, captions, metadata |
| `verified` | `#1F7A4D` | The single accent — used *only* for confirmed real deals, approval states, and the signature stamp. Deep forest green, not neon. |
| `flagged` | `#B23A2E` | Muted brick red — used *only* for fake-discount warnings and price-hike alerts. Never decorative. |
| `line` | `#D4D0C4` | Hairline dividers, receipt perforation, table rules |

Rule: `verified` and `flagged` are earned colors. They only appear attached to an actual verdict. If a component wants a color and isn't showing a verdict, it stays in the ink/paper range. This restraint is what keeps the green from feeling like a generic "success" toast.

### Typography — three roles, no default pairing

| Role | Face | Why |
|---|---|---|
| Display (headlines, product names) | **Fraunces** (variable, high optical size) | A serif with real personality and ink-trap detailing — set large and slightly tight, it reads as printed, not corporate |
| Body (UI copy, descriptions) | **Inter** | Neutral, legible workhorse — kept deliberately quiet so it doesn't compete with Fraunces or the mono figures |
| Data / figures (all prices, dates, percentages) | **IBM Plex Mono** with tabular numerals | Every number in this product — price, MRP, percentile, ETA — sits in mono with tabular-nums. This is non-negotiable and is the single biggest thing that makes it feel like a ledger instead of a dashboard. Numbers must align vertically in columns. |

Load via `next/font`:
```ts
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google'
```

### Layout concept: the Receipt Strip

The signature element (per the "one memorable thing" rule) is a **literal receipt** rendering of each product's verdict: a vertical strip with a perforated top edge (CSS `mask` or repeating radial-gradient notch), monospace right-aligned figures, and a hand-stamp-style badge ("VERIFIED DEAL" / "MRP INFLATED") rotated ~-4° in the `verified`/`flagged` color, rendered with a subtle roughened edge (SVG filter or a torn-paper mask), like a rubber stamp on a real receipt.

```
┌─ · · · · · · · · · · · · · · · · ┐   ← perforated edge (dashed/notched)
│  SONY WH-1000XM5                 │   Fraunces, 20px
│  amazon.in · 21 AUG 2026         │   Inter, small, ink-soft
│  ─────────────────────────────   │
│  MRP                    34,990   │   IBM Plex Mono, tabular, right-aligned
│  Listed price            24,990  │
│  Coupon (SAVE10)          -500   │
│  Bank offer (HDFC)      -2,000   │
│  ─────────────────────────────   │
│  TRUE FINAL PRICE       22,490   │   larger weight, ink
│                                   │
│  90-day low: 23,500 (you're      │   ink-soft, small
│  below it — 8th percentile)      │
│                                   │
│         ╱  VERIFIED  ╱          │   rotated stamp, verified green
└─ · · · · · · · · · · · · · · · · ┘
```

This single component should appear everywhere a product's verdict is shown — the dashboard list, the approval queue, and the Telegram-mirrored detail view. Reusing it consistently is what makes the product feel designed rather than assembled from generic cards.

### Layout — page structure

Three-pane structure, no sidebar-nav-plus-topbar SaaS default:

- **Left rail (narrow, ~72px, collapses on mobile to bottom bar):** icon-only navigation — Ledger (home), History, Approvals, Settings. Ink background, paper icons.
- **Main column:** the receipt strips, stacked, in a single scrollable column — like a literal ledger book, not a card grid. Grid layouts imply "browse many equal things"; a stacked ledger implies "a record, in order."
- **Right rail (appears on desktop ≥1024px, hidden on mobile):** the live agent-run log — a terminal-style feed of what the webcmd agent is doing right now (`Entering pincode 177001…`, `Coupon SAVE10 applied`, `⚠ Coupon expired — re-checking offers panel`). This is your demo's secret weapon: judges watching the agent act live, in plain readable steps, right next to the receipt it produces. Use IBM Plex Mono here too, small, ink-soft with `verified`/`flagged` for outcome lines.

### Motion — one orchestrated moment, nothing ambient

- When a new receipt strip resolves (agent finishes a run), it should **print in**: a short (400–500ms) reveal from the top down, like paper feeding out of a receipt printer, using `clip-path` inset animation rather than opacity fade. This is the one deliberate animation moment — don't add hover-glow, floating blobs, or parallax anywhere else.
- The rotated stamp badge should animate in with a quick stamp-down motion (scale 1.15 → 1, ~150ms, slight overshoot) once the receipt has finished printing in — reads as literally "stamping" the verdict.
- Respect `prefers-reduced-motion`: fall back to instant appearance, no exceptions.

---

## 2. Component Inventory

| Component | Notes |
|---|---|
| `ReceiptStrip` | The signature component described above. Props: product, price breakdown, verdict, history stats, recovery events (optional, rendered as small footnote if present) |
| `AgentRunLog` | Right-rail live feed, mono, timestamped lines, color-coded by outcome |
| `ApprovalBar` | Mirrors the Telegram inline buttons — Approve & Open Checkout / Snooze / Not Interested — same copy as the bot for consistency across surfaces |
| `HistoryChart` | Price-over-time line chart. Keep axis labels in IBM Plex Mono. Plot line in `ink`, historical-low marker in `verified`. No gridlines-everywhere default — use sparse horizontal guides only at the low/high markers. |
| `TrackForm` | Add-product-by-URL input. Single field, single button, no unnecessary card chrome around it. |
| `Stamp` | Standalone rotated badge component reused inside `ReceiptStrip` and anywhere else a verdict needs to be shown compactly |

---

## 3. Copy voice

Per the product's whole premise — honesty about deals — the UI copy should be plain and specific, never salesy:

- ✅ "True final price after coupon and bank offer" — not "🔥 Amazing deal!"
- ✅ "Coupon expired — re-checked offers panel, found SAVE5 instead" — not "Something went wrong"
- ✅ Verdict labels are literal: `VERIFIED DEAL`, `MRP INFLATED`, `PRICE UNCHANGED` — not marketing language
- Empty state (no tracked products yet): "Nothing on the ledger yet. Paste a product URL to start tracking." — direct, tells the user what to do next.

---

## 4. Tech setup

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install recharts   # for HistoryChart
```

### `tailwind.config.ts` — extend, don't override defaults wholesale

```ts
theme: {
  extend: {
    colors: {
      paper: '#EFEDE6',
      ink: '#1B1F2A',
      'ink-soft': '#4A4F5E',
      verified: '#1F7A4D',
      flagged: '#B23A2E',
      line: '#D4D0C4',
    },
    fontFamily: {
      display: ['var(--font-fraunces)'],
      body: ['var(--font-inter)'],
      mono: ['var(--font-plex-mono)'],
    },
  },
}
```

### Accessibility floor (non-negotiable, per design skill guidance)

- Visible keyboard focus rings on every interactive element (use `ink` outline, not the Tailwind default blue)
- Responsive down to a single-column mobile layout — right rail (`AgentRunLog`) collapses into a collapsible drawer on mobile, not hidden entirely, since it matters for the demo on a phone screen
- Color is never the only signal — `VERIFIED`/`INFLATED` labels always ship as text, not just color
- `prefers-reduced-motion` respected everywhere motion is used

---

## 5. What "classy" means here, concretely

If a component update makes you reach for: a gradient background, a soft drop-shadow card with rounded-2xl corners and no border, a hero with a big centered headline and two CTA buttons side by side, or emoji-as-icons — stop and check it against the ledger concept first. Every visual choice should trace back to "this is a paper record of a verified fact," not "this is a SaaS product landing page."
