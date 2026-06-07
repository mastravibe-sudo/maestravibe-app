// app/checkout/page.tsx
import CheckoutForm from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-gray-500 mb-8">Fill in your delivery details to place your order.</p>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <CheckoutForm />
      </div>
    </div>
  );
}