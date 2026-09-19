// app/api/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createPublicClient } from '@/lib/supabase-public';
import { requireAdmin } from '@/lib/auth';

function getSupabase() {
  return createPublicClient();
}

// GET /api/subscribers
export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/subscribers
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select()
      .single();

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 409 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}