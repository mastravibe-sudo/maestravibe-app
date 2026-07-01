import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key);
}

// GET /api/settings — returns the single settings row (creates it if missing)
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error && error.code === 'PGRST116') {
      // No row found yet — create default row
      const { data: created, error: insertErr } = await supabase
        .from('site_settings')
        .insert([{ id: 'main' }])
        .select()
        .single();
      if (insertErr) throw insertErr;
      return NextResponse.json(created);
    }

    if (error) throw error;

    return NextResponse.json(data ?? {});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/settings — updates the single settings row
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();

    // Never let the client overwrite the primary key
    delete body.id;

    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', 'main')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
