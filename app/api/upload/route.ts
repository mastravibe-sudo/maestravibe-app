// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const fileName = request.headers.get('x-file-name');
    const fileType = request.headers.get('x-file-type') ?? 'image/jpeg';

    if (!fileName) {
      return NextResponse.json({ success: false, message: 'x-file-name header missing' }, { status: 400 });
    }

    const buffer = await request.arrayBuffer();
    const bytes  = new Uint8Array(buffer);

    const { error } = await supabase.storage
      .from('products')          // ← Supabase Storage bucket name
      .upload(`images/${fileName}`, bytes, {
        contentType: fileType,
        upsert:      false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(`images/${fileName}`);

    return NextResponse.json({ success: true, url: urlData.publicUrl }, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Upload failed' },
      { status: 500 }
    );
  }
}