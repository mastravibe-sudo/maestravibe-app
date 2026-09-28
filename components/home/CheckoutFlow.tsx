// components/home/CheckoutFlow.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice } from '@/lib/home/helpers';
import type { CustomerInfo, DetectedLocation, MarketConfigEntry } from '@/lib/home/types';
import { PK_CITIES, US_CITIES } from '@/lib/order-validation';
import { BackIco, ChevR, CheckIco, CloseIco, LocIco, SpinIco } from './icons';

interface CheckoutFlowProps {
  checkoutStep: number;
  checkoutItems: any[];
  orderTotal: number;
  deliveryCharge: number; // ✅ NEW
  grandTotal: number;     // ✅ NEW — orderTotal + deliveryCharge
  market: string;
  marketCfg: MarketConfigEntry;
  isPK: boolean;
  customerInfo: CustomerInfo;
  pendingLocation: DetectedLocation | null; // ✅ NEW — awaiting customer confirmation
  locationLoading: boolean;
  orderLoading: boolean;
  onBack: () => void;
  onClose: () => void;
  onContinueToDelivery: () => void;
  onContinueToConfirm: () => void; // ✅ NEW — step 2 -> step 3
  onDetectLocation: () => void;
  onConfirmLocation: () => void;   // ✅ NEW — accept the detected pin
  onDismissLocation: () => void;   // ✅ NEW — discard it, fill manually instead
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onSubmit: (e: React.FormEvent) => void; // now only fires from the final confirm step
}

