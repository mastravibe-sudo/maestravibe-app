import { NextRequest, NextResponse } from 'next/server';

const pendingCodes = new Map<string, { code: string; role: string; expiresAt: number }>();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(code: string, email: string, role: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Add the API key to receive verification emails.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'Maestra Vibe <noreply@maestravibe.com>',
      to: [email],
      subject: `Your MaestraVibe verification code`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#7c3aed">MaestraVibe account verification</h2>
        <p>Hello,</p>
        <p>Your verification code for ${role === 'reseller' ? 'Reseller' : 'Customer'} account is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;margin:18px 0;">${code}</div>
        <p>This code will expire in 5 minutes.</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to send email');
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  try {
    const { email, role = 'customer' } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Valid email required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const code = generateCode();
    pendingCodes.set(normalized, { code, role, expiresAt: Date.now() + 5 * 60 * 1000 });

    try {
      await sendEmail(code, normalized, role);
    } catch (error: any) {
      console.error('Verification email error:', error);
      return NextResponse.json({ success: false, message: error.message || 'Unable to send verification code' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
