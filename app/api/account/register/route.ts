import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      role = 'customer',
      name,
      phone,
      age,
      address,
      website,
      bank_type,
      bank_name,
      bank_account_title,
      bank_account_number,
    } = body;

    if (!email || !name || !phone || !age || !address) {
      return NextResponse.json({ success: false, message: 'Name, phone, age and address are required' }, { status: 400 });
    }

    if (role === 'reseller') {
      if (!bank_type || !bank_name || !bank_account_title || !bank_account_number) {
        return NextResponse.json({ success: false, message: 'Bank details are required for reseller accounts' }, { status: 400 });
      }
    }

    const supabase = getSupabase();
    const type = role === 'reseller' ? 'reseller_account' : 'customer_account';
    const payload = {
      role,
      phone,
      age,
      address,
      website: website || '',
      ...(role === 'reseller'
        ? {
            bank_type,
            bank_name,
            bank_account_title,
            bank_account_number,
          }
        : {}),
    };

    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          name,
          email,
          type,
          subject: `${role === 'reseller' ? 'Reseller' : 'Customer'} Account Registration`,
          message: JSON.stringify(payload),
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Account created successfully', account: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
