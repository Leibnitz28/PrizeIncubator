import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';
import type { Verdict } from '../schema/verdict.js';

const router = Router();

export interface CompareProductItem {
  id: number;
  url: string;
  platform: 'amazon' | 'flipkart' | 'meesho' | 'shopsy';
  title: string;
  pincode: string;
  product_group_id: string;
  approval_status: string;
  notification_pref: string;
  price_threshold: number | null;
  created_at: string;
  updated_at: string;
  verdict: Verdict | null;
  true_final_price: number;
  listed_price: number;
  mrp: number;
  coupon_amount: number;
  bank_amount: number;
  delivery_eta?: string | null;
  serviceable?: boolean;
}

export interface CompareGroup {
  groupId: string;
  groupTitle: string;
  productCount: number;
  platformCount: number;
  platforms: ('amazon' | 'flipkart' | 'meesho' | 'shopsy')[];
  bestPriceProductId: number;
  bestPlatform: 'amazon' | 'flipkart' | 'meesho' | 'shopsy';
  bestTruePrice: number;
  highestTruePrice: number;
  potentialSavings: number;
  isMultiPlatform: boolean;
  products: CompareProductItem[];
}

// ──────────────────────────────────────────────────────────────
// GET /api/compare — get all product comparison groups
// ──────────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  try {
    const products = queryAll('SELECT * FROM products ORDER BY updated_at DESC');
    
    // Enrich products with latest verdict
    const enriched: CompareProductItem[] = products.map((p) => {
      const vRow = queryOne(
        `SELECT verdict_json, timestamp FROM verdicts WHERE product_id = ? ORDER BY timestamp DESC LIMIT 1`,
        [p.id as number]
      );
      const verdict: Verdict | null = vRow ? JSON.parse(vRow.verdict_json as string) : null;
      return {
        id: p.id as number,
        url: p.url as string,
        platform: p.platform as 'amazon' | 'flipkart' | 'meesho' | 'shopsy',
        title: (p.title as string) || (verdict?.product ?? 'E-Commerce Product'),
        pincode: (p.pincode as string) || '177001',
        product_group_id: (p.product_group_id as string) || `group-${p.id}`,
        approval_status: (p.approval_status as string) || 'pending',
        notification_pref: (p.notification_pref as string) || 'instant',
        price_threshold: p.price_threshold ? Number(p.price_threshold) : null,
        created_at: p.created_at as string,
        updated_at: p.updated_at as string,
        verdict,
        true_final_price: verdict?.true_final_price ?? 0,
        listed_price: verdict?.listed_price ?? 0,
        mrp: verdict?.mrp ?? 0,
        coupon_amount: verdict?.coupon_amount ?? 0,
        bank_amount: verdict?.bank_amount ?? 0,
        delivery_eta: verdict?.delivery?.eta,
        serviceable: verdict?.delivery?.serviceable ?? true,
      };
    });

    // Group products by product_group_id
    const groupsMap = new Map<string, CompareProductItem[]>();
    for (const item of enriched) {
      const gId = item.product_group_id || `group-${item.id}`;
      if (!groupsMap.has(gId)) {
        groupsMap.set(gId, []);
      }
      groupsMap.get(gId)!.push(item);
    }

    const groups: CompareGroup[] = [];

    for (const [groupId, items] of groupsMap.entries()) {
      if (items.length === 0) continue;

      // Determine best price item (filter items with true_final_price > 0)
      const validItems = items.filter(i => i.true_final_price > 0);
      const itemsToEvaluate = validItems.length > 0 ? validItems : items;

      const sortedByPrice = [...itemsToEvaluate].sort((a, b) => a.true_final_price - b.true_final_price);
      const best = sortedByPrice[0];
      const highest = sortedByPrice[sortedByPrice.length - 1];

      const platforms = Array.from(new Set(items.map(i => i.platform)));
      const potentialSavings = highest.true_final_price - best.true_final_price;

      // Group title is the most complete title among items
      const longestTitle = items.reduce((prev, curr) => (curr.title.length > prev.length ? curr.title : prev), items[0].title);

      groups.push({
        groupId,
        groupTitle: longestTitle,
        productCount: items.length,
        platformCount: platforms.length,
        platforms,
        bestPriceProductId: best.id,
        bestPlatform: best.platform,
        bestTruePrice: best.true_final_price,
        highestTruePrice: highest.true_final_price,
        potentialSavings,
        isMultiPlatform: platforms.length > 1,
        products: items,
      });
    }

    // Sort groups: multi-platform comparisons first, then by potential savings descending
    groups.sort((a, b) => {
      if (a.isMultiPlatform && !b.isMultiPlatform) return -1;
      if (!a.isMultiPlatform && b.isMultiPlatform) return 1;
      return b.potentialSavings - a.potentialSavings;
    });

    res.json(groups);
  } catch (err) {
    console.error('Error fetching comparisons:', err);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/compare/:groupId — get single comparison group
// ──────────────────────────────────────────────────────────────
router.get('/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const products = queryAll('SELECT * FROM products WHERE product_group_id = ?', [groupId]);
    if (products.length === 0) {
      res.status(404).json({ error: 'Comparison group not found' });
      return;
    }

    const enriched: CompareProductItem[] = products.map((p) => {
      const vRow = queryOne(
        `SELECT verdict_json, timestamp FROM verdicts WHERE product_id = ? ORDER BY timestamp DESC LIMIT 1`,
        [p.id as number]
      );
      const verdict: Verdict | null = vRow ? JSON.parse(vRow.verdict_json as string) : null;
      return {
        id: p.id as number,
        url: p.url as string,
        platform: p.platform as 'amazon' | 'flipkart' | 'meesho' | 'shopsy',
        title: (p.title as string) || (verdict?.product ?? 'E-Commerce Product'),
        pincode: (p.pincode as string) || '177001',
        product_group_id: (p.product_group_id as string) || groupId,
        approval_status: (p.approval_status as string) || 'pending',
        notification_pref: (p.notification_pref as string) || 'instant',
        price_threshold: p.price_threshold ? Number(p.price_threshold) : null,
        created_at: p.created_at as string,
        updated_at: p.updated_at as string,
        verdict,
        true_final_price: verdict?.true_final_price ?? 0,
        listed_price: verdict?.listed_price ?? 0,
        mrp: verdict?.mrp ?? 0,
        coupon_amount: verdict?.coupon_amount ?? 0,
        bank_amount: verdict?.bank_amount ?? 0,
        delivery_eta: verdict?.delivery?.eta,
        serviceable: verdict?.delivery?.serviceable ?? true,
      };
    });

    const sortedByPrice = [...enriched].sort((a, b) => a.true_final_price - b.true_final_price);
    const best = sortedByPrice[0];
    const highest = sortedByPrice[sortedByPrice.length - 1];
    const platforms = Array.from(new Set(enriched.map(i => i.platform)));

    const group: CompareGroup = {
      groupId,
      groupTitle: enriched.reduce((prev, curr) => (curr.title.length > prev.length ? curr.title : prev), enriched[0].title),
      productCount: enriched.length,
      platformCount: platforms.length,
      platforms,
      bestPriceProductId: best.id,
      bestPlatform: best.platform,
      bestTruePrice: best.true_final_price,
      highestTruePrice: highest.true_final_price,
      potentialSavings: highest.true_final_price - best.true_final_price,
      isMultiPlatform: platforms.length > 1,
      products: enriched,
    };

    res.json(group);
  } catch (err) {
    console.error('Error fetching comparison group:', err);
    res.status(500).json({ error: 'Failed to fetch comparison group' });
  }
});

export default router;
