import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const ext  = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;

  const safe = base
    .replace(/[^\x00-\x7F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    || 'image';

  return `${safe}${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const rawFileName = req.headers.get('x-file-name') || `image_${Date.now()}.jpg`;
    const fileType    = req.headers.get('x-file-type') || 'image/jpeg';

    const cleanName  = sanitizeFileName(rawFileName);
    const uniqueName = `${Date.now()}_${cleanName}`;

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Bucket name 'products' rakha (AdminDashboard ke mutabiq)
    const { data, error } = await supabase.storage
      .from('products')
      .upload(`images/${uniqueName}`, buffer, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(`images/${uniqueName}`);

    return NextResponse.json({ 
      success: true,
      url: urlData.publicUrl 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error("Upload Catch Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}