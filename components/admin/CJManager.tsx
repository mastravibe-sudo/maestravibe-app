// components/admin/CJManager.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { SpinnerIcon } from './shared';

type Product = {
  id: string; name: string; images: string[]; cj_vid?: string; hhc_product_id?: string;
};

export default function CJManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const saveVid = async (productId: string) => {
    setSaving(productId);
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cj_vid: editValues[productId] || null }),
      });
      fetchProducts();
    } finally { setSaving(null); }
  };

  const linkedCount = products.filter(p => p.cj_vid).length;
  const unlinkedCount = products.length - linkedCount;

  return (
    <div>
      <h1 className="text-xl font-black text-gray-900 mb-2">CJ / HHC Dropshipping</h1>
      <p className="text-sm text-gray-500 mb-6">Link your products to CJ Dropshipping variant IDs so orders can be auto-submitted.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-2xl font-black text-blue-700">{linkedCount}</p>
          <p className="text-xs font-semibold text-gray-500">Linked to CJ</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-2xl font-black text-amber-700">{unlinkedCount}</p>
          <p className="text-xs font-semibold text-gray-500">Not linked</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-2xl font-black text-gray-700">{products.length}</p>
          <p className="text-xs font-semibold text-gray-500">Total products</p>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-6">
        <p className="font-semibold mb-1">ℹ️ How this works</p>
        <p>
          For each product sourced from CJ Dropshipping, paste its Variant ID (vid) below.
          Once linked, orders containing this product can be auto-submitted to CJ for fulfillment
          from the Orders page. HHC currently requires manual order placement (no public API for
          custom stores yet).
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400"><SpinnerIcon /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                {['Image', 'Product', 'CJ Variant ID (vid)', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {p.images?.[0] ? <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={p.cj_vid ?? ''}
                      onChange={e => setEditValues(v => ({ ...v, [p.id]: e.target.value }))}
                      placeholder="Paste CJ vid here"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => saveVid(p.id)} disabled={saving === p.id}
                      className="text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 px-3 py-1.5 rounded-lg disabled:opacity-60">
                      {saving === p.id ? 'Saving...' : 'Save'}
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