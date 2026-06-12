export default function AboutPage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 60%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%)' }} />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <p className="text-purple-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Since 2024</p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Redefining <span className="text-purple-400">Online Shopping</span><br />in Pakistan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We are not just a store — we are your trusted partner for quality, speed, and satisfaction.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-purple-600 font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="text-4xl font-black mb-6">Built with passion for Pakistan</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-5">Founded in 2024, MaestraVibe was born from a simple belief — every Pakistani deserves access to premium products with a shopping experience that actually feels good.</p>
            <p className="text-gray-600 leading-relaxed text-lg">What started small has grown into one of Pakistan's fastest growing e-commerce platforms, serving customers from Karachi to Peshawar.</p>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop" alt="Our team" className="rounded-3xl shadow-2xl" />
            <div className="absolute -bottom-4 -left-4 bg-purple-600 text-white rounded-2xl p-5 shadow-xl">
              <p className="text-3xl font-black">10K+</p>
              <p className="text-sm text-purple-200">Happy Customers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {[
            { title:'Our Mission', icon:'🎯', text:'To provide every Pakistani with easy access to premium quality products at fair prices, backed by fast delivery and world-class customer service.' },
            { title:'Our Vision',  icon:'🔭', text:"To become Pakistan's most loved and trusted e-commerce destination — known for reliability, innovation, and putting customers first." },
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
          <h2 className="text-4xl font-black text-center mb-3">Why Customers Love Us</h2>
          <p className="text-gray-500 text-center mb-14">Everything we do is for you</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon:'✅', title:'Premium Quality',         desc:'Every product is carefully selected and quality checked before reaching you.'    },
              { icon:'🚚', title:'Lightning Fast Delivery', desc:'Same-day delivery in major cities. 2-4 days across all of Pakistan.'             },
              { icon:'🔒', title:'Secure Shopping',         desc:'100% secure transactions. Cash on Delivery also available.'                      },
              { icon:'💰', title:'Best Prices',             desc:'We negotiate hard so you pay less. Regular deals and flash sales.'                },
              { icon:'🛍️', title:'Huge Variety',            desc:'Thousands of products across 12+ categories — all in one place.'                 },
              { icon:'🤝', title:'24/7 Support',            desc:'Real humans ready to help. WhatsApp, call, or email — your choice.'              },
            ].map((item, i) => (
              <div key={i} className="group bg-gray-50 hover:bg-purple-50 p-8 rounded-3xl transition-all duration-300">
                <span className="text-3xl block mb-4">{item.icon}</span>
                <h4 className="text-lg font-bold mb-2 group-hover:text-purple-700 transition">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['10,000+','Happy Customers'],['500+','Premium Products'],['50+','Cities Served'],['4.9★','Average Rating']].map(([stat,label],i)=>(
            <div key={i}><h3 className="text-4xl md:text-5xl font-black">{stat}</h3><p className="mt-2 text-purple-200">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Ready to shop with confidence?</h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of satisfied customers across Pakistan</p>
          <a href="/home" className="inline-block bg-purple-600 hover:bg-purple-700 px-12 py-4 rounded-2xl text-lg font-bold transition">Start Shopping →</a>
        </div>
      </section>
    </main>
  );
}