// app/api/accounts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { status } = await req.json();

  if (!['pending', 'approved', 'suspended'].includes(status)) {
    return NextResponse.json(
      { message: 'Invalid status' },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from('accounts')
    .update({ status })
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getSupabase();

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}