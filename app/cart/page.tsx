'use client';

// app/cart/page.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCart, saveCart, type CartItem } from '@/components/Cart';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  const reload = () => setItems(getCart());

  useEffect(() => {
    reload();
    window.addEventListener('cart-updated', reload);
    return () => window.removeEventListener('cart-updated', reload);
  }, []);

  const remove = (idx: number) => {
    const cart = [...items];
    cart.splice(idx, 1);
    saveCart(cart);
  };

  const changeQty = (idx: number, delta: number) => {
    const cart = [...items];
    cart[idx].quantity = Math.max(1, cart[idx].quantity + delta);
    saveCart(cart);
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🛒</p>
          <p>Your cart is empty</p>
          <Link href="/home" className="text-purple-600 hover:underline text-sm mt-2 inline-block">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🧥</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.product.name}</p>
                  {item.selectedColor && <p className="text-xs text-gray-400">Color: {item.selectedColor}</p>}
                  {item.selectedSize  && <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>}
                  <p className="text-purple-700 font-bold mt-1">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => changeQty(idx, -1)} className="w-7 h-7 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">−</button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => changeQty(idx, +1)} className="w-7 h-7 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">+</button>
                  </div>
                </div>
                <button onClick={() => remove(idx)} className="text-gray-300 hover:text-red-400 text-xl">×</button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-purple-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}