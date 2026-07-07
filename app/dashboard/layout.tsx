// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // No valid session at all -> straight to login
  if (!session) {
    redirect('/login');
  }

  // Logged in, but not a reseller account -> don't let them see this dashboard
  if (session.role !== 'reseller') {
    redirect('/login');
  }

  return <>{children}</>;
}