# Bot Layer — Telegram Bot

This directory contains the Telegram bot for PrizeIncubator — alerts, approval buttons, and product tracking commands.

**Built in Phase 4.**

## Commands

- `/track <url>` — add a product to track
- `/list` — show tracked products
- `/history <product>` — send price-trend chart as an image

## Alert flow

On a qualifying price drop, the bot sends a structured message with inline keyboard buttons:
- ✅ Approve & Open Checkout
- 🔕 Snooze
- ❌ Not Interested

Tapping "Approve" resumes the agent to navigate to checkout and **stop** — human completes payment manually.
