// app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createPublicClient } from '@/lib/supabase-public';
import { requireAdmin } from '@/lib/auth';

// GET /api/submissions
export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/submissions  (from contact form)
export async function POST(req: NextRequest) {
  try {
    const supabase = createPublicClient();
    const body = await req.json();
    const { name, email, type = 'contact', subject, message } = body;

    if (!name || !email) {
      return NextResponse.json({ message: 'name and email are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert([{ name, email, type, subject, message, status: 'new' }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/submissions  (update status)
export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: 'id and status are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}