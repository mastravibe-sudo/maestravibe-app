// app/api/accounts/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  const supabase = getSupabase();
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id, name, email, role, status, phone, address, website, bank_type, bank_name, bank_account_title, bank_account_number, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const { data: warnings } = await supabase.from('account_warnings').select('account_id');
  const warningCounts: Record<string, number> = {};
  (warnings ?? []).forEach((w: any) => {
    warningCounts[w.account_id] = (warningCounts[w.account_id] ?? 0) + 1;
  });

  const enriched = (accounts ?? []).map(a => ({ ...a, warning_count: warningCounts[a.id] ?? 0 }));
  return NextResponse.json(enriched);
}