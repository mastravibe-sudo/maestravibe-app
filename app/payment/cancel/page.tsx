// app/payment/cancel/page.tsx
export default function PaymentCancel() {
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Payment cancelled</h1>
      <p className="mt-2 text-gray-600">No money was taken. Your cart is still saved, you can try again.</p>
    </main>
  );
}