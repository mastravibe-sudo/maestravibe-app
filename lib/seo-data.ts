import 'server-only';

import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase-admin';
import type { Product } from '@/lib/supabase';
import { categorySlug } from '@/lib/seo';

export const getApprovedProducts = cache(async (market: 'all' | 'pk' | 'us' = 'all'): Promise<Product[]> => {
  const supabase = createAdminClient();
  let query = supabase
    .from('products')
    .select('*')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false });

  if (market !== 'all') {
    const visibleMarkets = market === 'us' ? ['us', 'both'] : ['pk', 'both'];
    query = query.or(`market_availability.in.(${visibleMarkets.join(',')}),market_availability.is.null`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Unable to load public products: ${error.message}`);
  return (data ?? []) as Product[];
});

export const getApprovedProduct = cache(async (id: string): Promise<Product | null> => {
  const { data, error } = await createAdminClient()
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('approval_status', 'approved')
    .maybeSingle();

  if (error) throw new Error(`Unable to load product: ${error.message}`);
  return (data as Product | null) ?? null;
});

export const getApprovedCategory = cache(async (slug: string) => {
  const products = await getApprovedProducts();
  const category = [...new Set(products.map(product => product.category).filter(Boolean))]
    .find(value => categorySlug(value) === slug);

  if (!category) return null;
  return {
    category,
    products: products.filter(product => product.category === category),
  };
});
