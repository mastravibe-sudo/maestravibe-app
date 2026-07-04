import { NextRequest, NextResponse } from 'next/server';

const pendingCodes = new Map<string, { code: string; role: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Email and code are required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const record = pendingCodes.get(normalized);

    if (!record || Date.now() > record.expiresAt) {
      pendingCodes.delete(normalized);
      return NextResponse.json({ success: false, message: 'Code expired. Please request a new one.' }, { status: 401 });
    }

    if (record.code !== code) {
      return NextResponse.json({ success: false, message: 'Incorrect verification code' }, { status: 401 });
    }

    pendingCodes.delete(normalized);

    return NextResponse.json({ success: true, role: record.role, message: 'Email verified successfully' });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
