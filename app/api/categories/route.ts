import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key);
}

// GET /api/categories — all categories, sorted
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/categories — create a new category
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();

    if (!body.label) {
      return NextResponse.json({ message: 'Label is required' }, { status: 400 });
    }

    if (!body.value) {
      body.value = body.label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    if (body.sort_order === undefined) {
      const { data: maxRow } = await supabase
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();
      body.sort_order = maxRow ? maxRow.sort_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
