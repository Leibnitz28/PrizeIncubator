import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

// GET /api/deals — list verified deals sorted by percentile (lower is better)
router.get('/', (_req, res) => {
  try {
    const products = queryAll('SELECT * FROM products');
    const enriched = products
      .map((p) => {
        const vRow = queryOne(
          `SELECT verdict_json, timestamp FROM verdicts WHERE product_id = ? ORDER BY timestamp DESC LIMIT 1`,
          [p.id as number]
        );
        return {
          ...p,
          verdict: vRow ? JSON.parse(vRow.verdict_json as string) : null,
        };
      })
      .filter((p) => p.verdict && p.verdict.verdict === 'real_deal') // verified deals only
      .sort((a, b) => {
        const pctA = a.verdict?.history?.percentile ?? 100;
        const pctB = b.verdict?.history?.percentile ?? 100;
        return pctA - pctB;
      });

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching deals feed:', err);
    res.status(500).json({ error: 'Failed to fetch deals feed' });
  }
});

export default router;
