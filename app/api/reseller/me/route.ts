import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';
import { normalizePhone, validateAddress, validateName } from '@/lib/order-validation';

function getSupabase() {
  return createAdminClient();
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('accounts')
    .select('name, email, phone, status, address, website, avatar_url')
    .eq('id', session.id)
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, address, website, avatar_url } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined || phone !== undefined || address !== undefined) {
      const fieldErrors: Record<string, string> = {};
      const nameError = name !== undefined ? validateName(name) : undefined;
      const phoneResult = phone !== undefined ? normalizePhone(phone, 'pk') : undefined;
      const addressError = address !== undefined ? validateAddress(address) : undefined;
      if (nameError) fieldErrors.name = nameError;
      if (phoneResult?.error) fieldErrors.phone = phoneResult.error;
      if (addressError) fieldErrors.address = addressError;
      if (Object.keys(fieldErrors).length > 0) return NextResponse.json({ message: 'Please correct your profile details.', fieldErrors }, { status: 400 });
      if (name !== undefined) updates.name = String(name).trim();
      if (phone !== undefined) updates.phone = phoneResult?.value;
      if (address !== undefined) updates.address = String(address).trim();
    }
    if (website !== undefined) {
      if (website && !/^https?:\/\/.+\..+/.test(website)) {
        return NextResponse.json({ message: 'Please enter a valid website URL' }, { status: 400 });
      }
      updates.website = website;
    }
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const supabase = getSupabase();
    const { error } = await supabase.from('accounts').update(updates).eq('id', session.id);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Update failed' }, { status: 500 });
  }
}