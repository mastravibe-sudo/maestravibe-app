// components/home/WhyChooseUsSection.tsx
'use client';

interface WhyChooseUsSectionProps {
  isPK: boolean;
}

export default function WhyChooseUsSection({ isPK }: WhyChooseUsSectionProps) {
  const items = [
    { icon: '🎯', title: 'Curated Selection', desc: 'Every product is hand-picked by our team for quality, style, and value.' },
    { icon: isPK ? '💵' : '🔒', title: isPK ? 'Pay on Delivery' : 'Secure Payment', desc: isPK ? 'Order with full confidence. Pay cash when your order arrives — no advance required.' : 'SSL-secured checkout with card, PayPal, and more.' },
    { icon: '🔄', title: 'Easy Returns', desc: 'Changed your mind? No problem. Our 7-day hassle-free return policy has you covered.' },
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Why MaestraVibe</p>
          <h2 className="text-2xl font-black text-gray-800">Shopping Made Simple</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border border-violet-100 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}