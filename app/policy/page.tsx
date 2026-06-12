export default function PolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `When you place an order, we collect:
• Full name and contact number
• Email address (optional)
• Delivery address (city, area, full address)
• Order details (products, quantities, amounts)

We do NOT collect payment card numbers. All orders are Cash on Delivery.`
    },
    {
      title: '2. How We Use Your Information',
      content: `Your information is used to:
• Process and deliver your orders
• Send order confirmation and updates
• Respond to your queries and support requests
• Improve our products and services
• Send promotional emails only if you have subscribed

We never sell or share your personal data with third parties for marketing purposes.`
    },
    {
      title: '3. Order & Payment Policy',
      content: `• All payments are Cash on Delivery (COD) — pay when you receive your order
• Order confirmation will be sent via WhatsApp or call
• Prices are in Pakistani Rupees (PKR)
• We reserve the right to cancel orders in case of stock unavailability
• You will be notified immediately if your order cannot be fulfilled`
    },
    {
      title: '4. Delivery Policy',
      content: `• Standard delivery: 2–4 working days across Pakistan
• Same-day delivery available in select major cities
• Delivery charges may apply depending on location and order value
• Free delivery on orders above Rs. 2,000
• Delivery tracking updates provided via WhatsApp`
    },
    {
      title: '5. Return & Refund Policy',
      content: `You may return a product within 7 days of delivery if:
• The product is damaged or defective
• The wrong item was delivered
• The product is unused and in original packaging

To initiate a return, contact us via WhatsApp at 0327-4050806.
Refunds are processed within 5–7 working days after the returned item is received and inspected.`
    },
    {
      title: '6. Cookies & Tracking',
      content: `Our website uses cookies to:
• Remember your cart and preferences
• Analyze site traffic and improve user experience
• Show relevant products

You can disable cookies in your browser settings, but this may affect website functionality.`
    },
    {
      title: '7. Data Security',
      content: `We take data security seriously:
• Your data is stored securely on encrypted servers
• We use industry-standard SSL encryption for all data transmission
• Access to customer data is restricted to authorized personnel only
• We regularly review our security practices`
    },
    {
      title: '8. Children\'s Privacy',
      content: `MaestraVibe is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us personal information, please contact us and we will delete it immediately.`
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated date. Continued use of our website after changes constitutes your acceptance of the new policy.`
    },
    {
      title: '10. Contact Us',
      content: `For any privacy concerns or questions:
📱 WhatsApp: 0327-4050806
📞 Phone: 0327-4050806
🕐 Available: 9 AM – 10 PM (Mon–Sat)`
    },
  ];

  return (
    <main className="bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-purple-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Legal</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Privacy Policy</h1>
          <p className="text-gray-300 text-lg">Last updated: January 2025</p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-10">
          <p className="text-gray-700 leading-relaxed">
            At <strong>MaestraVibe</strong>, we are committed to protecting your privacy and personal information.
            This Privacy Policy explains how we collect, use, and protect your data when you use our website or place an order with us.
            By using our services, you agree to the practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-purple-200 hover:shadow-sm transition">
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </span>
                {section.title.replace(/^\d+\.\s/, '')}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm">
            This policy applies to <strong>maestravibe.com</strong> and all associated services.
            For questions, contact us at <strong>0327-4050806</strong>.
          </p>
          <a href="/home" className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition">
            Back to Shopping
          </a>
        </div>
      </section>
    </main>
  );
}