// lib/supabase.ts
// ── ADD THIS to your existing lib/supabase.ts ──────────────────────────────
// (Append below your other type exports — Product, Order, Subscriber, Submission, Review)

export type SiteSettings = {
  id: string; // always 'main' — single row table
  // Flash Sale
  flash_sale_enabled: boolean;
  flash_sale_ends_at: string;   // ISO timestamp — countdown target
  flash_sale_discount: number;  // e.g. 50 (means "up to 50% off")
  flash_sale_category: string;  // category value to link "Shop Sale" button to, e.g. 'sale'
  // Stats strip
  stats_customers: string;  // e.g. "10K+"
  stats_products: string;   // e.g. "500+"
  stats_rating: string;     // e.g. "4.9★"
  updated_at?: string;
};
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
  status: 'new' | 'pending' | 'completed' | 'delivered';
  created_at: string;
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