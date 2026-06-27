// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Rate limit: simple in-memory (upgrade to Upstash for production)
const submitCounts = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = submitCounts.get(ip);
  if (!entry || now > entry.reset) {
    submitCounts.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('product_id');
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  if (!productId) {
    return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [], total: count ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait.' },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const body = await req.json();

  const { product_id, order_id, customer_name, customer_email, stars, body: reviewBody, photo_url } = body;

  if (!product_id || !customer_name || !stars) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Stars must be 1-5' }, { status: 400 });
  }

  // Check if verified purchase
  let verified = false;
  if (order_id && customer_email) {
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer')
      .eq('id', order_id)
      .single();

    if (order && (order.customer as any)?.email === customer_email) {
      verified = true;
    }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      product_id,
      order_id: order_id || null,
      customer_name,
      customer_email,
      stars,
      body: reviewBody,
      photo_url: photo_url || null,
      verified,
      approved: false, // requires admin approval
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: 'Review submitted! It will appear after approval.', data },
    { status: 201 }
  );
}