// app/admin/page.tsx
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.email !== process.env.ADMIN_EMAIL) redirect('/login');

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: accounts } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts?.map((acc) => (
            <tr key={acc.id} className="border-b">
              <td className="p-2">{acc.name}</td>
              <td className="p-2">{acc.email}</td>
              <td className="p-2">{acc.role}</td>
              <td className="p-2">{acc.status}</td>
              <td className="p-2 space-x-2">
                <form action="/api/admin/update-status" method="POST" className="inline">
                  {/* Better: use client component with fetch() for real interactivity */}
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}