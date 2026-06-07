// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { data, error } = await supabase
      .from('products').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updates: Record<string, any> = {};
    if (body.name        !== undefined) updates.name        = body.name;
    if (body.price       !== undefined) updates.price       = Number(body.price);
    if (body.category    !== undefined) updates.category    = body.category;
    if (body.description !== undefined) updates.description = body.description;
    if (body.colors      !== undefined) updates.colors      = body.colors;
    if (body.sizes       !== undefined) updates.sizes       = body.sizes;
    if (body.images      !== undefined) updates.images      = body.images;

    const { data, error } = await supabase
      .from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}