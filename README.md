# Deal Ledger — Browser Agent for Honest Price Intelligence

Built for **SLAB (Self-Learning Agent Browser) Hackathon** @ NIT Hamirpur, hosted by webcmd.

> An agent that doesn't just track prices — it acts on live e-commerce sites (Amazon/Flipkart) to verify whether a "deal" is real, and only ever checks out with your explicit approval.

---

## 1. The Problem

Price trackers exist. Browser extensions exist. Gemini Deep Research can scrape a price in seconds. None of them **act** on the website the way a human shopper does:

- They don't enter your pincode to check real delivery.
- They don't click "View 12 offers" to see hidden bank/coupon discounts.
- They don't add the item to cart and apply a coupon to get the *actual* final price.
- They don't notice when MRP has been inflated to fake a 50%-off discount.

**Deal Ledger** is a browser agent, built on [webcmd](https://github.com/agentrhq/webcmd), that performs these real, multi-step actions on live websites — explores the workflow once, learns it, and replays it reliably — then reports a verdict you can trust, and pings you on Telegram so you can approve or reject before anything is bought.

---

## 2. What Makes This Different (not "just a scraper")

| Static scraper / Deep Research | Deal Ledger (webcmd agent) |
|---|---|
| Reads the HTML that's already there | Clicks, types, waits, and reads what *appears after interaction* |
| Reports the listed price | Enters pincode → checks real deliverability |
| Reports the listed discount | Expands hidden bank offers, applies coupon codes, computes the *actual* final price |
| Breaks silently when a selector changes | Detects failure live, re-explores the page, recovers or reports gracefully |
| One-shot, stateless | Learns the workflow once (slow, exploratory run), then reuses it as a fast command on future runs |
| No action taken | Adds to cart, applies coupon, navigates to checkout — and **stops** for human approval before payment |

This is the core demo arc: **explore → act → recover from a live failure → human-approved handoff.**

---

## 3. Architecture

```
                     ┌─────────────────────────┐
                     │   Next.js Frontend       │
                     │  (dashboard, history,    │
                     │   approval queue)        │
                     └────────────┬─────────────┘
                                  │ REST / WebSocket
                     ┌────────────▼─────────────┐
                     │     Backend API          │
                     │  (orchestrator, DB,       │
                     │   verdict engine)          │
                     └─────┬──────────────┬──────┘
                           │              │
              ┌────────────▼───┐    ┌─────▼──────────┐
              │  webcmd Agent   │    │  Telegram Bot   │
              │  (browser       │    │  (alerts +      │
              │   actions)      │    │   approval btns)│
              └────────────┬────┘    └─────┬───────────┘
                           │               │
                 ┌─────────▼───────────────▼─────────┐
                 │     Amazon / Flipkart (live)       │
                 └─────────────────────────────────────┘
```

**Flow:**
1. User adds a product URL (via dashboard or `/track` Telegram command).
2. webcmd agent explores the product page: extracts price, applies pincode, expands offers, checks stock/variants.
3. Verdict engine compares against price history and computes: is this a *real* deal (vs inflated-MRP trick), and what's the true final price after coupons/offers.
4. On a qualifying drop, backend fires a structured Telegram alert with inline buttons.
5. Agent re-runs periodically using the **learned webcmd command** (fast path) instead of re-exploring from scratch.
6. On approval tap, agent adds to cart, applies coupon, navigates to checkout, and **stops** — human completes payment manually.

---

## 4. Core Components to Build

### 4.1 webcmd Agent Layer (`/agent`)
- [ ] Product page explorer: extract title, price, MRP, availability, seller
- [ ] Pincode entry + delivery date extraction (real DOM interaction, not URL param)
- [ ] "View offers" expand-and-read (bank offers, coupons)
- [ ] Add-to-cart + apply-coupon flow → true final price
- [ ] Variant/seller comparison (if multiple sellers or sizes/colors exist)
- [ ] Command persistence: save the learned workflow per site so re-runs are fast (webcmd's "explore once, reuse the command")
- [ ] **Failure handling (critical for scoring):**
  - Selector/layout change → re-explore instead of hard-crash
  - Coupon invalid/expired → detect and report, don't silently report old price
  - Out of stock / pincode not serviceable → detect and adjust verdict
  - CAPTCHA/bot-block encountered → pause and report, never attempt to bypass

### 4.2 Verdict Engine (`/backend`)
- [ ] Store price history per product (timestamp, price, MRP, source)
- [ ] Compute: current price vs N-day low/high/percentile
- [ ] Detect fake-discount pattern (MRP inflated relative to historical price trend)
- [ ] Combine listed price + coupon + bank offer → true final price
- [ ] Produce a structured verdict object (see schema below)

### 4.3 Telegram Bot (`/bot`)
- [ ] `/track <url>` — add a product
- [ ] `/list` — show tracked products
- [ ] `/history <product>` — send price-trend chart as an image
- [ ] Structured alert message with inline buttons: `✅ Approve & Open Checkout` / `🔕 Snooze` / `❌ Not Interested`
- [ ] Callback handler that resumes the agent flow on approval

### 4.4 Frontend (`/frontend`)
See [`frontend/README.md`](./frontend/README.md) for the full design spec — separate doc since it covers visual direction in depth. Next.js + Tailwind, dashboard for tracked products, price-history charts, live agent-run log (for demo visibility), and an approval queue mirroring the Telegram flow.

---

## 5. Verdict Schema (structured output)

Every agent run should resolve to a single structured object — this is what feeds Telegram, the dashboard, and the demo narrative:

```json
{
  "product": "Sony WH-1000XM5",
  "url": "https://...",
  "platform": "amazon",
  "timestamp": "2026-08-21T10:00:00Z",
  "listed_price": 24990,
  "mrp": 34990,
  "true_final_price": 22490,
  "applied_coupon": "SAVE10",
  "bank_offer": "₹1000 off on HDFC cards",
  "delivery": {
    "pincode": "177001",
    "serviceable": true,
    "eta": "2026-08-24"
  },
  "history": {
    "90_day_low": 23500,
    "90_day_high": 36990,
    "percentile": 8
  },
  "verdict": "real_deal",
  "reasoning": "True final price is 8th percentile of 90-day range — genuinely near the historical low, not an inflated-MRP trick.",
  "recovery_events": [
    { "issue": "coupon_expired", "action": "re-checked offers panel, found valid alternate coupon" }
  ]
}
```

`recovery_events` matters — it's your live evidence for the technical-depth/recovery score, and it's a great thing to render on the frontend as a timeline during the demo.

---

## 6. Tech Stack

- **Browser automation:** [webcmd](https://github.com/agentrhq/webcmd) for exploration + command reuse; Playwright underneath as needed
- **Agent orchestration:** Claude Code / Codex / whichever LLM harness the team is most fluent in
- **Backend:** Node.js or Python (FastAPI) — pick based on team comfort; expose REST endpoints for the frontend and a webhook/poll loop for Telegram
- **Database:** SQLite for hackathon simplicity (Postgres if time allows)
- **Bot:** `python-telegram-bot` or `node-telegram-bot-api`, polling mode (no public webhook needed)
- **Frontend:** Next.js + Tailwind CSS (see `frontend/README.md`)

---

## 7. Hard Rules (from the hackathon brief — non-negotiable)

- Demo must run live, or be a screen recording of a real execution. No mocked/fabricated runs.
- Use your own accounts on Amazon/Flipkart. Respect platform terms.
- **Human approval is mandatory** before any payment, message, submission, or deletion action. The agent may navigate to checkout — it must never submit payment.

---

## 8. Demo Script (target: 3–4 minutes)

1. **Cold start:** Give the agent a product URL it hasn't seen. Show webcmd's exploration phase — pincode entry, offer expansion, add-to-cart, coupon application.
2. **Verdict:** Show the structured "real deal / fake discount" output with true final price.
3. **Break something live:** Trigger a real failure (expired coupon, or switch pincode to a non-serviceable one) and show the agent detect it and adjust its verdict instead of reporting stale data.
4. **Second run:** Re-run the same product — show the learned webcmd command executing fast, no re-exploration.
5. **Telegram:** Alert fires with inline buttons. Tap approve. Agent navigates to checkout and **stops**.

---

## 9. Team Task Split (suggested, adjust to team size)

| Area | Owns |
|---|---|
| webcmd agent + recovery logic | Person A (+ B) |
| Verdict engine + DB | Person B |
| Telegram bot + callback wiring | Person C |
| Frontend dashboard | Person D |

If solo or duo: build the agent + verdict engine + Telegram first (this is what's judged most heavily — 30 + 20 = 50 of 100 points), and treat the frontend as a lighter-weight demo surface.

---

## 10. Setup

```bash
git clone <this-repo>
cd deal-ledger

# agent + backend
cd backend && npm install   # or pip install -r requirements.txt

# webcmd
# follow https://github.com/agentrhq/webcmd?utm_source=luma

# frontend
cd ../frontend && npm install && npm run dev

# telegram bot
cd ../bot && npm install
# set TELEGRAM_BOT_TOKEN in .env
```

---

## 11. Resources

- webcmd: https://github.com/agentrhq/webcmd
- SLAB hackathon community: WhatsApp group (see event page)
