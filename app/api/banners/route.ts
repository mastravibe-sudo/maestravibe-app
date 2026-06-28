// app/api/banners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();

  const payload = {
    title:        body.title        ?? '',
    subtitle:     body.subtitle     ?? '',
    tag:          body.tag          ?? '',
    image_url:    body.image_url    ?? '',
    button_label: body.button_label ?? 'Shop Now',
    button_link:  body.button_link  ?? 'all',
    market:       body.market       ?? 'both',
    is_active:    body.is_active    ?? true,
    sort_order:   body.sort_order   ?? 0,
  };

  const { data, error } = await supabase.from('banners').insert(payload).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}