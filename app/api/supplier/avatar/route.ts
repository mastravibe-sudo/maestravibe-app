// app/api/supplier/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BUCKET = 'avatars';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function GET() {
  const session = await getSession();
  if (session?.role !== 'supplier') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data } = await supabase.from('accounts').select('*').eq('id', session.id).maybeSingle();
  const name = data?.store_name ?? data?.shop_name ?? data?.business_name ?? data?.company ?? data?.name ?? data?.full_name ?? 'Supplier';
  return NextResponse.json({ avatar_url: data?.avatar_url ?? null, name }, { headers: { 'Cache-Control': 'no-store' } });
}

// POST multipart { file } -> square 256x256 WEBP profile picture
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== 'supplier') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ message: 'No image received' }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ message: 'Image is too large.' }, { status: 413 });

    const raw = Buffer.from(await file.arrayBuffer());
    let format: string | undefined;
    try { format = (await sharp(raw).metadata()).format; } catch {
      return NextResponse.json({ message: 'This file is not a valid image.' }, { status: 415 });
    }
    if (!format || !['jpeg', 'png', 'webp'].includes(format))
      return NextResponse.json({ message: 'Only JPG, PNG or WEBP images are accepted.' }, { status: 415 });

    const out = await sharp(raw).rotate().resize(256, 256, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();

    const supabase = createAdminClient();
    const path = `${session.id}.webp`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET).upload(path, out, { contentType: 'image/webp', upsert: true, cacheControl: '3600' });
    if (upErr) {
      console.error('avatar upload failed', upErr);
      return NextResponse.json({ message: 'Could not save the picture.' }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const url = `${publicUrl}?v=${Date.now()}`;
    const { error: dbErr } = await supabase.from('accounts').update({ avatar_url: url }).eq('id', session.id);
    if (dbErr) {
      console.error('avatar save failed (run 20261018_supplier_avatar.sql?)', dbErr);
      return NextResponse.json({ message: 'Could not save the picture.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, avatar_url: url });
  } catch (e) {
    console.error('avatar route error', e);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}