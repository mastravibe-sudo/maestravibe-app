// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all products
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    console.error('Products GET Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || body.price === undefined) {
      return NextResponse.json(
        { success: false, message: 'name and price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        price: Number(body.price),
        category: body.category ?? 'fashion',
        description: body.description ?? '',
        colors: body.colors ?? [],
        sizes: body.sizes ?? [],
        images: body.images ?? [],
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Products POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to create product' },
      { status: 500 }
    );
  }
}