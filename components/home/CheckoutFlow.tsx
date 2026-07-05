// components/home/CheckoutFlow.tsx
'use client';

import { formatPrice } from '@/lib/home/helpers';
import type { CustomerInfo, MarketConfigEntry } from '@/lib/home/types';
import { BackIco, ChevR, CheckIco, CloseIco, LocIco, SpinIco } from './icons';

interface CheckoutFlowProps {
  checkoutStep: number;
  checkoutItems: any[];
  orderTotal: number;
  market: string;
  marketCfg: MarketConfigEntry;
  isPK: boolean;
  customerInfo: CustomerInfo;
  locationLoading: boolean;
  orderLoading: boolean;
  onBack: () => void;
  onClose: () => void;
  onContinueToDelivery: () => void;
  onDetectLocation: () => void;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckoutFlow({
  checkoutStep, checkoutItems, orderTotal, market, marketCfg, isPK,
  customerInfo, locationLoading, orderLoading,
  onBack, onClose, onContinueToDelivery, onDetectLocation, onCustomerInfoChange, onSubmit,
}: CheckoutFlowProps) {
  const inputCls = 'w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-sm transition-colors bg-white';

  const fields = [
    { label: 'Full Name', key: 'name',  type: 'text',  placeholder: 'Your full name',                                         required: true  },
    { label: 'Phone',     key: 'phone', type: 'tel',   placeholder: isPK ? '03XX-XXXXXXX' : marketCfg.phone,                  required: true  },
    { label: 'Email',     key: 'email', type: 'email', placeholder: 'email@example.com',                                       required: false },
    { label: 'City',      key: 'city',  type: 'text',  placeholder: isPK ? 'Karachi, Lahore…' : 'Your city',                   required: true  },
    { label: 'Area',      key: 'area',  type: 'text',  placeholder: isPK ? 'Gulshan, DHA…' : 'District / suburb',              required: true  },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><BackIco /></button>
            <div>
              <h2 className="text-lg font-black">{checkoutStep === 1 ? 'Order Review' : 'Delivery Details'}</h2>
              <div className="flex items-center gap-1 mt-1"><div className="h-1.5 w-10 rounded-full bg-violet-600" /><div className={`h-1.5 w-10 rounded-full transition-colors ${checkoutStep >= 2 ? 'bg-violet-600' : 'bg-gray-200'}`} /></div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><CloseIco /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
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
          {checkoutStep === 2 && (
            <form onSubmit={onSubmit}>
              <button type="button" onClick={onDetectLocation} disabled={locationLoading} className="w-full mb-5 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {locationLoading ? <><SpinIco /> Detecting location…</> : <><LocIco /> Auto-detect My Location</>}
              </button>
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">{field.label} {field.required && <span className="text-red-400">*</span>}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      className={inputCls}
                      value={(customerInfo as any)[field.key]}
                      onChange={e => onCustomerInfoChange({ ...customerInfo, [field.key]: e.target.value })}
                    />
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
              <div className="mt-5 bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100"><span className="text-sm text-gray-500">{checkoutItems.length} item(s)</span><span className="font-black text-violet-700">{formatPrice(orderTotal, market)}</span></div>
              <button type="submit" disabled={orderLoading} className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2">
                {orderLoading ? <><SpinIco /> Processing…</> : <><CheckIco /> Place Order</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}