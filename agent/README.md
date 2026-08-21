# Agent Layer — webcmd Browser Agent

This directory contains the webcmd-based browser agent that performs real interactions on e-commerce sites (Amazon India, Flipkart).

**Built in Phase 2.**

## Responsibilities

- Product page exploration: extract title, price, MRP, availability, seller
- Pincode entry + delivery date extraction (real DOM interaction)
- "View offers" expand-and-read (bank offers, coupons)
- Add-to-cart + apply-coupon flow → true final price
- Command persistence: save learned workflows per site for fast re-runs
- Failure detection and recovery (selector changes, expired coupons, CAPTCHA blocks)

## Key constraint

The agent may navigate to checkout — it must **never** submit payment. Human approval is mandatory.
