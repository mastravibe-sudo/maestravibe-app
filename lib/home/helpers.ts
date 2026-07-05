// lib/home/helpers.ts

import { MARKET_CONFIG } from './constants';
import type { ProductVariant, CartItem } from './types';

// ── Price formatting ──────────────────────────────────────────────────────────
export function formatPrice(pricePKR: number, market: string): string {
  const cfg = MARKET_CONFIG[market] ?? MARKET_CONFIG['pk'];
  if (market === 'pk') return `Rs. ${pricePKR.toLocaleString()}`;
  const converted = pricePKR / cfg.conversionRate;
  if (market === 'us') return `$${converted.toFixed(2)}`;
  if (market === 'ae') return `AED ${converted.toFixed(0)}`;
  if (market === 'uk') return `£${converted.toFixed(2)}`;
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

// ── Variant helpers ───────────────────────────────────────────────────────────
export function findVariant(
  product: any,
  size: string,
  color: string
): ProductVariant | null {
  if (!product?.variants?.length) return null;
  return (
    product.variants.find(
      (v: ProductVariant) =>
        (v.size || '') === (size || '') && (v.color || '') === (color || '')
    ) ?? null
  );
}

export function effectivePrice(
  product: any,
  size: string,
  color: string
): number {
  const v = findVariant(product, size, color);
  return v ? v.price : product.price;
}

// ── Cart localStorage ─────────────────────────────────────────────────────────
export const loadCart = (): CartItem[] => {
  try {
    const s = localStorage.getItem('mv_cart2');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

export const saveCart = (c: CartItem[]): void => {
  try {
    localStorage.setItem('mv_cart2', JSON.stringify(c));
  } catch {}
};

// ── Wishlist localStorage ─────────────────────────────────────────────────────
export const loadWish = (): string[] => {
  try {
    const s = localStorage.getItem('mv_wish');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

export const saveWish = (w: string[]): void => {
  try {
    localStorage.setItem('mv_wish', JSON.stringify(w));
  } catch {}
};

// ── Recently Viewed localStorage ──────────────────────────────────────────────
export const loadRecentlyViewed = (): any[] => {
  try {
    const s = localStorage.getItem('mv_recent');
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

export const saveRecentlyViewed = (items: any[]): void => {
  try {
    localStorage.setItem('mv_recent', JSON.stringify(items));
  } catch {}
};

// ── Sound ─────────────────────────────────────────────────────────────────────
export const playSound = (): void => {
  try {
    const a = new Audio('/sound/mixkit-happy-bells-notification-937.wav');
    a.volume = 0.7;
    a.play().catch(() => {});
  } catch {}
};

// ── Product ID normalizer (Supabase returns id, AI expects _id) ───────────────
export function normalizeProductId(product: any): any {
  return {
    ...product,
    _id: product._id ?? product.id,
  };
}

// ── Build chatProducts array for AIChat ───────────────────────────────────────
export function buildChatProducts(allProducts: any[]) {
  return allProducts.map((p) => ({
    _id:         p._id ?? p.id,   // ✅ Supabase returns id, AI needs _id
    name:        p.name,
    price:       p.price,
    images:      p.images ?? [],
    category:    p.category,
    description: p.description ?? '',
    colors:      p.colors ?? [],
    sizes:       p.sizes ?? [],
  }));
}