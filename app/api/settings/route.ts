// app/api/settings/route.ts  — UPDATED (supports festival + copy fields)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'main')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();

  const allowed = [
    // existing
    'flash_sale_enabled', 'flash_sale_ends_at', 'flash_sale_discount', 'flash_sale_category',
    'stats_customers', 'stats_products', 'stats_rating',
    // new
    'pk_banner_title', 'us_banner_title',
    'festival_enabled', 'festival_ends_at', 'festival_discount', 'festival_category',
    'pk_festival_label', 'us_festival_label',
    'festival_theme_pk', 'festival_theme_us',
  ] as const;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) payload[key] = body[key];
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update(payload)
    .eq('id', 'main')
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}