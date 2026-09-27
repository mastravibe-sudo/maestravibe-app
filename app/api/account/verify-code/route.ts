import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import jwt from 'jsonwebtoken';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createAdminClient();
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Email and code are required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const supabase = getSupabase();

    const { data: record, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', normalized)
      .single();

    if (error || !record) {
      return NextResponse.json({ success: false, message: 'Code expired. Please request a new one.' }, { status: 401 });
    }

    if (new Date() > new Date(record.expires_at)) {
      await supabase.from('otp_codes').delete().eq('email', normalized);
      return NextResponse.json({ success: false, message: 'Code expired. Please request a new one.' }, { status: 401 });
    }

    if (record.code !== code) {
      return NextResponse.json({ success: false, message: 'Incorrect verification code' }, { status: 401 });
    }

    await supabase.from('otp_codes').delete().eq('email', normalized);

    const verificationProof = jwt.sign(
      { purpose: 'signup', email: normalized, role: record.role },
      process.env.JWT_SECRET!,
      { expiresIn: '10m' }
    );

    return NextResponse.json({ success: true, role: record.role, verificationProof, message: 'Email verified successfully' });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}