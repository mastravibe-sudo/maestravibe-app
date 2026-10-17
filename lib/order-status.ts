// lib/order-status.ts
export const STAGES = ['placed', 'accepted', 'packed', 'shipped', 'delivered'] as const;
export type Stage = (typeof STAGES)[number] | 'cancelled';

export const STAGE_LABEL: Record<Stage, string> = {
  placed: 'Order placed',
  accepted: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const SUPPLIER_STATUSES = ['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

const NEXT: Record<string, SupplierStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function nextSupplierStatuses(current?: string | null): SupplierStatus[] {
  return NEXT[String(current ?? 'pending').toLowerCase()] ?? [];
}

/** One stage for every viewer (customer, reseller, supplier, admin): supplier status wins, else admin status. */
export function resolveStage(order: { status?: string | null; supplier_status?: string | null }): Stage {
  const s = String(order.supplier_status ?? '').toLowerCase();
  if (s === 'cancelled') return 'cancelled';
  if (s === 'accepted' || s === 'packed' || s === 'shipped' || s === 'delivered') return s as Stage;
  const a = String(order.status ?? '').toLowerCase();
  if (a.includes('cancel')) return 'cancelled';
  if (a.includes('complete') || a.includes('deliver')) return 'delivered';
  if (a.includes('ship')) return 'shipped';
  if (a.includes('process')) return 'accepted';
  return 'placed';
}