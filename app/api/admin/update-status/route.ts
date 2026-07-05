// app/api/admin/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  // Aap yahan check kar sakte ho ke sirf admin email hi ye action kar sake
  if (!session || session.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  const { accountId, status } = await req.json();
  if (!['approved', 'suspended', 'pending'].includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase.from('accounts').update({ status }).eq('id', accountId);

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}