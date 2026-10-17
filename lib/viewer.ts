// lib/viewer.ts
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export type Viewer = { key: string; isNew: boolean; vid?: string; userId?: string };

/** Logged-in users are keyed by account id, guests by a random device cookie. */
export async function getViewer(): Promise<Viewer> {
  const session = await getSession().catch(() => null);
  if (session?.id) return { key: `u:${session.id}`, isNew: false, userId: String(session.id) };

  const jar = await cookies();
  const existing = jar.get('mv_vid')?.value;
  if (existing && /^[a-f0-9-]{36}$/.test(existing)) return { key: `v:${existing}`, isNew: false };

  const vid = crypto.randomUUID();
  return { key: `v:${vid}`, isNew: true, vid };
}

export function applyViewerCookie<T>(res: NextResponse<T>, viewer: Viewer): NextResponse<T> {
  if (viewer.isNew && viewer.vid) {
    res.cookies.set('mv_vid', viewer.vid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  return res;
}