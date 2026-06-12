export default function ServicesPage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-purple-400 uppercase tracking-[6px] font-semibold mb-4 text-sm">Our Services</p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Premium Services for <span className="text-purple-400">Better Shopping</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From lightning-fast delivery to world-class support — everything you need for a seamless, trusted shopping experience.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-3">What We Offer</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-14">We don't just sell products — we deliver complete peace of mind.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:'🚚', title:'Fast Delivery',         desc:'Same-day delivery in major cities. 2-4 days delivery across Pakistan.', badge:'98% on-time' },
              { icon:'🔒', title:'Secure Payment',        desc:'Multiple payment options including Cash on Delivery (COD).',            badge:'100% Secure' },
              { icon:'📦', title:'Easy Returns',          desc:'7-15 days easy return & refund policy. No questions asked.',            badge:'Hassle Free' },
              { icon:'🛡️', title:'Authentic Products',   desc:'All products come with manufacturer warranty and genuine guarantee.',    badge:'Verified'    },
              { icon:'💬', title:'24/7 Support',          desc:'Dedicated support team ready to help you anytime via WhatsApp or call.', badge:'Always Here' },
              { icon:'🎁', title:'Gift Wrapping',         desc:'Special gift wrapping and personalized messages available on request.',  badge:'Make it Special' },
            ].map((s, i) => (
              <div key={i} className="group bg-white border border-gray-100 p-8 rounded-3xl hover:shadow-xl hover:border-purple-200 transition-all duration-300">
                <div className="text-4xl mb-5">{s.icon}</div>
                <h3 className="text-xl font-black mb-2 group-hover:text-purple-700 transition">{s.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{s.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step:'01', title:'Browse & Select',  desc:'Explore 12+ categories of quality products' },
              { step:'02', title:'Add to Cart',       desc:'Choose your size, color and quantity'        },
              { step:'03', title:'Place Order',       desc:'Fill delivery details — COD available'       },
              { step:'04', title:'Receive & Enjoy',   desc:'Fast delivery right to your doorstep'        },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-purple-100" />}
                <div className="relative w-16 h-16 mx-auto bg-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-black mb-5 shadow-lg">
                  {item.step}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['15,000+','Orders Delivered'],['98%','On-Time Delivery'],['24/7','Customer Support'],['4.9★','Average Rating']].map(([stat,label],i)=>(
            <div key={i}><h3 className="text-4xl md:text-5xl font-black">{stat}</h3><p className="mt-2 text-purple-200">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Ready to Experience the Difference?</h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of happy customers who trust MaestraVibe</p>
          <a href="/home" className="inline-block bg-purple-600 hover:bg-purple-700 px-12 py-4 rounded-2xl text-lg font-bold transition">Start Shopping Now →</a>
        </div>
      </section>
    </main>
  );
}