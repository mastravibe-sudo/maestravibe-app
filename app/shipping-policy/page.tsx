// app/shipping-policy/page.tsx
import { cookies } from 'next/headers';
import { getMarketFromCookie } from '@/lib/market';

export default async function ShippingPolicyPage() {
  const cookieStore = await cookies();
  const market = getMarketFromCookie(cookieStore.get('mv_market')?.value);
  const isPK = market === 'pk';

  const content = isPK ? {
    badge: 'Pakistan 🇵🇰',
    title: 'Shipping Policy',
    rows: [
      { method: 'Standard Delivery', time: '2–4 working days', cost: 'Rs. 150 (Free above Rs. 2,000)' },
      { method: 'Same-Day Delivery', time: 'Same day (order before 12 PM)', cost: 'Rs. 300 (Major cities only)' },
      { method: 'Remote Areas',      time: '5–7 working days', cost: 'Rs. 250' },
    ],
    notes: [
      'Orders are processed within 24 hours.',
      'You will receive a WhatsApp confirmation once shipped.',
      'Delivery tracking is available on request.',
      'Delivery is available across all of Pakistan.',
    ],
    isPK: true,
  } : {
    badge: 'USA 🇺🇸',
    title: 'Shipping Policy',
    rows: [
      { method: 'Standard Shipping',   time: '3–7 business days', cost: 'Free above $50, else $6.99' },
      { method: 'Expedited Shipping',  time: '2–3 business days', cost: '$12.99' },
      { method: 'Overnight Shipping',  time: 'Next business day',  cost: '$24.99' },
    ],
    notes: [
      'Orders placed before 2 PM EST ship the same day.',
      'Tracking number emailed once your order ships.',
      'We ship to all 50 US states including Alaska and Hawaii.',
      'PO Boxes and APO/FPO addresses accepted for standard shipping.',
    ],
    isPK: false,
  };

  return (
    <main className="bg-white text-gray-900">
      <section className={`bg-gradient-to-br ${isPK ? 'from-[#0f0c29] via-[#302b63] to-[#24243e]' : 'from-[#0a0a1a] via-[#1a1a3e] to-[#0d0d2b]'} text-white py-20`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className={`${isPK ? 'text-purple-400' : 'text-blue-400'} uppercase tracking-[6px] font-semibold mb-4 text-sm`}>Legal · {content.badge}</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">{content.title}</h1>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="overflow-x-auto mb-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`${isPK ? 'bg-purple-600' : 'bg-blue-600'} text-white`}>
                <th className="text-left p-4 rounded-tl-xl font-semibold">Shipping Method</th>
                <th className="text-left p-4 font-semibold">Delivery Time</th>
                <th className="text-left p-4 rounded-tr-xl font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 text-sm font-medium text-gray-800">{row.method}</td>
                  <td className="p-4 text-sm text-gray-600">{row.time}</td>
                  <td className="p-4 text-sm text-gray-600">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 mb-10">
          <h3 className="font-black text-lg mb-4">Important Notes</h3>
          {content.notes.map((note, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`mt-1 w-5 h-5 rounded-full ${isPK ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} flex items-center justify-center text-xs font-bold shrink-0`}>✓</span>
              <p className="text-gray-600 text-sm">{note}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="/" className={`inline-block ${isPK ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-3 rounded-xl font-bold text-sm transition`}>Back to Shopping</a>
        </div>
      </section>
    </main>
  );
}