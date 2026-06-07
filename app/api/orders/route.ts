// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all orders
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    console.error('Orders GET Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.customer || !body.items || body.total === undefined) {
      return NextResponse.json(
        { success: false, message: 'customer, items, and total are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer: body.customer,
        items: body.items,
        total: Number(body.total),
        status: body.status ?? 'new',
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Orders POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to create order' },
      { status: 500 }
    );
  }
}