'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Submission } from '@/lib/supabase';
import { StatusBadge, SpinnerIcon } from './shared';

export default function SubmissionsManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error loading data');
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const updateSubmissionStatus = async (id: string, status: Submission['status']) => {
    try {
      await fetch('/api/submissions', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchSubmissions();
    } catch { alert('Failed to update status'); }
  };

  const types = ['all', ...Array.from(new Set(submissions.map(s => s.type)))];
  const filtered = typeFilter === 'all' ? submissions : submissions.filter(s => s.type === typeFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Submissions</h1>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${typeFilter === t ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}>
            {t === 'all' ? `All (${submissions.length})` : `${t} (${submissions.filter(s => s.type === t).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <SpinnerIcon /><p className="text-sm font-medium mt-3">Loading...</p>
          </div>
        )}
        {error && <div className="p-5 text-red-600 bg-red-50 border-b border-red-100 text-sm font-medium">Error: {error}</div>}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-100 sticky top-0 z-10">
              <tr>{['Name', 'Email', 'Type', 'Subject', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400"><p className="font-semibold">No submissions yet</p></td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-gray-800">{s.name}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{s.email}</td>
                  <td className="px-4 py-3.5"><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{s.type}</span></td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs max-w-xs"><p className="truncate">{s.subject || '—'}</p></td>
                  <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 flex gap-2">
                    {s.status === 'new' && (
                      <button onClick={() => updateSubmissionStatus(s.id, 'read')}
                        className="text-blue-600 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition">
                        Mark Read
                      </button>
                    )}
                    {s.status === 'read' && (
                      <button onClick={() => updateSubmissionStatus(s.id, 'replied')}
                        className="text-violet-600 text-xs font-semibold bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition">
                        Mark Replied
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}