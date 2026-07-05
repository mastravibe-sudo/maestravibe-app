'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Subscriber } from '@/lib/supabase';
import { SpinnerIcon, TrashIcon, EmailIcon, CloseIcon } from './shared';

// ── Bulk Email Modal ──
function BulkEmailModal({ subscribers, onClose }: { subscribers: Subscriber[]; onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;
    setSending(true);
    try {
      const res = await fetch('/api/email/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, emails: subscribers.map(s => s.email) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? 'Send failed');
      setResult(`Sent to ${d.sent} subscribers successfully!`);
    } catch (err: unknown) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Send failed'}`);
    } finally { setSending(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
            <div>
              <h2 className="text-lg font-black text-gray-900">Send Bulk Email</h2>
              <p className="text-xs text-gray-400 mt-0.5">Will be sent to {subscribers.length} subscribers</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><CloseIcon /></button>
          </div>
          <form onSubmit={send} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject <span className="text-red-400">*</span></label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required
                placeholder="e.g. New Arrivals — Summer Collection"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={8}
                placeholder="Write your message here..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 resize-none" />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 max-h-28 overflow-y-auto border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">Recipients:</p>
              {subscribers.map(s => <p key={s.id} className="text-xs text-gray-600 py-0.5">{s.email}</p>)}
            </div>
            {result && (
              <div className={`text-sm px-4 py-3 rounded-xl border ${result.startsWith('Sent') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{result}</div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={sending}
                className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-2xl text-sm font-bold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-violet-200">
                <EmailIcon />{sending ? 'Sending...' : `Send to All (${subscribers.length})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Main Subscribers Manager ──
export default function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error loading data');
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchSubscribers();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  return (
    <div>
      {showEmailModal && <BulkEmailModal subscribers={subscribers} onClose={() => setShowEmailModal(false)} />}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Subscribers</h1>
        {subscribers.length > 0 && (
          <button onClick={() => setShowEmailModal(true)}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5">
            <EmailIcon /> Bulk Email
          </button>
        )}
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
              <tr>{['#', 'Email', 'Subscribed At', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-gray-400"><p className="font-semibold">No subscribers yet</p></td></tr>
              ) : subscribers.map((s, i) => (
                <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-4 py-3.5 text-gray-400 text-xs font-bold">{i + 1}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">{s.email}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {new Date(s.subscribed_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => deleteItem(s.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                      <TrashIcon /> Remove
                    </button>
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