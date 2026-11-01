import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

type ProductCursor = {
  created_at: string;
  id: string;
};

function isProductCursor(value: unknown): value is ProductCursor {
  if (!value || typeof value !== 'object') return false;
  const cursor = value as Record<string, unknown>;

  return (
    typeof cursor.created_at === 'string' &&
    TIMESTAMP_PATTERN.test(cursor.created_at) &&
    Number.isFinite(Date.parse(cursor.created_at)) &&
    typeof cursor.id === 'string' &&
    UUID_PATTERN.test(cursor.id)
  );
}

function decodeCursor(value: string): ProductCursor | null {
  try {
    const decoded = Buffer.from(value, 'base64url');
    if (decoded.toString('base64url') !== value) return null;

    const cursor: unknown = JSON.parse(decoded.toString('utf8'));
    return isProductCursor(cursor) ? cursor : null;
  } catch {
    return null;
  }
}

function encodeCursor(cursor: ProductCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function hasValidApiKey(provided: string, expected: string): boolean {
  const providedHash = createHash('sha256').update(provided).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export async function GET(req: NextRequest) {
  const expectedApiKey = process.env.MARKET_API_KEY;
  if (!expectedApiKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }

  const providedApiKey = req.headers.get('x-api-key');
  if (!providedApiKey || !hasValidApiKey(providedApiKey, expectedApiKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rawLimit = searchParams.get('limit');
  const parsedLimit = rawLimit === null ? 24 : Number(rawLimit);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(48, Math.max(1, Math.trunc(parsedLimit)))
    : 24;
  const rawCursor = searchParams.get('cursor');
  const cursor = rawCursor ? decodeCursor(rawCursor) : null;

  if (rawCursor && !cursor) {
    return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
  }

  try {
    const market = req.cookies.get('mv_market')?.value ?? 'pk';
    const marketValues = market === 'us' ? ['us', 'both'] : ['pk', 'both'];
    const supabase = createAdminClient();
    let query = supabase
      .from('products')
      .select('id,name,price,images,created_at')
      .eq('approval_status', 'approved')
      .or(`market_availability.in.(${marketValues.join(',')}),market_availability.is.null`)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .limit(limit + 1);

    if (cursor) {
      query = query.or(
        `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.gt.${cursor.id})`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    const products = data ?? [];
    const hasNextPage = products.length > limit;
    const page = products.slice(0, limit);
    const lastProduct = page[page.length - 1];

    if (hasNextPage && (!lastProduct?.created_at || !lastProduct.id)) {
      throw new Error('Unable to build product cursor');
    }

    return NextResponse.json({
      items: page.map(product => ({
        id: product.id,
        title: product.name,
        price: product.price,
        currency: 'PKR',
        image_url: Array.isArray(product.images) ? product.images[0] ?? null : null,
        url: new URL(`/products/${encodeURIComponent(product.id)}`, SITE_URL).toString(),
        in_stock: true,
      })),
      next_cursor:
        hasNextPage && lastProduct
          ? encodeCursor({ created_at: lastProduct.created_at, id: lastProduct.id })
          : null,
    });
  } catch (error: unknown) {
    console.error('GET Public Products Error:', error);
    return NextResponse.json({ error: 'Unable to load public products' }, { status: 500 });
  }
}
