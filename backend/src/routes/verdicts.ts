import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

// GET /api/verdicts/:productId — latest verdict for a product
router.get('/:productId', (req, res) => {
  try {
    const row = queryOne(
      `SELECT * FROM verdicts WHERE product_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [Number(req.params.productId)]
    );

    if (!row) {
      res.status(404).json({ error: 'No verdict found for this product' });
      return;
    }

    res.json(JSON.parse(row.verdict_json as string));
  } catch (err) {
    console.error('Error fetching verdict:', err);
    res.status(500).json({ error: 'Failed to fetch verdict' });
  }
});

// GET /api/verdicts/:productId/history — price history for chart
router.get('/:productId/history', (req, res) => {
  try {
    const rows = queryAll(
      `SELECT price, mrp, true_final_price, applied_coupon, bank_offer, timestamp
       FROM price_history
       WHERE product_id = ?
       ORDER BY timestamp ASC`,
      [Number(req.params.productId)]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching price history:', err);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

export default router;
