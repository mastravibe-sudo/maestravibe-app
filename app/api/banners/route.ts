import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createPublicClient } from '@/lib/supabase-public';
import { requireAdmin } from '@/lib/auth';

// GET /api/banners — all banners, sorted
export async function GET() {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/banners — create a new banner
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Default sort_order to end of list if not provided
    if (body.sort_order === undefined) {
      const { data: maxRow } = await supabase
        .from('banners')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();
      body.sort_order = maxRow ? maxRow.sort_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from('banners')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
