import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables missing!");
}

// Correct Client Creator
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Browser Client (optional)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// ====================== TYPES ======================

// A single size+color price combination.
// When a product has variants, the storefront should look up the
// matching variant for the customer's selected size/color and use
// its price/actual_price/stock instead of the product's flat price.
export interface ProductVariant {
  id: string;            // local id, e.g. crypto.randomUUID() — used for React keys / editing
  size: string;           // e.g. "M", "Free Size", "42"
  color: string;          // hex or color name, e.g. "#1f2937"
  price: number;
  actual_price?: number | null;
  stock?: number | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  actual_price?: number;
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
  images: string[];
  owner_type?: 'mestravibe' | 'merchant';
  merchant_name?: string;
  merchant_logo?: string;
  market_availability?: 'pk' | 'us' | 'both';

  // Custom tags, e.g. ["New Arrival", "Best Seller", "Limited Edition"]
  tags?: string[];

  // Links this product to a festival/seasonal sale (matches SiteSettings
  // festival_category or a free-text festival slug you choose)
  festival_tag?: string;

  // Per size/color price variants — see ProductVariant
  variants?: ProductVariant[];
  has_variants?: boolean;

  // ── Supplier marketplace fields ──
  // Present when this product belongs to a supplier (not in-house MaestraVibe
  // stock). Used by CheckoutForm to attach the commission split to orders,
  // and by the admin/supplier panels for approval + payout tracking.
  supplier_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  supplier_price?: number;         // what the supplier is paid per unit
  commission_percent?: number;     // per-product override; falls back to supplier/global default
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;

  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  order_id?: string;
  customer_name: string;
  customer_email?: string;
  stars: number;
  body?: string;
  photo_url?: string;
  verified: boolean;
  approved: boolean;
  created_at: string;
}

export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image?: string;
  productId?: string;
  // ── Supplier marketplace fields (see Product above) ──
  supplier_id?: string | null;
  supplier_price?: number | null;
};

export type Order = {
  id: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    city: string;
    area?: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending_verification' | 'new' | 'pending' | 'accepted' | 'completed' | 'delivered';
  created_at: string;

  // ── Supplier marketplace fields ──
  // Populated only when every item in the order belongs to the same
  // supplier — see app/api/orders/route.ts. Mixed-supplier orders leave
  // these null; per-item splits still live inside `items`.
  supplier_id?: string | null;
  supplier_amount?: number | null;
  commission_amount?: number | null;
  reseller_profit?: number | null;
  supplier_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  supplier_paid?: boolean;
};

export type Subscriber = {
  id: string;
  email: string;
  subscribed_at: string;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  type: 'contact' | 'career' | 'subscriber';
  created_at: string;
};

// ── Homepage CMS types ──────────────────────────────────────────

export type SiteSettings = {
  id: string; // always 'main' — single row table

  // Flash Sale
  flash_sale_enabled: boolean;
  flash_sale_ends_at: string;   // ISO timestamp — countdown target
  flash_sale_discount: number;  // e.g. 50 (means "up to 50% off")
  flash_sale_category: string;  // category value to link "Shop Sale" button to, e.g. 'sale'

  // Festival / seasonal sale (Eid, Ramadan, Black Friday, etc.)
  festival_enabled: boolean;
  festival_ends_at: string;
  festival_discount: number;
  festival_category: string;
  pk_festival_label: string;
  us_festival_label: string;
  festival_theme_pk: string;
  festival_theme_us: string;

  // Announcement bar
  pk_banner_title: string;
  us_banner_title: string;

  // Stats strip
  stats_customers: string;  // e.g. "10K+"
  stats_products: string;   // e.g. "500+"
  stats_rating: string;     // e.g. "4.9★"

  updated_at?: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image_url: string;
  button_label: string;
  button_link: string;
  market: 'pk' | 'us' | 'both';
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

export type Category = {
  id: string;
  label: string;
  value: string;
  image_url: string;
  emoji: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};