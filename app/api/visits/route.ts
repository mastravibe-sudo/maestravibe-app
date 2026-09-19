import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const EXCLUDED_PREFIXES = ['/admin', '/dashboard', '/supplier', '/login', '/forgot-password'];
const VISITOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isExcludedPath(path: unknown): boolean {
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 512) return true;
  return EXCLUDED_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session && ['admin', 'reseller', 'supplier'].includes(session.role)) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await req.json();
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId : '';
    const market = body.market === 'us' ? 'us' : body.market === 'pk' ? 'pk' : null;
    if (!VISITOR_ID_PATTERN.test(visitorId) || isExcludedPath(body.path)) {
      return new NextResponse(null, { status: 204 });
    }

    const { error } = await createAdminClient().from('site_visits').insert({
      path: body.path,
      visitor_id: visitorId,
      market,
    });
    if (error) {
      console.error('[visits] Failed to record storefront visit:', error);
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[visits] Invalid tracking request:', error);
    return new NextResponse(null, { status: 204 });
  }
}