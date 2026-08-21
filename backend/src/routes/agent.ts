import { Router } from 'express';
import { queryOne, runStmt } from '../db.js';

const router = Router();

// POST /api/agent/run — trigger an agent run for a product
// Stub for Phase 1; will be wired to webcmd in Phase 2
router.post('/run', (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    res.status(400).json({ error: 'product_id is required' });
    return;
  }

  // Verify product exists
  const product = queryOne('SELECT * FROM products WHERE id = ?', [Number(product_id)]);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  try {
    const { lastId } = runStmt(
      `INSERT INTO agent_runs (product_id, status, started_at, events_json)
       VALUES (?, 'pending', datetime('now'), '[]')`,
      [Number(product_id)]
    );
    const run = queryOne('SELECT * FROM agent_runs WHERE id = ?', [lastId]);
    res.status(201).json({
      message: 'Agent run queued (stub — webcmd integration in Phase 2)',
      run,
    });
  } catch (err) {
    console.error('Error creating agent run:', err);
    res.status(500).json({ error: 'Failed to create agent run' });
  }
});

// GET /api/agent/status/:runId — check run status
router.get('/status/:runId', (req, res) => {
  try {
    const run = queryOne('SELECT * FROM agent_runs WHERE id = ?', [Number(req.params.runId)]);
    if (!run) {
      res.status(404).json({ error: 'Agent run not found' });
      return;
    }
    res.json(run);
  } catch (err) {
    console.error('Error fetching agent run:', err);
    res.status(500).json({ error: 'Failed to fetch agent run' });
  }
});

export default router;
