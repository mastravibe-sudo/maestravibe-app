// app/api/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all subscribers
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    console.error('Subscribers GET Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST - Add a new subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'email is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email: body.email }])
      .select()
      .single();

    if (error) {
      // Unique constraint violation — already subscribed
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'This email is already subscribed' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Subscribers POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to subscribe' },
      { status: 500 }
    );
  }
}