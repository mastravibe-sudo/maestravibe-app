import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast bypass for login & API
  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const session = request.cookies.get('admin_session')?.value;

  if (!session || session !== 'authenticated') {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}