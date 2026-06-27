// components/pages/ServicesUS.tsx
export default function ServicesUS() {
  const services = [
    { icon: '🚀', title: 'Fast US Shipping',        desc: '3-7 business days to all 50 states. Free shipping on orders over $50.' },
    { icon: '↩️', title: '30-Day Returns',           desc: 'Full 30-day return window. Easy online returns, no hassle.' },
    { icon: '🔒', title: 'Secure Payments',          desc: 'SSL-encrypted checkout. Credit/debit cards, PayPal accepted.' },
    { icon: '📞', title: 'US Customer Support',      desc: 'Call or email our US team at +1 (800) 123-4567.' },
    { icon: '🛡️', title: 'Buyer Protection',         desc: 'Every order guaranteed. Lost package? We replace or refund.' },
    { icon: '🎁', title: 'Gift Services',            desc: 'Gift wrapping and direct shipping to recipients across the USA.' },
  ];
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#0d0d2b] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">USA 🇺🇸</p>
          <h1 className="text-5xl font-black mb-4">Our Services</h1>
          <p className="text-gray-300 text-lg">Everything we offer for an outstanding US shopping experience</p>
        </div>
      </section>
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-gray-50 hover:bg-blue-50 p-8 rounded-3xl border border-gray-100 hover:border-blue-200 transition-all group">
              <span className="text-4xl block mb-4">{s.icon}</span>
              <h3 className="text-xl font-black mb-3 group-hover:text-blue-700 transition">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 bg-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-4">Need help? Our US team is ready</h2>
          <p className="text-blue-200 mb-8">Call us at +1 (800) 123-4567 or email us@maestravibe.com</p>
          <a href="mailto:us@maestravibe.com"
            className="inline-block bg-blue-500 hover:bg-blue-600 px-10 py-4 rounded-2xl text-lg font-bold transition">
            📧 Email US Support
          </a>
        </div>
      </section>
    </main>
  );
}