// app/api/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key);
}

// GET /api/subscribers
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/subscribers
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select()
      .single();

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 409 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}