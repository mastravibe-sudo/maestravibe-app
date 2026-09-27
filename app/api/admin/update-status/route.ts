// app/api/admin/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  const { accountId, status } = await req.json();
  if (!accountId) {
    return NextResponse.json({ success: false, message: 'Account ID is required' }, { status: 400 });
  }
  if (!['approved', 'suspended', 'pending'].includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: account, error: lookupError } = await supabase
    .from('accounts')
    .select('role')
    .eq('id', accountId)
    .single();
  if (lookupError || !account) {
    return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
  }

  const updates: Record<string, string> = { status };
  if (account.role === 'supplier') {
    updates.approval_status = status === 'suspended' ? 'rejected' : status;
  }
  const { error } = await supabase.from('accounts').update(updates).eq('id', accountId);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}