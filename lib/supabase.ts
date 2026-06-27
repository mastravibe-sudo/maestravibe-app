// lib/supabase.ts
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