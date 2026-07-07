// app/api/reseller/products/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // always fetch fresh data, avoid caching issues

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'reseller') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, description, images, colors, sizes')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}