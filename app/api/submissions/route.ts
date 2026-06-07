// app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all submissions (optionally filter by type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // e.g. ?type=contact

    let query = supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    console.error('Submissions GET Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, message: 'name, email, and message are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        name: body.name,
        email: body.email,
        subject: body.subject ?? null,
        message: body.message,
        status: 'new',
        type: body.type ?? 'contact',
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Submissions POST Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// PATCH - Update submission status (e.g. mark as read)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { success: false, message: 'id and status are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({ status: body.status })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Submissions PATCH Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to update submission' },
      { status: 500 }
    );
  }
}