// components/pages/PolicyPK.tsx
// This is your existing policy page content — preserved exactly
export default function PolicyPK() {
  const sections = [
    { title: '1. Information We Collect', content: `When you place an order, we collect:\n• Full name and contact number\n• Email address (optional)\n• Delivery address (city, area, full address)\n• Order details\n\nWe do NOT collect payment card numbers. All orders are Cash on Delivery.` },
    { title: '2. How We Use Your Information', content: `Your information is used to:\n• Process and deliver your orders\n• Send order confirmation and updates\n• Respond to your queries\n• Send promotional emails only if you have subscribed\n\nWe never sell or share your personal data.` },
    { title: '3. Order & Payment Policy', content: `• All payments are Cash on Delivery (COD)\n• Order confirmation via WhatsApp or call\n• Prices in Pakistani Rupees (PKR)\n• We reserve the right to cancel out-of-stock orders` },
    { title: '4. Delivery Policy', content: `• Standard delivery: 2–4 working days across Pakistan\n• Same-day delivery in select major cities\n• Free delivery on orders above Rs. 2,000\n• Delivery tracking updates via WhatsApp` },
    { title: '5. Return & Refund Policy', content: `Return within 7 days if:\n• Product is damaged or defective\n• Wrong item delivered\n• Product unused and in original packaging\n\nContact us on WhatsApp: 0327-4050806\nRefunds processed within 5–7 working days.` },
    { title: '6. Contact', content: `📱 WhatsApp: 0327-4050806\n📞 Phone: 0327-4050806\n🕐 Available: 9 AM – 10 PM (Mon–Sat)` },
  ];
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-purple-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Legal · Pakistan 🇵🇰</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: January 2025</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-10">
          <p className="text-gray-700 leading-relaxed">At <strong>MaestraVibe</strong>, we are committed to protecting your privacy. This policy explains how we collect, use, and protect your data.</p>
        </div>
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-purple-200 transition">
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                {section.title.replace(/^\d+\.\s/, '')}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="/" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition">Back to Shopping</a>
        </div>
      </section>
    </main>
  );
}