import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createPublicClient } from '@/lib/supabase-public';
import { requireAdmin } from '@/lib/auth';

// GET /api/settings — returns the single settings row (creates it if missing)
export async function GET() {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error && error.code === 'PGRST116') {
      // No row found yet — create default row
      const { data: created, error: insertErr } = await supabase
        .from('site_settings')
        .insert([{ id: 'main' }])
        .select()
        .single();
      if (insertErr) throw insertErr;
      return NextResponse.json(created);
    }

    if (error) throw error;

    return NextResponse.json(data ?? {});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/settings — updates the single settings row
export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const supabase = createAdminClient();
    const body = await req.json();

    // Never let the client overwrite the primary key
    delete body.id;

    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', 'main')
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
