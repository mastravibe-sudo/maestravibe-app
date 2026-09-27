import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateAccountDetails } from '@/lib/order-validation';

function getSupabase() {
  return createAdminClient();
}

function validateBankAccount(bankType: string, accountNumber: string): string | null {
  const clean = accountNumber.replace(/[\s-]/g, '');

  if (bankType === 'JazzCash' || bankType === 'EasyPaisa') {
    if (!/^(03\d{9})$/.test(clean)) {
      return 'Please enter a valid 11-digit mobile wallet number (e.g. 03XXXXXXXXX)';
    }
  } else if (bankType === 'Bank Transfer') {
    if (!/^\d{10,24}$/.test(clean)) {
      return 'Please enter a valid bank account number (10-24 digits)';
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role = 'customer', name, phone, age, address, website,
      bank_type, bank_name, bank_account_title, bank_account_number, terms_accepted } = body;

    if (!['customer', 'reseller'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid account type' }, { status: 400 });
    }

    if (!email || !password || !name || !phone || !age || !address) {
      return NextResponse.json({ success: false, message: 'Name, email, password, phone, age and address are required' }, { status: 400 });
    }

    if (!terms_accepted) {
      return NextResponse.json({ success: false, message: 'You must accept the Terms & Policy to create an account' }, { status: 400 });
    }

    try {
      const proof = jwt.verify(body.verificationProof, process.env.JWT_SECRET!) as {
        purpose?: string;
        email?: string;
        role?: string;
      };
      if (proof.purpose !== 'signup' || proof.email !== String(email).toLowerCase().trim() || proof.role !== role) {
        throw new Error('Signup verification does not match this account');
      }
    } catch {
      return NextResponse.json({ success: false, message: 'Verify your email again before creating your account' }, { status: 401 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const identityValidation = validateAccountDetails({ name, phone, address }, 'pk');
    if (!identityValidation.valid) {
      return NextResponse.json({ success: false, message: 'Please correct your account details.', fieldErrors: identityValidation.fieldErrors }, { status: 400 });
    }
    const cleanPhone = identityValidation.normalized.phone;
    const cleanName = identityValidation.normalized.name;
    const cleanAddress = identityValidation.normalized.address;

    // Age validation
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      return NextResponse.json({ success: false, message: 'Please enter a valid age' }, { status: 400 });
    }

    // Website validation (agar diya ho)
    if (website && !/^https?:\/\/.+\..+/.test(website)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid website URL (starting with http:// or https://)' }, { status: 400 });
    }

    if (role === 'reseller') {
      if (!bank_type || !bank_name || !bank_account_title || !bank_account_number) {
        return NextResponse.json({ success: false, message: 'Bank details are required for reseller accounts' }, { status: 400 });
      }
      const bankError = validateBankAccount(bank_type, bank_account_number);
      if (bankError) {
        return NextResponse.json({ success: false, message: bankError }, { status: 400 });
      }
    }

    const supabase = getSupabase();
    const normalized = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing } = await supabase.from('accounts').select('id').eq('email', normalized).single();
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const status = role === 'reseller' ? 'pending' : 'approved';

    const { data, error } = await supabase
      .from('accounts')
      .insert([{
        email: normalized, name: cleanName, role, phone: cleanPhone, age: ageNum, address: cleanAddress, website: website || '',
        bank_type, bank_name, bank_account_title, bank_account_number,
        password_hash, status, terms_accepted: true,
      }])
      .select('id, email, name, role, status')
      .single();

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

    return NextResponse.json({ success: true, message: 'Account created successfully', account: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}