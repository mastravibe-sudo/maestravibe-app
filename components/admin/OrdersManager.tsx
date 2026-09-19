// components/admin/OrdersManager.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import type { Order } from '@/lib/supabase';
import { getOrderVerification, type OrderMarket } from '@/lib/order-validation';
import { StatusBadge, SpinnerIcon, CloseIcon, TrashIcon, fmt } from './shared';

const ORDER_STATUSES = ['pending_verification', 'new', 'accepted', 'pending', 'completed', 'delivered'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];
type OrderFilter = 'all' | OrderStatus;

type ResellerInfo = { id: string; name: string; email?: string; phone?: string };

function OrderDetailModal({
  order, resellerInfo, onClose, onSubmitCJ, cjSubmitting, cjResult, onMarkProfitPaid, markingPaid, onVerifyPhone, onReviewCity, onAccept,
}: {
  order: Order;
  resellerInfo?: ResellerInfo;
  onClose: () => void;
  onSubmitCJ: (id: string) => void;
  cjSubmitting: boolean;
  cjResult: string;
  onMarkProfitPaid: (id: string) => void;
  markingPaid: boolean;
  onVerifyPhone: (id: string) => void;
  onReviewCity: (id: string) => void;
  onAccept: (id: string) => void;
}) {
  // ✅ NEW: pull the extra delivery fields the checkout flow now sends.
  // Cast with `as any` (matching the file's existing pattern for fields not
  // yet in the shared Order type) so this works even before lib/supabase's
  // Order/CustomerInfo types are updated.
  const customer = order.customer as any;
  const locationLink: string | undefined = customer?.locationLink;
  const district: string | undefined = customer?.district;
  const area: string | undefined = customer?.area;
  const block: string | undefined = customer?.block;
  const market: OrderMarket = (order as any).market === 'us' ? 'us' : 'pk';
  const verification = getOrderVerification(customer, market);

  // NOTE: adjust these two keys if your /api/orders POST handler saved them
  // under different column names — this reads either `subtotal`/`delivery_charge`
  // (typical snake_case DB column) or `deliveryCharge` (camelCase), whichever exists.
  const subtotal = (order as any).subtotal;
  const deliveryCharge = (order as any).delivery_charge ?? (order as any).deliveryCharge;
  const hasBreakdown = subtotal != null && deliveryCharge != null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
        <div className="bg-white rounded-none md:rounded-3xl shadow-2xl w-full max-w-lg h-full md:h-auto max-h-full md:max-h-[92vh] overflow-y-auto border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
            <div>
              <h2 className="text-lg font-black text-gray-900">Order Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">{fmt(order.created_at)}</p>
            </div>
            <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500"><CloseIcon /></button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={order.status} />
              {(order as any).cj_status && (order as any).cj_status !== 'not_submitted' && (
                <StatusBadge status={(order as any).cj_status} />
              )}
              <span className="text-xs text-gray-400 ml-auto font-mono">#{order.id?.slice(0, 8)}</span>
            </div>

            {(order as any).reseller_id && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 space-y-2">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Reseller Info</p>
                <div className="text-sm text-blue-900">
                  <p><span className="text-blue-500 font-medium">Name:</span> {resellerInfo?.name || 'Unknown'}</p>
                  {resellerInfo?.phone && <p><span className="text-blue-500 font-medium">Phone:</span> {resellerInfo.phone}</p>}
                  {resellerInfo?.email && <p><span className="text-blue-500 font-medium">Email:</span> {resellerInfo.email}</p>}
                  <p className="mt-1"><span className="text-blue-500 font-medium">Profit:</span> <span className="font-bold">Rs. {Number((order as any).reseller_profit ?? 0).toLocaleString()}</span></p>
                </div>

                <div className="pt-2 border-t border-blue-100 mt-2">
                  {(order as any).profit_paid ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">✓ Profit Paid</span>
                      {(order as any).profit_paid_at && (
                        <span className="text-xs text-gray-400">{fmt((order as any).profit_paid_at)}</span>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => onMarkProfitPaid(order.id)} disabled={markingPaid}
                      className="w-full bg-green-600 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-60">
                      {markingPaid ? 'Marking...' : 'Mark Profit as Paid'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-violet-50 rounded-2xl p-4 space-y-2 border border-violet-100">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-3">Customer Info</p>
              {[
                { label: 'Name',     value: order.customer?.name },
                { label: 'Phone',    value: order.customer?.phone },
                { label: 'Email',    value: order.customer?.email },
                { label: 'City',     value: order.customer?.city },
                { label: 'District', value: district },       // ✅ NEW
                { label: 'Area',     value: area },            // ✅ NEW
                { label: 'Block',    value: block },           // ✅ NEW
                { label: 'Address',  value: order.customer?.address },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex gap-2 text-sm">
                  <span className="text-gray-500 w-16 shrink-0 font-medium">{f.label}:</span>
                  <span className="text-gray-800">{f.value}</span>
                </div>
              ))}

              {/* ✅ NEW: live GPS pin the customer confirmed at checkout —
                  hand this straight to the rider/HHC for exact drop-off. */}
              {locationLink ? (
                <a
                  href={locationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full transition"
                >
                  📍 View Live Delivery Location on Map
                </a>
              ) : (
                <p className="text-xs text-gray-400 mt-1">No live location pin — customer entered address manually.</p>
              )}
            </div>

            <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-amber-800">Verification checklist</p>
                <p className="text-xs text-amber-700 mt-1">Address, confirmed phone, and city review are required before acceptance.</p>
              </div>
              {Object.entries(verification.checks).map(([key, check]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <span className={check.pass ? 'text-green-600 font-black' : 'text-red-600 font-black'}>{check.pass ? 'PASS' : 'FAIL'}</span>
                  <div><span className="font-semibold capitalize text-gray-800">{key}</span><p className="text-xs text-gray-600">{check.reason}</p></div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => onVerifyPhone(order.id)} disabled={verification.checks.phone.pass || !!verification.fieldErrors.phone}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  {verification.checks.phone.pass ? 'Phone Verified' : 'Mark Phone Verified'}
                </button>
                {verification.requiresCityReview && (
                  <button type="button" onClick={() => onReviewCity(order.id)} disabled={verification.checks.city.pass || !!verification.fieldErrors.city}
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                    {verification.checks.city.pass ? 'City Reviewed' : 'Mark City Reviewed'}
                  </button>
                )}
                <button type="button" onClick={() => onAccept(order.id)} disabled={!verification.allPass || order.status === 'accepted'}
                  className="px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  {order.status === 'accepted' ? 'Accepted' : 'Accept Order'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items ({order.items?.length})</p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border-2 border-gray-100 rounded-2xl p-3">
                    {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedColor && item.selectedSize && ' · '}
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-violet-700">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ NEW: subtotal + delivery charge breakdown, when the order has it —
                falls back to the old plain "Total Amount" card for older orders
                that were placed before this field existed. */}
            {hasBreakdown ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charges</span>
                  <span>{Number(deliveryCharge) === 0 ? 'FREE' : `Rs. ${Number(deliveryCharge).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-green-200">
                  <span className="font-bold text-gray-700">Total Amount</span>
                  <span className="text-2xl font-black text-green-700">Rs. {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                <span className="font-bold text-gray-700">Total Amount</span>
                <span className="text-2xl font-black text-green-700">Rs. {Number(order.total).toLocaleString()}</span>
              </div>
            )}

            <div className="border-2 border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-sm font-bold text-blue-700 mb-2">CJ Dropshipping Fulfillment</p>
              {(order as any).cj_order_id ? (
                <p className="text-xs text-blue-600">Already submitted — CJ Order ID: {(order as any).cj_order_id}</p>
              ) : (
                <button onClick={() => onSubmitCJ(order.id)} disabled={cjSubmitting}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                  {cjSubmitting ? 'Submitting...' : 'Submit Order to CJ Dropshipping'}
                </button>
              )}
              {cjResult && <p className="text-xs mt-2 text-blue-700">{cjResult}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [resellers, setResellers] = useState<Record<string, ResellerInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [viewOrder, setViewOrder] = useState<Order | undefined>();
  const [cjSubmitting, setCjSubmitting] = useState(false);
  const [cjResult, setCjResult] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminFetch('/api/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error loading data');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  const fetchResellers = useCallback(async () => {
    try {
      const res = await adminFetch('/api/accounts');
      const data = await res.json();
      if (Array.isArray(data)) {
        const map: Record<string, ResellerInfo> = {};
        data.filter((a: any) => a.role === 'reseller').forEach((a: any) => {
          map[a.id] = { id: a.id, name: a.name, email: a.email, phone: a.phone };
        });
        setResellers(map);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchOrders(); fetchResellers(); }, [fetchOrders, fetchResellers]);

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await adminFetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Delete failed'); }
      fetchOrders();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await adminFetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (!res.ok) {
        const checks = data.verification ? Object.entries(data.verification).filter(([, check]: any) => !check.pass).map(([key, check]: any) => `${key}: ${check.reason}`).join(' ') : '';
        throw new Error(checks || data.message || 'Failed to update status');
      }
      await fetchOrders();
      if (status === 'accepted') setViewOrder(undefined);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Failed to update status'); }
  };

  const markProfitPaid = async (id: string) => {
    setMarkingPaid(true);
    try {
      const res = await adminFetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profit_paid: true, profit_paid_at: new Date().toISOString() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Failed to update'); }
      await fetchOrders();
      // keep modal in sync with latest data
      setViewOrder(prev => prev ? { ...prev, profit_paid: true, profit_paid_at: new Date().toISOString() } as any : prev);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally { setMarkingPaid(false); }
  };

  const updateVerification = async (id: string, patch: { phone_verified?: boolean; city_reviewed?: boolean }) => {
    try {
      const res = await adminFetch(`/api/orders/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Verification update failed');
      setViewOrder(data);
      await fetchOrders();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verification update failed');
    }
  };

  const submitToCJ = async (orderId: string) => {
    setCjSubmitting(true); setCjResult('');
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/submit-to-cj`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to submit to CJ');
      setCjResult('Successfully submitted to CJ Dropshipping!');
      fetchOrders();
    } catch (err: unknown) {
      setCjResult(err instanceof Error ? err.message : 'Failed to submit');
    } finally { setCjSubmitting(false); }
  };

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const orderFilterCounts = ORDER_STATUSES.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc; }, {} as Record<string, number>);

  return (
    <div>
      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          resellerInfo={(viewOrder as any).reseller_id ? resellers[(viewOrder as any).reseller_id] : undefined}
          onClose={() => { setViewOrder(undefined); setCjResult(''); }}
          onSubmitCJ={submitToCJ} cjSubmitting={cjSubmitting} cjResult={cjResult}
          onMarkProfitPaid={markProfitPaid} markingPaid={markingPaid}
          onVerifyPhone={id => updateVerification(id, { phone_verified: true })}
          onReviewCity={id => updateVerification(id, { city_reviewed: true })}
          onAccept={id => updateOrderStatus(id, 'accepted')}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-900">Orders</h1>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {(['all', ...ORDER_STATUSES] as const).map(f => (
          <button key={f} onClick={() => setOrderFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${orderFilter === f ? 'bg-gray-900 text-white' : 'bg-white border-2 border-gray-200 text-gray-600'}`}>
            {f === 'all' ? `All (${orders.length})` : `${f} (${orderFilterCounts[f] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {loading && <div className="flex flex-col items-center justify-center py-20 text-gray-400"><SpinnerIcon /><p className="text-sm font-medium mt-3">Loading...</p></div>}
        {error && <div className="p-5 text-red-600 bg-red-50 border-b border-red-100 text-sm font-medium">Error: {error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-100 sticky top-0 z-10">
                <tr>
                  {['Customer ID','Customer','Total','Reseller','Profit Status','CJ Status','Date','Status','Update','Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-16 text-gray-400">No orders</td></tr>
                ) : filteredOrders.map(o => {
                  const rid = (o as any).reseller_id;
                  const rInfo = rid ? resellers[rid] : undefined;
                  return (
                    <tr key={o.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="px-3 py-3.5 font-mono text-gray-700 whitespace-nowrap">#{o.id?.slice(0, 8)}</td>
                      <td className="px-3 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {o.customer?.name}
                          {(o.customer as any)?.locationLink && (
                            <a
                              href={(o.customer as any).locationLink}
                              target="_blank"
                              rel="noreferrer"
                              title="View live delivery location"
                              onClick={e => e.stopPropagation()}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              📍
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 font-bold text-violet-700 whitespace-nowrap">Rs. {Number(o.total).toLocaleString()}</td>
                      <td className="px-3 py-3.5">
                        {rid
                          ? <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">{rInfo?.name ?? 'Unknown'} · Rs. {Number((o as any).reseller_profit ?? 0).toLocaleString()}</span>
                          : <span className="text-xs text-gray-300">Direct</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        {rid ? (
                          (o as any).profit_paid
                            ? <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">Paid</span>
                            : <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">Pending</span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-3.5"><StatusBadge status={(o as any).cj_status ?? 'not_submitted'} /></td>
                      <td className="px-3 py-3.5 text-gray-400 text-xs whitespace-nowrap">{fmt(o.created_at)}</td>
                      <td className="px-3 py-3.5"><StatusBadge status={o.status} /></td>
                      <td className="px-3 py-3.5">
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="text-xs border-2 border-gray-200 rounded-xl px-2 py-1.5 text-gray-800 bg-white font-medium">
                          {ORDER_STATUSES.map(s => <option key={s} value={s} disabled={s === 'accepted' && !getOrderVerification(o.customer as any, (o as any).market === 'us' ? 'us' : 'pk').allPass}>{s.charAt(0).toUpperCase()+s.slice(1).replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => setViewOrder(o)} className="text-blue-600 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">Details</button>
                          <button onClick={() => deleteItem(o.id)} className="text-red-500 text-xs font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}