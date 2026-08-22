import { Router } from 'express';
import { queryAll, queryOne, runStmt } from '../db.js';

const router = Router();

// In-memory / persistent config defaults
let globalSettings = {
  pincode: '177001',
  auto_track_interval_hours: 6,
  min_discount_threshold_percent: 15,
  max_price_budget: 150000,
  browser_agent_mode: 'stealth_headless',
  hard_blocked_payment: true,
};

// ──────────────────────────────────────────────────────────────
// GET /api/settings — get current system settings & statistics
// ──────────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  try {
    const products = queryAll('SELECT id, platform, approval_status, notification_pref FROM products');
    const verdicts = queryAll('SELECT verdict_json FROM verdicts');
    
    let realDealsCount = 0;
    let inflatedCount = 0;
    let unchangedCount = 0;

    for (const v of verdicts) {
      try {
        const parsed = JSON.parse(v.verdict_json as string);
        if (parsed.verdict === 'real_deal') realDealsCount++;
        else if (parsed.verdict === 'mrp_inflated') inflatedCount++;
        else if (parsed.verdict === 'price_unchanged') unchangedCount++;
      } catch {}
    }

    const platformDistribution: Record<string, number> = {
      amazon: 0,
      flipkart: 0,
      meesho: 0,
      shopsy: 0,
    };

    for (const p of products) {
      const plat = p.platform as string;
      if (plat in platformDistribution) {
        platformDistribution[plat]++;
      }
    }

    res.json({
      settings: globalSettings,
      stats: {
        total_tracked: products.length,
        real_deals: realDealsCount,
        mrp_inflated_flagged: inflatedCount,
        price_unchanged: unchangedCount,
        platform_distribution: platformDistribution,
      },
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ──────────────────────────────────────────────────────────────
// PUT /api/settings — update global settings
// ──────────────────────────────────────────────────────────────
router.put('/', (req, res) => {
  try {
    const {
      pincode,
      auto_track_interval_hours,
      min_discount_threshold_percent,
      max_price_budget,
      browser_agent_mode,
    } = req.body;

    if (pincode && /^\d{6}$/.test(pincode)) {
      globalSettings.pincode = pincode;
      // Update default pincode for all existing products if requested
      runStmt('UPDATE products SET pincode = ?', [pincode]);
    }


    if (auto_track_interval_hours !== undefined) {
      globalSettings.auto_track_interval_hours = Number(auto_track_interval_hours);
    }
    if (min_discount_threshold_percent !== undefined) {
      globalSettings.min_discount_threshold_percent = Number(min_discount_threshold_percent);
    }
    if (max_price_budget !== undefined) {
      globalSettings.max_price_budget = Number(max_price_budget);
    }
    if (browser_agent_mode !== undefined) {
      globalSettings.browser_agent_mode = browser_agent_mode;
    }

    res.json({ success: true, settings: globalSettings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
