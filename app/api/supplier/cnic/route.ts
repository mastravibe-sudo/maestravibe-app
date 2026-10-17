// app/api/supplier/cnic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';
import { verifyCnicWithAI } from '@/lib/cnic-verify';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BUCKET = 'cnic-private';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel request body limit is ~4.5 MB (the form shrinks photos first)
const TARGET_BYTES = 200 * 1024; // 200 KB
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];

async function compressUnder200KB(input: Buffer) {
  const base = sharp(input).rotate(); // auto-orient; metadata (EXIF/GPS) is stripped by default
  for (const width of [1600, 1400, 1200, 1000, 850, 700]) {
    for (const quality of [80, 70, 60, 50, 40, 32]) {
      const { data, info } = await base
        .clone()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      if (data.length <= TARGET_BYTES) return { data, width: info.width, height: info.height };
    }
  }
  throw new Error('Could not shrink the image below 200 KB. Please retake a clearer, closer photo.');
}

// GET: upload status of the logged-in supplier's CNIC slots (never returns image URLs)
export async function GET() {
  const session = await getSession();
  if (session?.role !== 'supplier') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('supplier_documents')
    .select('kind,status,size_bytes,review_note,updated_at')
    .eq('supplier_id', String(session.id));
  return NextResponse.json({ documents: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== 'supplier') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const side = String(form.get('side') ?? '');
    const file = form.get('file');
    if (side !== 'front' && side !== 'back') return NextResponse.json({ message: 'Invalid CNIC side' }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ message: 'No image received' }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES)
      return NextResponse.json({ message: 'Image is too large. Please choose a smaller photo.' }, { status: 413 });

    const raw = Buffer.from(await file.arrayBuffer());

    // 1) Must be a real JPG / PNG / WEBP (checked from the file bytes, not the file name)
    let meta;
    try {
      meta = await sharp(raw).metadata();
    } catch {
      return NextResponse.json({ message: 'This file is not a valid image. Upload a JPG, PNG or WEBP photo of your CNIC.' }, { status: 415 });
    }
    if (!meta.format || !ALLOWED_FORMATS.includes(meta.format))
      return NextResponse.json({ message: 'Only JPG, PNG or WEBP images are accepted.' }, { status: 415 });

    // 2) Shape check: a CNIC photo is a landscape card, not a selfie, logo or portrait picture
    let w = meta.width ?? 0;
    let h = meta.height ?? 0;
    if ((meta.orientation ?? 1) >= 5) [w, h] = [h, w];
    const ratio = h ? w / h : 0;
    if (Math.min(w, h) < 300 || ratio < 1.25 || ratio > 2.2)
      return NextResponse.json(
        { message: 'This does not look like a CNIC card photo. Place the card flat, landscape, and photograph the whole card clearly.' },
        { status: 422 }
      );

    // 3) Auto-compress to 200 KB or less
    const out = await compressUnder200KB(raw);

    // 4) Optional AI check (off by default); manual admin approval always follows
    const ai = await verifyCnicWithAI(out.data);
    if (ai.checked && !ai.ok)
      return NextResponse.json({ message: 'This image does not appear to be a CNIC. Only CNIC images are accepted.' }, { status: 422 });

    // 5) Store in the PRIVATE bucket (never a public URL)
    const supabase = createAdminClient();
    const path = `${session.id}/cnic-${side}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, out.data, { contentType: 'image/jpeg', upsert: true, cacheControl: '0' });
    if (upErr) {
      console.error('cnic upload failed', upErr);
      return NextResponse.json({ message: 'Could not save the image. Please try again.' }, { status: 500 });
    }

    const { error: dbErr } = await supabase.from('supplier_documents').upsert(
      {
        supplier_id: String(session.id),
        kind: `cnic_${side}`,
        storage_path: path,
        size_bytes: out.data.length,
        width: out.width,
        height: out.height,
        ai_checked: ai.checked,
        status: 'pending',
        review_note: null,
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'supplier_id,kind' }
    );
    if (dbErr) {
      console.error('cnic record failed', dbErr);
      return NextResponse.json({ message: 'Could not save the record. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sizeKB: Math.round(out.data.length / 1024), status: 'pending' });
  } catch (e) {
    console.error('cnic route error', e);
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}