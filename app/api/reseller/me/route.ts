import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  const session = getSession();
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
  const session = getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, address, website, avatar_url } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) {
      const cleanPhone = String(phone).replace(/[\s-]/g, '');
      if (!/^(\+92|0)?3\d{9}$/.test(cleanPhone)) {
        return NextResponse.json({ message: 'Please enter a valid Pakistani phone number' }, { status: 400 });
      }
      updates.phone = cleanPhone;
    }
    if (address !== undefined) updates.address = address;
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