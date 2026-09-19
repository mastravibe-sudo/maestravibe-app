'use client';

// components/CheckoutForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, saveCart, type CartItem } from '@/components/Cart';
import { PK_CITIES } from '@/lib/order-validation';

export default function CheckoutForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', area: '', address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items: CartItem[] = getCart();
    if (items.length === 0) { alert('Your cart is empty!'); return; }

    setSubmitting(true);
    try {
      const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            image: i.product.images?.[0],
            productId: i.product.id,
            // Supplier commission split — null for in-house MaestraVibe
            // products, populated for supplier-owned ones. See lib/supabase.ts.
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

      saveCart([]); // clear cart
      router.push('/?order=success');
    } catch (err: any) {
      alert(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
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
          {f.name === 'city' ? (
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

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60 mt-2"
      >
        {submitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
}