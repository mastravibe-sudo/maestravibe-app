export default function AboutPage() {
  return (
    <main className="bg-white text-gray-900">
      
      {/* HERO SECTION */}
      <section className="bg-linear-to-r from-[#020617] via-[#0f172a] to-[#020617] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-blue-400 uppercase tracking-[6px] font-semibold mb-4">Since 2024</p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Redefining <span className="text-blue-500">Online Shopping</span><br /> in Pakistan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We are not just an ecommerce store — we are your trusted partner for quality products, 
            fast delivery, and exceptional shopping experience.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Founded in 2024 with a simple mission — to make premium quality products accessible 
                to every Pakistani household with trust, convenience, and affordability.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                What started as a small dream has now become one of the fastest growing 
                ecommerce platforms in Pakistan. We carefully curate every product to ensure 
                the highest standards of quality.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop" 
                alt="Our Story" 
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className="bg-white p-10 rounded-3xl shadow">
            <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-600 text-lg">
              To provide every Pakistani with easy access to premium quality products at reasonable prices, 
              backed by fast delivery and world-class customer service.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow">
            <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-600 text-lg">
              To become Pakistan's most loved and trusted ecommerce destination, known for reliability, 
              innovation, and customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Why Customers Love Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "✅ Premium Quality", desc: "Every product is carefully selected and quality checked" },
              { title: "🚚 Lightning Fast Delivery", desc: "Same day delivery in major cities & fast delivery nationwide" },
              { title: "🔒 Secure Shopping", desc: "100% secure payments with multiple options including COD" },
              { title: "💰 Best Prices", desc: "Competitive pricing with regular discounts and offers" },
              { title: "🛍️ Huge Variety", desc: "Thousands of products across multiple categories" },
              { title: "🤝 24/7 Support", desc: "Dedicated customer support team always ready to help" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl hover:bg-blue-50 transition-all">
                <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-5xl font-bold">10,000+</h3>
            <p className="mt-2">Happy Customers</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold">500+</h3>
            <p className="mt-2">Premium Products</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold">50+</h3>
            <p className="mt-2">Cities Served</p>
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
          <h2 className="text-4xl font-bold mb-6">Ready to Shop with Confidence?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of satisfied customers across Pakistan</p>
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl text-lg font-semibold transition">
            Start Shopping Now
          </a>
        </div>
      </section>

    </main>
  );
}