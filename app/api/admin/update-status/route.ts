// app/api/admin/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  const { accountId, status } = await req.json();
  if (!['approved', 'suspended', 'pending'].includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('accounts').update({ status }).eq('id', accountId);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}