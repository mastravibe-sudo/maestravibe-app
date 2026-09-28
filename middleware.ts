// middleware.ts (root of project)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'mv_market';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

async function detectMarket(request: NextRequest): Promise<'pk' | 'us'> {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : null;

    if (!ip || ip === '::1' || ip === '127.0.0.1') return 'pk';

    // Primary: ipapi.co (free tier: 1000 req/day)
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'MaestraVibe/1.0' },
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.country_code === 'US') return 'us';
      return 'pk';
    }
  } catch {
    // Fallback: default to pk
  }
  return 'pk';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (request.nextUrl.searchParams.get('checkout') === '1') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Skip static files, api routes, and next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return response;
  }

  const existingMarket = request.cookies.get(COOKIE_NAME)?.value;

  if (!existingMarket || !['pk', 'us'].includes(existingMarket)) {
    const market = await detectMarket(request);
    response.cookies.set(COOKIE_NAME, market, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};