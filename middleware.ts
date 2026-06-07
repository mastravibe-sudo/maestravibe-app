import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    // Login page allow karo
    if (pathname.startsWith('/admin-s3cr3t-login')) return NextResponse.next();

    const cookie = req.cookies.get('admin_auth');
    if (cookie?.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin-s3cr3t-login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-s3cr3t-login'],
};