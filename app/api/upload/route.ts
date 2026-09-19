import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/auth';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId) throw new Error('R2_ACCOUNT_ID is missing');
  if (!accessKeyId) throw new Error('R2_ACCESS_KEY_ID is missing');
  if (!secretAccessKey) throw new Error('R2_SECRET_ACCESS_KEY is missing');

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const ext = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;

  const safe =
    base
      .replace(/[^\x00-\x7F]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'image';

  return `${safe}${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const r2 = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!bucketName) throw new Error('R2_BUCKET_NAME is missing');
    if (!publicUrl) throw new Error('R2_PUBLIC_URL is missing');

    const rawFileName = req.headers.get('x-file-name') || `image_${Date.now()}.jpg`;
    const fileType = req.headers.get('x-file-type') || 'image/jpeg';

    const cleanName = sanitizeFileName(rawFileName);
    const uniqueName = `images/${Date.now()}_${cleanName}`;

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueName,
        Body: buffer,
        ContentType: fileType,
      })
    );

    const url = `${publicUrl}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (err) {
    console.error('Upload Error:', err);

    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}