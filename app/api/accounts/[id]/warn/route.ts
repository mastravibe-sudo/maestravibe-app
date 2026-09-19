// app/api/accounts/[id]/warn/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

async function sendWarningEmail(email: string, name: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM ??
        'Maestra Vibe <noreply@maestravibe.online>',
      to: [email],
      subject: 'Important Notice Regarding Your MaestraVibe Account',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#dc2626">Account Warning</h2>
        <p>Hello ${name},</p>
        <p>MaestraVibe admin has sent you the following notice regarding your account:</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;color:#991b1b;">
          ${message}
        </div>
        <p style="font-size:13px;color:#6b7280;">
          Please review your account activity. Repeated violations may result in account suspension.
        </p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to send email');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: 'Warning message is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: account } = await supabase
      .from('accounts')
      .select('email, name')
      .eq('id', id)
      .single();

    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      );
    }

    const { error: insertError } = await supabase
      .from('account_warnings')
      .insert([{ account_id: id, message }]);

    if (insertError) {
      return NextResponse.json(
        { message: insertError.message },
        { status: 500 }
      );
    }

    try {
      await sendWarningEmail(account.email, account.name, message);
    } catch (emailErr) {
      console.error('Warning email failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : 'Failed to send warning',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('account_warnings')
    .select('*')
    .eq('account_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}