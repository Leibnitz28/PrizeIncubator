// PrizeIncubator — Verdict Schema
// Matches README.md §5 exactly. Duplicated in frontend/types/verdict.ts.

export interface DeliveryInfo {
  pincode: string;
  serviceable: boolean;
  eta: string | null;
}

export interface PriceHistory {
  '90_day_low': number;
  '90_day_high': number;
  percentile: number;
}

export interface RecoveryEvent {
  issue: string;
  action: string;
}

export type VerdictLabel = 'real_deal' | 'mrp_inflated' | 'price_unchanged';

export interface Verdict {
  product: string;
  url: string;
  platform: 'amazon' | 'flipkart';
  timestamp: string;
  listed_price: number;
  mrp: number;
  true_final_price: number;
  applied_coupon: string | null;
  bank_offer: string | null;
  delivery: DeliveryInfo;
  history: PriceHistory;
  verdict: VerdictLabel;
  reasoning: string;
  recovery_events: RecoveryEvent[];
}
