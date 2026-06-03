export default function ServicesPage() {
  return (
    <main className="bg-white text-gray-900">
      
      {/* HERO SECTION */}
      <section className="bg-linear-to-r from-[#020617] via-[#0f172a] to-[#020617] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-blue-400 uppercase tracking-[6px] font-semibold mb-4">Our Services</p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Premium Services for <span className="text-blue-500">Better Shopping</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From lightning-fast delivery to world-class customer support, we provide everything 
            you need for a seamless and trusted shopping experience in Pakistan.
          </p>
        </div>
      </section>

      {/* MAIN SERVICES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">What We Offer</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            We don’t just sell products — we deliver complete peace of mind with every order.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Fast Delivery",
                desc: "Same-day delivery in major cities. 2-4 days delivery across Pakistan.",
                highlight: "98% on-time delivery"
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                desc: "Multiple secure payment options including Cash on Delivery (COD).",
                highlight: "100% Secure"
              },
              {
                icon: "📦",
                title: "Easy Returns",
                desc: "7-15 days easy return & refund policy. No questions asked.",
                highlight: "Hassle Free"
              },
              {
                icon: "🛡️",
                title: "Warranty & Authenticity",
                desc: "All products come with manufacturer warranty and 100% genuine guarantee.",
                highlight: "Genuine Products"
              },
              {
                icon: "💬",
                title: "24/7 Support",
                desc: "Dedicated customer support team ready to help you anytime.",
                highlight: "Always Here"
              },
              {
                icon: "🎁",
                title: "Gift & Personalization",
                desc: "Special gift wrapping and personalized messages on request.",
                highlight: "Make it Special"
              }
            ].map((service, i) => (
              <div 
                key={i} 
                className="bg-white border border-gray-100 p-8 rounded-3xl hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
              >
                <div className="text-5xl mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <p className="text-blue-600 font-medium text-sm">{service.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Browse & Select", desc: "Explore thousands of quality products" },
              { step: "02", title: "Secure Checkout", desc: "Multiple payment options available" },
              { step: "03", title: "Fast Processing", desc: "Order confirmed within minutes" },
              { step: "04", title: "Track & Receive", desc: "Real-time tracking & safe delivery" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6">
                  {item.step}
                </div>
                <h4 className="font-semibold text-xl mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY OUR SERVICES ARE DIFFERENT */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Maestravibe Services?</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Trusted by Thousands</h4>
                  <p className="text-gray-600">Over 10,000+ satisfied customers across Pakistan</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Real-Time Tracking</h4>
                  <p className="text-gray-600">Track your order from warehouse to your doorstep</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">No Hidden Charges</h4>
                  <p className="text-gray-600">Transparent pricing with no surprise fees</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Pakistan First</h4>
                  <p className="text-gray-600">Built for Pakistani customers with local needs in mind</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-5xl font-bold">15,000+</h3>
            <p className="mt-2">Orders Delivered</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold">98%</h3>
            <p className="mt-2">On-Time Delivery</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold">24/7</h3>
            <p className="mt-2">Customer Support</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold">4.9★</h3>
            <p className="mt-2">Average Rating</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience the Difference?</h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of happy customers who trust Diouma</p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 px-12 py-4 rounded-2xl text-lg font-semibold transition transform hover:scale-105"
          >
            Start Shopping Now
          </a>
        </div>
      </section>

    </main>
  );
}