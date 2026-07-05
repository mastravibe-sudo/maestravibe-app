// app/api/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

async function sendPasswordEmail(email: string, newPassword: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'Maestra Vibe <noreply@maestravibe.online>',
      to: [email],
      subject: 'Your new MaestraVibe password',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#7c3aed">Password Reset</h2>
        <p>Your new password is:</p>
        <div style="font-size:24px;font-weight:700;letter-spacing:2px;color:#111827;margin:18px 0;background:#f3f4f6;padding:12px 20px;border-radius:8px;display:inline-block;">${newPassword}</div>
        <p>Please log in with this password. We recommend changing it after logging in.</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to send email');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const normalized = email.toLowerCase().trim();

    const { data: account } = await supabase.from('accounts').select('id, email').eq('email', normalized).single();

    // Security: even if account not found, don't reveal that — same generic message
    if (!account) {
      return NextResponse.json({ success: true, message: 'If an account exists with this email, a new password has been sent.' });
    }

    const newPassword = generatePassword();
    const password_hash = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase.from('accounts').update({ password_hash }).eq('id', account.id);
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

    await sendPasswordEmail(account.email, newPassword);

    return NextResponse.json({ success: true, message: 'If an account exists with this email, a new password has been sent.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}