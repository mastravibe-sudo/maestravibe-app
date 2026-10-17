// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { resolveStage } from '@/lib/order-status';

// Simple per-instance rate limit (upgrade to Upstash/Redis later). Real protection = admin approval + dedupe below.
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

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

// ONLY public fields. The old `select('*')` also sent every reviewer's email and order id to the browser.
const PUBLIC_FIELDS = 'id, customer_name, stars, body, photo_url, verified, created_at';

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('product_id');
  const page = Math.max(1, Math.floor(Number(req.nextUrl.searchParams.get('page') ?? '1')) || 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  if (!productId) return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error, count } = await supabase
    .from('reviews')
    .select(PUBLIC_FIELDS, { count: 'exact' })
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [], total: count ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many submissions. Please wait.' }, { status: 429 });

  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const product_id = clip(raw.product_id, 100);
  const order_id = clip(raw.order_id, 64);
  const customer_name = clip(raw.customer_name, 80);
  const customer_email = clip(raw.customer_email, 120).toLowerCase();
  const reviewBody = clip(raw.body, 2000);
  const stars = Number(raw.stars);

  if (!product_id || !customer_name || !Number.isInteger(stars))
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  if (stars < 1 || stars > 5) return NextResponse.json({ error: 'Stars must be 1-5' }, { status: 400 });
  if (customer_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer_email))
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });

  const supabase = createAdminClient();

  // The product must really exist
  const { data: product } = await supabase.from('products').select('id').eq('id', product_id).maybeSingle();
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // One review per product per email
  if (customer_email) {
    const { data: dup } = await supabase
      .from('reviews').select('id').eq('product_id', product_id).eq('customer_email', customer_email).limit(1);
    if (dup && dup.length > 0) return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 });
  }

  // Verified purchase = the order's email matches, the order contains THIS product, and it was delivered.
  let verified = false;
  if (order_id && customer_email) {
    const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).maybeSingle();
    if (order) {
      const emailOk = String((order.customer as any)?.email ?? '').trim().toLowerCase() === customer_email;
      const hasProduct = Array.isArray(order.items) && order.items.some((i: any) => String(i.productId ?? '') === product_id);
      verified = emailOk && hasProduct && resolveStage(order) === 'delivered';
    }
  }

  const { error } = await supabase.from('reviews').insert([
    {
      product_id,
      order_id: order_id || null,
      customer_name,
      customer_email: customer_email || null,
      stars,
      body: reviewBody || null,
      photo_url: null, // client-supplied image links are not trusted
      verified,
      approved: false, // admin must approve
    },
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: 'Review submitted! It will appear after approval.' }, { status: 201 });
}