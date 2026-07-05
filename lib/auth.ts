// lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}