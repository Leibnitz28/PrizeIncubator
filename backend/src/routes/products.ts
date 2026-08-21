import { Router } from 'express';
import { queryAll, queryOne, runStmt } from '../db.js';

const router = Router();

// POST /api/products — add a product URL to track
router.post('/', (req, res) => {
  const { url, pincode } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Product URL is required' });
    return;
  }

  // Detect platform from URL
  let platform: 'amazon' | 'flipkart';
  if (url.includes('amazon.in') || url.includes('amazon.com')) {
    platform = 'amazon';
  } else if (url.includes('flipkart.com')) {
    platform = 'flipkart';
  } else {
    res.status(400).json({ error: 'Only Amazon India and Flipkart URLs are supported' });
    return;
  }

  try {
    // Check if product already exists
    const existing = queryOne('SELECT * FROM products WHERE url = ?', [url]);
    if (existing) {
      // Update pincode and updated_at
      runStmt(
        `UPDATE products SET pincode = ?, updated_at = datetime('now') WHERE url = ?`,
        [pincode || '177001', url]
      );
      const updated = queryOne('SELECT * FROM products WHERE url = ?', [url]);
      res.status(200).json(updated);
    } else {
      const { lastId } = runStmt(
        `INSERT INTO products (url, platform, pincode) VALUES (?, ?, ?)`,
        [url, platform, pincode || '177001']
      );
      const product = queryOne('SELECT * FROM products WHERE id = ?', [lastId]);
      res.status(201).json(product);
    }
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// GET /api/products — list all tracked products
router.get('/', (_req, res) => {
  try {
    const products = queryAll('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products);
  } catch (err) {
    console.error('Error listing products:', err);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

// GET /api/products/:id — single product detail
router.get('/:id', (req, res) => {
  try {
    const product = queryOne('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
