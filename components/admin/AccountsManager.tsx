// components/admin/AccountsManager.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

type Account = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'reseller';
  status: 'pending' | 'approved' | 'suspended';
  phone?: string;
  address?: string;
  website?: string;
  bank_type?: string;
  bank_name?: string;
  bank_account_title?: string;
  bank_account_number?: string;
  created_at: string;
  warning_count?: number;
};

type Warning = {
  id: string;
  message: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700 border border-amber-200',
  approved:  'bg-green-100 text-green-700 border border-green-200',
  suspended: 'bg-red-100 text-red-700 border border-red-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AccountsManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'reseller'>('all');
  const [detailAccount, setDetailAccount] = useState<Account | null>(null);
  const [warningTarget, setWarningTarget] = useState<Account | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [sendingWarning, setSendingWarning] = useState(false);
  const [warningResult, setWarningResult] = useState('');
  const [warningHistory, setWarningHistory] = useState<Warning[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminFetch('/api/accounts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load accounts');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const updateStatus = async (id: string, status: Account['status']) => {
    try {
      const res = await adminFetch(`/api/accounts/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Update failed'); }
      fetchAccounts();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Update failed'); }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Delete this account permanently?')) return;
    try {
      const res = await adminFetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchAccounts();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const openWarningModal = async (account: Account) => {
    setWarningTarget(account);
    setWarningMessage('');
    setWarningResult('');
    setHistoryLoading(true);
    try {
      const res = await adminFetch(`/api/accounts/${account.id}/warn`);
      const data = await res.json();
      setWarningHistory(Array.isArray(data) ? data : []);
    } catch {
      setWarningHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendWarning = async () => {
    if (!warningTarget || !warningMessage.trim()) return;
    setSendingWarning(true);
    setWarningResult('');
    try {
      const res = await adminFetch(`/api/accounts/${warningTarget.id}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: warningMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to send warning');
      setWarningResult('Warning sent successfully!');
      setWarningMessage('');
      fetchAccounts();
      // refresh history
      const histRes = await adminFetch(`/api/accounts/${warningTarget.id}/warn`);
      const histData = await histRes.json();
      setWarningHistory(Array.isArray(histData) ? histData : []);
    } catch (err: unknown) {
      setWarningResult(err instanceof Error ? err.message : 'Failed to send warning');
    } finally {
      setSendingWarning(false);
    }
  };

  const filtered = roleFilter === 'all' ? accounts : accounts.filter(a => a.role === roleFilter);
  const pendingCount = accounts.filter(a => a.status === 'pending').length;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          {(['all', 'customer', 'reseller'] as const).map(f => (
            <button key={f} onClick={() => setRoleFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${roleFilter === f ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'all' ? `All (${accounts.length})` : `${f}s (${accounts.filter(a => a.role === f).length})`}
            </button>
          ))}
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-sm font-medium mt-3">Loading...</p>
        </div>
      )}

      {error && (
        <div className="p-5 text-red-600 bg-red-50 border-b border-red-100 text-sm font-medium">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-100 sticky top-0 z-10">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Warnings', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400"><p className="font-semibold">No accounts found</p></td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-gray-800">
                    <button onClick={() => setDetailAccount(a)} className="hover:text-violet-600 hover:underline text-left">
                      {a.name}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{a.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${a.role === 'reseller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3.5">
                    {(a.warning_count ?? 0) > 0 ? (
                      <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                        ⚠ {a.warning_count}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmt(a.created_at)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {a.status !== 'approved' && (
                        <button onClick={() => updateStatus(a.id, 'approved')}
                          className="text-green-700 text-xs font-semibold bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                          Approve
                        </button>
                      )}
                      {a.status !== 'suspended' && (
                        <button onClick={() => updateStatus(a.id, 'suspended')}
                          className="text-red-600 text-xs font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                          Suspend
                        </button>
                      )}
                      {a.status === 'suspended' && (
                        <button onClick={() => updateStatus(a.id, 'approved')}
                          className="text-blue-600 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                          Reinstate
                        </button>
                      )}
                      <button onClick={() => openWarningModal(a)}
                        className="text-orange-600 text-xs font-semibold bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                        Warn
                      </button>
                      <button onClick={() => deleteAccount(a.id)}
                        className="text-gray-500 text-xs font-semibold bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal for reseller bank info etc */}
      {detailAccount && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setDetailAccount(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-3">
              <h2 className="text-lg font-black text-gray-900">{detailAccount.name}</h2>
              <StatusBadge status={detailAccount.status} />
              <div className="text-sm space-y-1.5 pt-2">
                <p><span className="text-gray-500">Email:</span> {detailAccount.email}</p>
                <p><span className="text-gray-500">Phone:</span> {detailAccount.phone || '—'}</p>
                <p><span className="text-gray-500">Address:</span> {detailAccount.address || '—'}</p>
                {detailAccount.website && <p><span className="text-gray-500">Website:</span> {detailAccount.website}</p>}
                {detailAccount.role === 'reseller' && (
                  <>
                    <p className="text-xs font-bold text-violet-600 pt-2">Bank Details</p>
                    <p><span className="text-gray-500">Type:</span> {detailAccount.bank_type || '—'}</p>
                    <p><span className="text-gray-500">Bank:</span> {detailAccount.bank_name || '—'}</p>
                    <p><span className="text-gray-500">Title:</span> {detailAccount.bank_account_title || '—'}</p>
                    <p><span className="text-gray-500">Account #:</span> {detailAccount.bank_account_number || '—'}</p>
                  </>
                )}
              </div>
              <button onClick={() => setDetailAccount(null)}
                className="w-full mt-3 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Warning modal */}
      {warningTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setWarningTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <h2 className="text-lg font-black text-gray-900">Send Warning</h2>
                <p className="text-xs text-gray-400">To: {warningTarget.name} ({warningTarget.email})</p>
              </div>

              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                rows={4}
                placeholder="Type the warning message that will be emailed to this account..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500"
              />

              {warningResult && (
                <p className={`text-sm ${warningResult.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {warningResult}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setWarningTarget(null)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Close
                </button>
                <button onClick={sendWarning} disabled={sendingWarning || !warningMessage.trim()}
                  className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-60">
                  {sendingWarning ? 'Sending...' : 'Send Warning'}
                </button>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Warning History</p>
                {historyLoading ? (
                  <p className="text-xs text-gray-400">Loading...</p>
                ) : warningHistory.length === 0 ? (
                  <p className="text-xs text-gray-300">No previous warnings</p>
                ) : (
                  <div className="space-y-2">
                    {warningHistory.map(w => (
                      <div key={w.id} className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs">
                        <p className="text-gray-700">{w.message}</p>
                        <p className="text-gray-400 mt-1">{fmt(w.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}