// app/api/supplier/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';
import { normalizePhone, validateAddress, validateName } from '@/lib/order-validation';

// ✅ FIX: without this, Next.js can treat this GET route as static and
// cache its response — so after admin approves a supplier, this endpoint
// kept returning the old `status: 'pending'` snapshot until a full
// server restart/redeploy. Forcing dynamic makes every request hit the DB.
export const dynamic = 'force-dynamic';

type SupplierSession = { id: string; email: string; role: string };

async function getSupplier(): Promise<SupplierSession | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== 'supplier') return null;
  return session as SupplierSession;
}

export async function GET(req: NextRequest) {
  const supplier = await getSupplier();
  if (!supplier) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('id, email, name, phone, address, website, status, avatar_url, bank_type, bank_name, bank_account_title, bank_account_number, created_at')
    .eq('id', supplier.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(req: NextRequest) {
  const supplier = await getSupplier();
  if (!supplier) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  // Only self-editable fields — status/role can never be changed by the supplier themself
  const { name, phone, address, website, avatar_url } = body;

  const fieldErrors: Record<string, string> = {};
  const nameError = name !== undefined ? validateName(name) : undefined;
  const phoneResult = phone !== undefined ? normalizePhone(phone, 'pk') : undefined;
  const addressError = address !== undefined ? validateAddress(address) : undefined;
  const websiteError = website !== undefined && website && !/^https?:\/\/.+\..+/.test(String(website))
    ? 'Please enter a valid website URL.'
    : undefined;
  const avatarUrlError = avatar_url !== undefined && avatar_url !== null && !isSafeHttpUrl(avatar_url)
    ? 'Please upload a valid profile image.'
    : undefined;
  if (nameError) fieldErrors.name = nameError;
  if (phoneResult?.error) fieldErrors.phone = phoneResult.error;
  if (addressError) fieldErrors.address = addressError;
  if (websiteError) fieldErrors.website = websiteError;
  if (avatarUrlError) fieldErrors.avatar_url = avatarUrlError;
  if (Object.keys(fieldErrors).length > 0) return NextResponse.json({ error: 'Please correct your profile details.', fieldErrors }, { status: 400 });

  const supabase = createAdminClient();
  const updates: Record<string, string | null> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (phone !== undefined) updates.phone = phoneResult?.value ?? null;
  if (address !== undefined) updates.address = String(address).trim();
  if (website !== undefined) updates.website = website ? String(website).trim() : '';
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', supplier.id)
    .select('id, email, name, phone, address, website, status, avatar_url, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

function isSafeHttpUrl(value: unknown): boolean {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}