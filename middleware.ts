import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sirf /admin routes protect karo
export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login ko skip karo — warna infinite redirect
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Cookie check karo
  const token = request.cookies.get('admin_token')?.value;

  if (!token || token !== process.env.ADMIN_SECRET) {
    // Login page par redirect
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}