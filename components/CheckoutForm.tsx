'use client';

// components/CheckoutForm.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, saveCart, type CartItem } from '@/components/Cart';

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
          })),
          total,
          status: 'new',
        }),
      });

      if (!res.ok) throw new Error('Order failed');

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
          <input
            name={f.name}
            type={f.type ?? 'text'}
            required={f.required}
            value={form[f.name]}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
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