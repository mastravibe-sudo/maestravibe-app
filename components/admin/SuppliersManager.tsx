// components/admin/SuppliersManager.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

type Account = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  website?: string;
  status: 'pending' | 'approved' | 'suspended';
  cnic_image_url?: string;
  bank_type: string;
  bank_name: string;
  bank_account_title: string;
  bank_account_number: string;
  created_at: string;
  warning_count?: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  approval_status: 'pending' | 'approved' | 'rejected';
  supplier_id: string;
};

function Ico({ d, cls = 'w-5 h-5' }: { d: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
const CheckIco = () => <Ico cls="w-4 h-4" d="M5 13l4 4L19 7" />;
const XIco      = () => <Ico cls="w-4 h-4" d="M6 18L18 6M6 6l12 12" />;
const TrashIco  = () => <Ico cls="w-4 h-4" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;
const ChevronIco = ({ open }: { open: boolean }) => (
  <Ico cls={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} d="M19 9l-7 7-7-7" />
);
const IdIco = () => <Ico cls="w-8 h-8" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z M7 11h.01M7 15h6M15 11h2" />;

function StatusBadge({ status }: { status: Account['status'] }) {
  const map = {
    approved:  'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function ProductStatusBadge({ status }: { status: Product['approval_status'] }) {
  const map = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

export default function SuppliersManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'suspended' | 'all'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cnicModal, setCnicModal] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [accRes, prodRes] = await Promise.all([
        adminFetch('/api/accounts'),
        // NOTE: assumes /api/products supports ?all=1 for admin visibility into
        // pending items, per the convention established earlier in this project.
        // If it doesn't, supplier product counts/lists below will just show empty.
        adminFetch('/api/products?all=1').catch(() => null),
      ]);
      const accData = await accRes.json();
      if (!accRes.ok) throw new Error(accData.message ?? 'Failed to load accounts');
      setAccounts(Array.isArray(accData) ? accData.filter((a: Account) => a.role === 'supplier') : []);

      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load suppliers');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const productsBySupplier = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const p of products) {
      if (!p.supplier_id) continue;
      (map[p.supplier_id] ??= []).push(p);
    }
    return map;
  }, [products]);

  const countsFor = (supplierId: string) => {
    const list = productsBySupplier[supplierId] ?? [];
    return {
      pending:  list.filter(p => p.approval_status === 'pending').length,
      approved: list.filter(p => p.approval_status === 'approved').length,
      rejected: list.filter(p => p.approval_status === 'rejected').length,
    };
  };

  const setAccountStatus = async (id: string, status: 'approved' | 'suspended' | 'pending') => {
    setActioningId(id);
    try {
      const res = await adminFetch(`/api/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Update failed'); }
      // The backend PATCH has side effects beyond the account's own `status`
      // field (e.g. approving a supplier auto-approves their pending products,
      // suspending a supplier reverts their products to pending). Reload both
      // accounts and products from the server so the UI reflects the true
      // state instead of drifting from a partial local patch.
      await load();
    } catch (err: any) {
      alert(err.message ?? 'Update failed');
    } finally { setActioningId(null); }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm('Delete this supplier account? This cannot be undone.')) return;
    try {
      const res = await adminFetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      // Deletion also cascades to the supplier's products server-side, so
      // reload from the server to keep both lists in sync.
      await load();
    } catch (err: any) {
      alert(err.message ?? 'Delete failed');
    }
  };

  const filtered = filter === 'all' ? accounts : accounts.filter(a => a.status === filter);
  const counts = {
    all: accounts.length,
    pending: accounts.filter(a => a.status === 'pending').length,
    approved: accounts.filter(a => a.status === 'approved').length,
    suspended: accounts.filter(a => a.status === 'suspended').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review supplier applications, CNIC verification, and their submitted products.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['pending', 'approved', 'suspended', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              filter === f ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {f} <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-center py-16">Loading suppliers...</p>}
      {error && <div className="p-4 text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm font-medium mb-4">Error: {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 text-center py-16 text-gray-400">
          No {filter !== 'all' ? filter : ''} suppliers found.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(s => {
          const isExpanded = expandedId === s.id;
          const productList = productsBySupplier[s.id] ?? [];
          const c = countsFor(s.id);
          return (
            <div key={s.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <div className="p-4 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => s.cnic_image_url && setCnicModal(s.cnic_image_url)}
                  className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center text-gray-300 hover:border-violet-300 transition-colors"
                  title={s.cnic_image_url ? 'View CNIC' : 'No CNIC uploaded'}
                >
                  {s.cnic_image_url ? <img src={s.cnic_image_url} alt="CNIC" className="w-full h-full object-cover" /> : <IdIco />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{s.name}</p>
                    <StatusBadge status={s.status} />
                    {!s.cnic_image_url && <span className="text-xs font-semibold text-red-500">No CNIC</span>}
                    {!!s.warning_count && <span className="text-xs font-semibold text-orange-500">{s.warning_count} warning{s.warning_count !== 1 ? 's' : ''}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.email} · {s.phone}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{s.address}{s.website ? ` · ${s.website}` : ''}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-amber-600 font-semibold">{c.pending} pending</span>
                    <span className="text-green-600 font-semibold">{c.approved} approved</span>
                    <span className="text-red-500 font-semibold">{c.rejected} rejected</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-2">
                    {s.status !== 'approved' && (
                      <button onClick={() => setAccountStatus(s.id, 'approved')} disabled={actioningId === s.id}
                        className="flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg disabled:opacity-50">
                        <CheckIco /> Approve
                      </button>
                    )}
                    {s.status !== 'suspended' && (
                      <button onClick={() => setAccountStatus(s.id, 'suspended')} disabled={actioningId === s.id}
                        className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg disabled:opacity-50">
                        <XIco /> Suspend
                      </button>
                    )}
                    <button onClick={() => deleteSupplier(s.id)}
                      className="flex items-center gap-1 text-xs font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg">
                      <TrashIco />
                    </button>
                  </div>
                  <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline">
                    Products <ChevronIco open={isExpanded} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t-2 border-gray-50 bg-gray-50/50 p-4">
                  {productList.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No products submitted yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {productList.map(p => (
                        <div key={p.id} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
                          {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-24 object-cover" />}
                          <div className="p-2.5">
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <p className="text-xs font-semibold text-gray-800 truncate flex-1">{p.name}</p>
                              <ProductStatusBadge status={p.approval_status} />
                            </div>
                            <p className="text-xs font-bold text-violet-700">Rs. {Number(p.price).toLocaleString()}</p>
                            {p.approval_status === 'pending' && (
                              <p className="text-[11px] text-gray-400 mt-2">Approve/reject in Product Approvals →</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cnicModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setCnicModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-3 max-w-lg w-full">
              <img src={cnicModal} alt="CNIC full view" className="w-full rounded-xl" />
              <button onClick={() => setCnicModal(null)}
                className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl">Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}