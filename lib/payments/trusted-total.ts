// lib/payments/trusted-total.ts
import { createAdminClient } from '@/lib/supabase-admin';
import { effectivePrice } from '@/lib/home/helpers';

type Market = 'pk' | 'us';
type Item = {
  productId?: string | number;
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
};

type Result = { ok: true; total: number } | { ok: false; reason: string };

/**
 * Recomputes the SUBTOTAL on the server from the products table, using the same
 * effectivePrice() (size/color variant pricing) the storefront uses.
 * The browser's prices are never trusted for online payments.
 *
 * Fails CLOSED: if a product's market or price cannot be proven, the order is
 * rejected instead of charging a wrong amount / wrong currency
 * (e.g. a PKR price must never be charged as USD).
 * Rejections are logged with console.error (see Vercel / terminal logs).
 */
export async function computeTrustedTotal(items: Item[], market: Market): Promise<Result> {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, reason: 'Cart is empty' };

  const ids = [...new Set(items.map((i) => i.productId).filter((v) => v !== undefined && v !== null))];
  if (ids.length === 0) return { ok: false, reason: 'Items are missing productId' };

  const supabase = createAdminClient();
  const { data: products, error } = await supabase.from('products').select('*').in('id', ids as any[]);
  if (error || !products) {
    console.error('trusted-total: products lookup failed', error);
    return { ok: false, reason: 'Could not verify prices' };
  }

  const byId = new Map<string, any>(products.map((p: any) => [String(p.id), p]));

  let total = 0;
  for (const item of items) {
    const product = byId.get(String(item.productId));
    if (!product) return { ok: false, reason: 'A product in your cart is no longer available' };

    if (!allowedInMarket(product, market)) {
      console.error('trusted-total: product not allowed in market', { id: product.id, market, keys: Object.keys(product) });
      return { ok: false, reason: 'A product in your cart is not available in your region' };
    }

    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty < 1 || qty > 100) return { ok: false, reason: 'Invalid quantity' };

    const size = item.selectedSize ?? product.sizes?.[0] ?? 'Standard';
    const color = item.selectedColor ?? product.colors?.[0] ?? '';
    const unit = Number(effectivePrice({ ...product, _id: product.id }, size, color));
    if (!Number.isFinite(unit) || unit <= 0) {
      console.error('trusted-total: could not price product', { id: product.id, size, color });
      return { ok: false, reason: 'Price could not be verified for an item' };
    }

    total += unit * qty;
  }
  return { ok: true, total: Math.round(total * 100) / 100 };
}

function allowedInMarket(product: any, market: Market): boolean {
  const raw = product.market ?? product.markets ?? product.country;
  if (raw === undefined || raw === null) return false; // cannot prove it -> reject
  const list = (Array.isArray(raw) ? raw : [raw]).map((v) => String(v).toLowerCase());
  return list.includes('both') || list.includes(market) || (market === 'us' && list.includes('usa'));
}