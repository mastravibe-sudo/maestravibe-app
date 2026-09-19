// lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type Session = {
  id: string;
  email: string;
  role: 'admin' | 'supplier' | string;
};

const SESSION_COOKIE_NAME = 'session';

/**
 * The single, canonical way to read the current session anywhere in the
 * app — API routes, Server Components, Server Actions. Every protected
 * route must import THIS function. Do not re-implement session reading
 * locally in a route file — that's exactly what caused the 401 bug
 * (a second, drifted copy of this logic living inside
 * app/api/products/route.ts read cookies independently and could fall out
 * of sync with this one).
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[auth] No "${SESSION_COOKIE_NAME}" cookie present on this request.`);
    }
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as Session;
    return payload;
  } catch (err: any) {
    // Logging the *reason* verification failed (expired vs bad signature vs
    // malformed) is what actually lets you diagnose 401s instead of guessing.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[auth] JWT verification failed: ${err?.name ?? 'Error'} — ${err?.message ?? 'unknown'}`);
    }
    return null;
  }
}

/** Throws-free helper: true only if there's a valid session with role 'admin'. */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'admin';
}

/** Return the authenticated admin session, or null for every other request. */
export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === 'admin' ? session : null;
}

/** Return the authenticated reseller session, or null for every other request. */
export async function requireReseller(): Promise<Session | null> {
  const session = await getSession();
  return session?.role === 'reseller' ? session : null;
}

/** Throws-free helper: true only if there's a valid session with role 'supplier'. */
export async function isSupplier(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'supplier';
}

export { SESSION_COOKIE_NAME };