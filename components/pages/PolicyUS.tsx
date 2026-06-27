// components/pages/PolicyUS.tsx
export default function PolicyUS() {
  const sections = [
    { title: '1. Information We Collect', content: `When you place an order, we collect:\n• Full name and shipping address\n• Email address and phone number\n• Payment information (processed securely via SSL)\n• Order details and history\n\nWe use industry-standard encryption to protect all payment data.` },
    { title: '2. How We Use Your Information', content: `Your information is used to:\n• Process and ship your orders\n• Send order confirmations and tracking updates\n• Respond to your customer service requests\n• Send marketing emails only if you opt in\n\nWe never sell your personal data to third parties.` },
    { title: '3. Order & Payment Policy', content: `• We accept credit/debit cards and PayPal\n• All transactions are SSL-encrypted\n• Prices are in US Dollars (USD)\n• Orders confirmed via email within 1 hour\n• We reserve the right to cancel orders due to stock issues` },
    { title: '4. Shipping Policy', content: `• Standard shipping: 3–7 business days across the USA\n• Free shipping on orders above $50\n• Expedited shipping available at checkout\n• Tracking number emailed once order ships` },
    { title: '5. Return & Refund Policy', content: `Return within 30 days if:\n• Product is damaged or defective\n• Wrong item was delivered\n• Item is unused and in original packaging\n\nEmail us at us@maestravibe.com to start a return.\nRefunds processed within 5–7 business days.` },
    { title: '6. CCPA / Privacy Rights', content: `California residents have the right to:\n• Know what personal data we collect\n• Request deletion of their data\n• Opt out of data sale (we do not sell data)\n\nSubmit requests to: us@maestravibe.com` },
    { title: '7. Contact', content: `📞 Phone: +1 (800) 123-4567\n📧 Email: us@maestravibe.com\n📍 Address: 123 Commerce St, New York, NY 10001\n🕐 Support: Mon–Fri 9 AM – 6 PM EST` },
  ];
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#0d0d2b] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Legal · USA 🇺🇸</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: January 2025</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
          <p className="text-gray-700 leading-relaxed">At <strong>MaestraVibe USA</strong>, we are committed to protecting your privacy in compliance with US federal and state laws including CCPA.</p>
        </div>
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-blue-200 transition">
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                {section.title.replace(/^\d+\.\s/, '')}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition">Back to Shopping</a>
        </div>
      </section>
    </main>
  );
}