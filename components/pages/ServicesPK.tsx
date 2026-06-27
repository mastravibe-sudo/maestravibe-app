// components/pages/ServicesPK.tsx
export default function ServicesPK() {
  const services = [
    { icon: '🚚', title: 'Cash on Delivery', desc: 'Order now, pay when your package arrives. No advance payment required across Pakistan.' },
    { icon: '↩️', title: '7-Day Easy Returns', desc: 'Not satisfied? Return within 7 days hassle-free. No questions asked.' },
    { icon: '📦', title: 'Fast Nationwide Delivery', desc: 'Same-day in major cities. 2-4 working days across all of Pakistan.' },
    { icon: '💬', title: 'WhatsApp Support', desc: '24/7 support via WhatsApp. Real humans, real help at 0327-4050806.' },
    { icon: '🛡️', title: 'Buyer Protection', desc: 'Every order is protected. We guarantee delivery or full refund.' },
    { icon: '🎁', title: 'Gift Wrapping', desc: 'Send gifts directly to your loved ones with custom gift wrapping.' },
  ];
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-purple-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Pakistan 🇵🇰</p>
          <h1 className="text-5xl font-black mb-4">Our Services</h1>
          <p className="text-gray-300 text-lg">Everything we offer to make your shopping experience perfect</p>
        </div>
      </section>
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-gray-50 hover:bg-purple-50 p-8 rounded-3xl border border-gray-100 hover:border-purple-200 transition-all group">
              <span className="text-4xl block mb-4">{s.icon}</span>
              <h3 className="text-xl font-black mb-3 group-hover:text-purple-700 transition">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 bg-purple-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-4">Need help? We're here 24/7</h2>
          <p className="text-purple-200 mb-8">WhatsApp us at 0327-4050806 or email mastravibe@gmail.com</p>
          <a href="https://wa.me/923274050806" target="_blank" rel="noreferrer"
            className="inline-block bg-green-500 hover:bg-green-600 px-10 py-4 rounded-2xl text-lg font-bold transition">
            💬 Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}