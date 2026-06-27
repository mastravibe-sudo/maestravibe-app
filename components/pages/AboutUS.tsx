// components/pages/AboutUS.tsx
export default function AboutUS() {
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#0d0d2b] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%)' }} />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <p className="text-blue-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Serving the USA 🇺🇸</p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Premium Shopping <span className="text-blue-400">Delivered</span><br />Across America
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            MaestraVibe brings curated, premium products straight to your door — with fast shipping and secure checkout.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="text-4xl font-black mb-6">Built for American Shoppers</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-5">
              MaestraVibe launched its US operations to bring the same quality-first shopping experience to American customers — curated products, transparent pricing, and fast delivery.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              From New York to California, we serve thousands of customers who demand quality without compromise.
            </p>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop" alt="MaestraVibe USA" className="rounded-3xl shadow-2xl" />
            <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white rounded-2xl p-5 shadow-xl">
              <p className="text-3xl font-black">5K+</p>
              <p className="text-sm text-blue-200">US Customers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {[
            { title: 'Our Mission', icon: '🎯', text: 'To deliver premium quality products to every American household with the best prices, fast shipping, and outstanding customer service.' },
            { title: 'Our Vision',  icon: '🔭', text: "To become one of America's most trusted online marketplaces — known for quality, reliability, and an unbeatable shopping experience." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-2xl font-black mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-3">Why Americans Choose Us</h2>
          <p className="text-gray-500 text-center mb-14">Quality, speed, and trust — every time</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: 'Curated Quality',         desc: 'Every product hand-picked and quality verified before listing.' },
              { icon: '🚀', title: 'Fast US Shipping',        desc: '3-7 business days to all 50 states. Free above $50.' },
              { icon: '🔒', title: 'Secure Checkout',         desc: 'SSL-encrypted transactions. Multiple payment options.' },
              { icon: '💰', title: 'Competitive Pricing',     desc: 'Best prices guaranteed. Regular sales and exclusive deals.' },
              { icon: '🛍️', title: 'Wide Selection',          desc: 'Thousands of products across electronics, fashion, and more.' },
              { icon: '📞', title: '24/7 US Support',         desc: 'Call or email our US support team anytime.' },
            ].map((item, i) => (
              <div key={i} className="group bg-gray-50 hover:bg-blue-50 p-8 rounded-3xl transition-all duration-300">
                <span className="text-3xl block mb-4">{item.icon}</span>
                <h4 className="text-lg font-bold mb-2 group-hover:text-blue-700 transition">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['5,000+','US Customers'],['200+','Premium Products'],['50','States Served'],['4.8★','Average Rating']].map(([stat,label],i) => (
            <div key={i}><h3 className="text-4xl md:text-5xl font-black">{stat}</h3><p className="mt-2 text-blue-200">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Ready to shop premium?</h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of satisfied US customers today</p>
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 px-12 py-4 rounded-2xl text-lg font-bold transition">Start Shopping →</a>
        </div>
      </section>
    </main>
  );
}