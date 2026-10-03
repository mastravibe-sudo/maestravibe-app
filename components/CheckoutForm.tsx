'use client';

// components/CheckoutForm.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, saveCart, type CartItem } from '@/components/Cart';
import { PK_CITIES } from '@/lib/order-validation';

type Market = 'pk' | 'us';

// The middleware stores the detected market in the (non-httpOnly) mv_market cookie.
function readMarket(): Market {
  if (typeof document === 'undefined') return 'pk';
  const c = document.cookie.split('; ').find((x) => x.startsWith('mv_market='));
  return c?.split('=')[1] === 'us' ? 'us' : 'pk';
}

export default function CheckoutForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [market, setMarket] = useState<Market>('pk');
  const [payOnline, setPayOnline] = useState(true);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', area: '', address: '',
  });

  useEffect(() => {
    setMarket(readMarket());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items: CartItem[] = getCart();
    if (items.length === 0) { alert('Your cart is empty!'); return; }

    setSubmitting(true);
    let redirecting = false;
    try {
      const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          market,
          paymentMethod: market === 'us' && payOnline ? 'online' : 'cod',
          items: items.map((i) => ({
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            image: i.product.images?.[0],
            productId: i.product.id,
            supplier_id: i.product.supplier_id ?? null,
            supplier_price: i.product.supplier_price ?? null,
          })),
          total,
          status: 'new',
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        const fields = responseData.fieldErrors ? Object.entries(responseData.fieldErrors).map(([field, message]) => `${field}: ${message}`).join(' ') : '';
        throw new Error(fields || responseData.message || 'Order failed');
      }

      // Online payment: go to the hosted payment page. Cart is cleared on /payment/success.
      if (responseData.paymentUrl) {
        redirecting = true;
        window.location.href = responseData.paymentUrl;
        return;
      }

      saveCart([]); // COD: clear cart
      router.push('/?order=success');
    } catch (err: any) {
      alert(err.message ?? 'Something went wrong');
    } finally {
      if (!redirecting) setSubmitting(false);
    }
  };

  const fields: { name: keyof typeof form; label: string; required?: boolean; type?: string }[] = [
    { name: 'name',    label: 'Full Name',     required: true },
    { name: 'phone',   label: 'Phone Number',  required: true, type: 'tel' },
    { name: 'email',   label: 'Email',         type: 'email' },
    { name: 'city',    label: 'City',          required: true },
    { name: 'area',    label: 'Area / Town' },
    { name: 'address', label: 'Full Address',  required: true },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {f.label} {f.required && <span className="text-red-400">*</span>}
          </label>
          {f.name === 'city' && market === 'pk' ? (
            <select name={f.name} required={f.required} value={form[f.name]} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
              <option value="">Select your city</option>
              {PK_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          ) : (
            <input
              name={f.name}
              type={f.type ?? 'text'}
              required={f.required}
              value={form[f.name]}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          )}
        </div>
      ))}

      {market === 'us' && (
        <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={payOnline} onChange={() => setPayOnline(true)} />
            Pay online by card
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60 mt-2"
      >
        {submitting
          ? 'Please wait...'
          : market === 'us' && payOnline
          ? 'Continue to payment'
          : 'Place Order'}
      </button>
    </form>
  );
}