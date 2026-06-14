// app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key);
}

// GET /api/submissions
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/submissions  (from contact form)
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { name, email, type = 'contact', subject, message } = body;

    if (!name || !email) {
      return NextResponse.json({ message: 'name and email are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert([{ name, email, type, subject, message, status: 'new' }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/submissions  (update status)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: 'id and status are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', id)
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