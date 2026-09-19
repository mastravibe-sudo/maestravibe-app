// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const normalized = email.toLowerCase().trim();

    const { data: account } = await supabase.from('accounts').select('*').eq('email', normalized).single();
    if (!account) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, account.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }
    if (account.status === 'suspended') {
      return NextResponse.json({ success: false, message: 'Your account has been suspended. Contact support.' }, { status: 403 });
    }

    const token = jwt.sign(
      { id: account.id, email: account.email, role: account.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({ success: true, role: account.role, status: account.status });
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}