// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();

  if (!body.label || !body.value) {
    return NextResponse.json({ message: 'label and value are required' }, { status: 400 });
  }

  const payload = {
    label:     body.label,
    value:     body.value.toLowerCase().replace(/\s+/g, '-'),
    image_url: body.image_url ?? '',
    emoji:     body.emoji     ?? '',
    is_active: body.is_active ?? true,
    sort_order: body.sort_order ?? 0,
  };

  const { data, error } = await supabase.from('categories').insert(payload).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}