export default function CheckoutFlow({
  checkoutStep, checkoutItems, orderTotal, deliveryCharge, grandTotal, market, marketCfg, isPK,
  customerInfo, pendingLocation, locationLoading, orderLoading,
  onBack, onClose, onContinueToDelivery, onContinueToConfirm,
  onDetectLocation, onConfirmLocation, onDismissLocation, onCustomerInfoChange, onSubmit,
}: CheckoutFlowProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const inputCls = 'w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-sm transition-colors bg-white';

  const fields = [
    { label: 'Full Name',       key: 'name',     type: 'text',  placeholder: 'Your full name',                                    required: true  },
    { label: 'Phone',           key: 'phone',    type: 'tel',   placeholder: isPK ? '03XX-XXXXXXX' : marketCfg.phone,             required: true  },
    { label: 'Email',           key: 'email',    type: 'email', placeholder: 'email@example.com',                                  required: false },
    { label: 'City',            key: 'city',     type: 'text',  placeholder: isPK ? 'Karachi, Lahore…' : 'Your city',              required: true  },
    { label: 'District',        key: 'district', type: 'text',  placeholder: isPK ? 'e.g. Lahore District' : 'District / county',  required: false },
    { label: 'Area',            key: 'area',     type: 'text',  placeholder: isPK ? 'Gulshan, DHA…' : 'District / suburb',         required: true  },
    { label: 'Block / Sector',  key: 'block',    type: 'text',  placeholder: isPK ? 'e.g. Block C, DHA Phase 5' : 'Apt / unit (optional)', required: false },
  ] as const;

  const stepTitle =
    checkoutStep === 1 ? 'Order Review' : checkoutStep === 2 ? 'Delivery Details' : 'Confirm & Place Order';

  const deliveryLines = [customerInfo.block, customerInfo.area, customerInfo.district, customerInfo.city]
    .filter(Boolean)
    .join(', ');

  if (!portalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center" style={{ zIndex: 1000 }}>
      <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><BackIco /></button>
            <div>
              <h2 className="text-lg font-black">{stepTitle}</h2>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-1.5 w-8 rounded-full bg-violet-600" />
                <div className={`h-1.5 w-8 rounded-full transition-colors ${checkoutStep >= 2 ? 'bg-violet-600' : 'bg-gray-200'}`} />
                <div className={`h-1.5 w-8 rounded-full transition-colors ${checkoutStep >= 3 ? 'bg-violet-600' : 'bg-gray-200'}`} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><CloseIco /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {/* ── STEP 1: Order Review ─────────────────────────────── */}
          {checkoutStep === 1 && (
            <div>
              <div className="space-y-3 mb-5">
                {checkoutItems.map((item, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 rounded-2xl p-4 items-center border border-gray-100">
                    <img src={item.images?.[0]} className="w-16 h-16 object-cover rounded-xl shrink-0" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</p>
                      <p className="font-black text-violet-700 mt-1">{formatPrice(item.price * (item.quantity || 1), market)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-violet-50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-violet-100"><span className="font-bold text-gray-700">Total Amount</span><span className="font-black text-violet-700 text-xl">{formatPrice(orderTotal, market)}</span></div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                {isPK ? <><strong>Cash on Delivery</strong> — Pay when you receive your order. No advance required.</> : <><strong>Secure Payment</strong> — Pay safely online. Currency: {marketCfg.currency}</>}
              </div>
              <button onClick={onContinueToDelivery} className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">Continue to Delivery <ChevR /></button>
            </div>
          )}

          {/* ── STEP 2: Delivery Details ─────────────────────────── */}
          {checkoutStep === 2 && (
            <form onSubmit={e => { e.preventDefault(); onContinueToConfirm(); }}>
              <button type="button" onClick={onDetectLocation} disabled={locationLoading} className="w-full mb-4 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {locationLoading ? <><SpinIco /> Detecting location…</> : <><LocIco /> Auto-detect My Location</>}
              </button>

              {/* ✅ NEW: confirm-before-apply card — nothing gets written into the
                  form until the customer explicitly agrees this is the right spot. */}
              {pendingLocation && (
                <div className="mb-5 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-blue-900 mb-1">📍 Confirm delivery location</p>
                  <p className="text-sm text-blue-800">
                    {pendingLocation.address || [pendingLocation.area, pendingLocation.city].filter(Boolean).join(', ')}
                  </p>
                  <a href={pendingLocation.locationLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline font-semibold">
                    View exact pin on Google Maps
                  </a>
                  <p className="text-xs text-blue-700 mt-2">
                    Your order will be delivered to this location. Please confirm it's correct before continuing.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={onDismissLocation} className="flex-1 py-2.5 rounded-xl border-2 border-blue-200 bg-white text-blue-700 font-semibold text-sm">
                      Edit Manually
                    </button>
                    <button type="button" onClick={onConfirmLocation} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
                      Yes, Deliver Here
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ NEW: once confirmed, show the rider/supplier will get this exact pin */}
              {customerInfo.locationLink && !pendingLocation && (
                <div className="mb-4 flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1"><LocIco /> Live location attached for the rider</span>
                  <a href={customerInfo.locationLink} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold shrink-0">View</a>
                </div>
              )}

              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">{field.label} {field.required && <span className="text-red-400">*</span>}</label>
                    {field.key === 'city' ? (
                      <select required={field.required} className={inputCls} value={(customerInfo as any)[field.key] ?? ''} onChange={e => onCustomerInfoChange({ ...customerInfo, [field.key]: e.target.value })}>
                        <option value="">Select your city</option>
                        {(isPK ? PK_CITIES : US_CITIES).map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={inputCls}
                        value={(customerInfo as any)[field.key] ?? ''}
                        onChange={e => onCustomerInfoChange({ ...customerInfo, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Full Address <span className="text-red-400">*</span></label>
                  <textarea
                    placeholder="House/flat number, street, area, landmark…"
                    required
                    rows={3}
                    className={`${inputCls} resize-none`}
                    value={customerInfo.address}
                    onChange={e => onCustomerInfoChange({ ...customerInfo, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-5 bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({checkoutItems.length} item(s))</span>
                  <span>{formatPrice(orderTotal, market)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge, market)}</span>
                </div>
                <div className="flex justify-between font-black text-violet-700 text-base pt-1.5 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal, market)}</span>
                </div>
              </div>

              <button type="submit" className="mt-4 w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">
                Review Order <ChevR />
              </button>
            </form>
          )}

          {/* ── STEP 3: Confirm & Place Order ────────────────────── */}
          {checkoutStep === 3 && (
            <form onSubmit={onSubmit}>
              <div className="space-y-3 mb-5">
                {checkoutItems.map((item, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 rounded-2xl p-3 items-center border border-gray-100">
                    <img src={item.images?.[0]} className="w-12 h-12 object-cover rounded-lg shrink-0" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs line-clamp-1 text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="font-bold text-violet-700 text-sm shrink-0">{formatPrice(item.price * (item.quantity || 1), market)}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm text-gray-800">Delivery To</p>
                  <button type="button" onClick={onBack} className="text-xs text-violet-600 font-semibold hover:underline">Edit</button>
                </div>
                <p className="text-sm text-gray-700">{customerInfo.name} · {customerInfo.phone}</p>
                <p className="text-sm text-gray-600 mt-1">{customerInfo.address}</p>
                {deliveryLines && <p className="text-sm text-gray-600">{deliveryLines}</p>}
                {customerInfo.locationLink && (
                  <a href={customerInfo.locationLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-700 font-semibold underline">
                    <LocIco /> Live location attached for the rider
                  </a>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-1.5 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(orderTotal, market)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge, market)}</span>
                </div>
                <div className="flex justify-between font-black text-violet-700 text-lg pt-1.5 border-t border-gray-200">
                  <span>Grand Total</span><span>{formatPrice(grandTotal, market)}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                {isPK ? <><strong>Cash on Delivery</strong> — Pay when you receive your order. No advance required.</> : <><strong>Secure Payment</strong> — Currency: {marketCfg.currency}</>}
              </div>

              <button type="submit" disabled={orderLoading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">
                {orderLoading ? <><SpinIco /> Placing Order…</> : <><CheckIco /> Confirm & Place Order</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    portalRoot,
  );
}