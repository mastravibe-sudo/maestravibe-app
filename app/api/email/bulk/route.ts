// app/api/email/bulk/route.ts
// Yeh Resend service use karta hai — free plan mein 3000 emails/month milti hain
// Setup: npm install resend  +  RESEND_API_KEY in .env.local

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subject, body, emails } = await request.json();

    if (!subject || !body || !emails?.length) {
      return NextResponse.json({ success: false, message: 'subject, body aur emails zaroor chahiye' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'RESEND_API_KEY .env.local mein set nahi hai' }, { status: 500 });
    }

    // Send one by one (Resend free plan mein batch limit hai)
    let sent = 0;
    const errors: string[] = [];

    for (const email of emails) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    process.env.EMAIL_FROM ?? 'Maestra Vibe <noreply@maestravibe.com>',
            to:      [email],
            subject: subject,
            html:    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                        <h2 style="color:#7c3aed">${subject}</h2>
                        <div style="white-space:pre-wrap;line-height:1.6;color:#374151">${body}</div>
                        <hr style="margin:24px 0;border-color:#e5e7eb"/>
                        <p style="font-size:12px;color:#9ca3af">
                          Aap yeh email is liye pa rahe hain kyunke aap ne Maestra Vibe ko subscribe kiya tha.
                        </p>
                      </div>`,
          }),
        });
        if (res.ok) sent++;
        else errors.push(email);
      } catch {
        errors.push(email);
      }
    }

    return NextResponse.json({ success: true, sent, failed: errors.length });
  } catch (error: any) {
    console.error('Bulk email error:', error);
    return NextResponse.json({ success: false, message: error.message ?? 'Failed' }, { status: 500 });
  }
}