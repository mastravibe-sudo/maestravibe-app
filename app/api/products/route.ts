// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const market = req.cookies.get('mv_market')?.value ?? 'pk';
    const marketValues = market === 'us' ? ['us', 'both'] : ['pk', 'both'];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('market_availability', marketValues)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("GET Products Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST Product Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PATCH Product Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}