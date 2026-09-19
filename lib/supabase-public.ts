import { createClient } from '@supabase/supabase-js';

/** Client for public routes. It intentionally uses the publishable anon key. */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}