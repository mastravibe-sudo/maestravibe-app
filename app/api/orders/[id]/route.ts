// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { data, error } = await supabase
      .from('orders').select('*').eq('id', id).single();
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
    if (body.status   !== undefined) updates.status   = body.status;
    if (body.customer !== undefined) updates.customer = body.customer;
    if (body.items    !== undefined) updates.items    = body.items;
    if (body.total    !== undefined) updates.total    = Number(body.total);

    const { data, error } = await supabase
      .from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}