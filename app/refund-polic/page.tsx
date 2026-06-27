// app/refund-policy/page.tsx
import { cookies } from 'next/headers';
import { getMarketFromCookie } from '@/lib/market';

export default async function RefundPolicyPage() {
  const cookieStore = await cookies();
  const market = getMarketFromCookie(cookieStore.get('mv_market')?.value);
  const isPK = market === 'pk';

  const content = isPK ? {
    badge: 'Pakistan 🇵🇰', accent: 'purple',
    title: 'Refund Policy',
    intro: 'We want you to be 100% satisfied with your MaestraVibe purchase.',
    items: [
      { t: 'Eligibility', b: 'Return within 7 days of delivery. Item must be unused, unwashed, and in original packaging with tags.' },
      { t: 'Process', b: 'WhatsApp us at 0327-4050806 with your order details and reason. We\'ll arrange a pickup.' },
      { t: 'Refund Timeline', b: 'Refunds processed within 5–7 working days after we receive and inspect the returned item.' },
      { t: 'Non-Refundable', b: 'Sale items, digital products, and items returned after 7 days are non-refundable.' },
      { t: 'Damaged Items', b: 'If you receive a damaged item, contact us within 24 hours with photos for a full refund or replacement.' },
    ],
    contact: '📱 WhatsApp: 0327-4050806',
  } : {
    badge: 'USA 🇺🇸', accent: 'blue',
    title: 'Refund Policy',
    intro: 'We stand behind every product. Your satisfaction is our priority.',
    items: [
      { t: 'Eligibility', b: 'Return within 30 days of delivery. Item must be unused and in original packaging.' },
      { t: 'Process', b: 'Email us@maestravibe.com with your order number and reason. We\'ll email you a prepaid return label.' },
      { t: 'Refund Timeline', b: 'Refunds issued within 5–7 business days to your original payment method after we receive the return.' },
      { t: 'Non-Refundable', b: 'Final sale items, gift cards, and digital products are not eligible for refunds.' },
      { t: 'Damaged Items', b: 'Photo evidence of damage required within 48 hours of delivery for full replacement or refund.' },
    ],
    contact: '📧 us@maestravibe.com · 📞 +1 (800) 123-4567',
  };

  const accentColor = isPK ? 'purple' : 'blue';

  return (
    <main className="bg-white text-gray-900">
      <section className={`bg-gradient-to-br ${isPK ? 'from-[#0f0c29] via-[#302b63] to-[#24243e]' : 'from-[#0a0a1a] via-[#1a1a3e] to-[#0d0d2b]'} text-white py-20`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className={`text-${accentColor}-400 uppercase tracking-[6px] font-semibold mb-4 text-sm`}>Legal · {content.badge}</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">{content.title}</h1>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className={`bg-${accentColor}-50 border border-${accentColor}-100 rounded-2xl p-6 mb-10`}>
          <p className="text-gray-700 leading-relaxed">{content.intro}</p>
        </div>
        <div className="space-y-6">
          {content.items.map((item, i) => (
            <div key={i} className={`border border-gray-100 rounded-2xl p-6 hover:border-${accentColor}-200 transition`}>
              <h2 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg bg-${accentColor}-600 text-white text-xs flex items-center justify-center font-bold`}>{i + 1}</span>
                {item.t}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{item.b}</p>
            </div>
          ))}
        </div>
        <div className={`mt-10 bg-${accentColor}-50 rounded-2xl p-6 text-center`}>
          <p className="text-gray-600 text-sm mb-4">{content.contact}</p>
          <a href="/" className={`inline-block bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition`}>Back to Shopping</a>
        </div>
      </section>
    </main>
  );
}