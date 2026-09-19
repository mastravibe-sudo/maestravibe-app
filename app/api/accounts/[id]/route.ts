import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await req.json();

  if (!['pending', 'approved', 'suspended'].includes(status)) {
    return NextResponse.json(
      { message: 'Invalid status' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  let approvalStatus = 'pending';

  if (status === 'approved') {
    approvalStatus = 'approved';
  }

  if (status === 'suspended') {
    approvalStatus = 'rejected';
  }

  // Update supplier account only. Account approval and product approval are
  // intentionally independent workflows — approving/suspending a supplier's
  // account must NOT touch their products' approval_status. Products are
  // approved/rejected individually by the admin via /api/products PATCH.
  const { error } = await supabase
    .from('accounts')
    .update({
      status,
      approval_status: approvalStatus,
      rejection_reason:
        status === 'approved'
          ? null
          : status === 'suspended'
          ? 'Supplier suspended by admin'
          : null,
    })
    .eq('id', id)
    .eq('role', 'supplier');

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    status,
    approval_status: approvalStatus,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Deleting the account itself still removes their products — this is
  // account deletion cleanup, not an approval-status cascade, so it stays.
  await supabase
    .from('products')
    .delete()
    .eq('supplier_id', id);

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