// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ✅ FIX: Handle missing environment variables gracefully
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if variables are available, otherwise create a dummy
export const supabase = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ==================== TYPES ====================

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  actual_price?: number;   // ← yeh add karo
  description: string;
  colors: string[];
  sizes: string[];
  images: string[];
  created_at?: string;
};

export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image?: string;
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
  status: 'new' | 'pending' | 'completed';
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