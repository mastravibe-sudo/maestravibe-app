// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  }

  return createClient(url, key);
}

// GET /api/products
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();

    const { name, price, actual_price, category, description, colors, sizes, images } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ message: 'name and price are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, price, actual_price: actual_price ?? null, category, description, colors, sizes, images }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}