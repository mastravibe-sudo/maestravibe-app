// app/api/debug/route.ts
// ⚠️ TEMPORARY - Delete this file after fixing the issue
import { NextResponse } from 'next/server';

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pass = process.env.ADMIN_PASSWORD;

  // Test Supabase connection
  let supabaseStatus = 'not tested';
  if (url && anon) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(url, anon);
      const { error } = await sb.from('products').select('id').limit(1);
      supabaseStatus = error ? `ERROR: ${error.message}` : 'OK - connected';
    } catch (e: unknown) {
      supabaseStatus = `CRASH: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL:      url      ? `SET (${url.slice(0, 30)}...)` : 'MISSING ❌',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon     ? 'SET ✅'                       : 'MISSING ❌',
      ADMIN_PASSWORD:                pass     ? 'SET ✅'                       : 'MISSING ❌',
    },
    supabase: supabaseStatus,
    node_env: process.env.NODE_ENV,
  });
}