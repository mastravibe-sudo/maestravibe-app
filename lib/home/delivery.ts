// lib/home/delivery.ts
// Location-based delivery charge calculation.
// PK: zone-tiered by city (metros cheapest, unknown/remote areas cost most).
// Other markets: flat shipping fee under the free-delivery threshold.
//
// NOTE: these are starting numbers — swap in your real courier rates
// whenever you have them (e.g. from your HHC/rider partner's rate card).

const PK_TIER1_CITIES = [
  'lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan',
  'peshawar', 'quetta', 'hyderabad', 'gujranwala', 'sialkot', 'sargodha',
];

const PK_TIER2_CITIES = [
  'bahawalpur', 'sukkur', 'larkana', 'sheikhupura', 'jhang', 'rahim yar khan',
  'gujrat', 'kasur', 'okara', 'mardan', 'abbottabad', 'mingora', 'dera ghazi khan',
  'nawabshah', 'sahiwal', 'wah cantt', 'chiniot', 'kotri', 'kamoke', 'hafizabad',
];

export const PK_DELIVERY_CHARGES = {
  tier1:  150, // major metros
  tier2:  250, // other well-connected cities
  remote: 350, // anything not in the list above
} as const;

// Flat shipping fee for non-PK markets (used only when the order is below
// that market's free-delivery threshold).
const NON_PK_FLAT_SHIPPING: Record<string, number> = { us: 6, ae: 15, uk: 5 };

/**
 * Returns the delivery charge for an order, given the market, the
 * customer's city, the order subtotal, and that market's free-delivery
 * minimum (as a plain number, already converted to the market's currency).
 */
export function calculateDeliveryCharge(
  market: string,
  city: string,
  orderSubtotal: number,
  freeDeliveryMin: number,
): number {
  if (freeDeliveryMin > 0 && orderSubtotal >= freeDeliveryMin) return 0;

  if (market === 'pk') {
    const c = city.trim().toLowerCase();
    if (!c) return PK_DELIVERY_CHARGES.remote; // city not filled in yet — show worst case until it is
    if (PK_TIER1_CITIES.some((t) => c.includes(t))) return PK_DELIVERY_CHARGES.tier1;
    if (PK_TIER2_CITIES.some((t) => c.includes(t))) return PK_DELIVERY_CHARGES.tier2;
    return PK_DELIVERY_CHARGES.remote;
  }

  return NON_PK_FLAT_SHIPPING[market] ?? 0;
}