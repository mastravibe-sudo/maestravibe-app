'use client';

// components/Cart.tsx
// Simple in-memory cart using localStorage for persistence
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/supabase';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

// ── Cart store (simple module-level state + custom event) ───
const CART_KEY = 'mv_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'); }
  catch { return []; }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product: Product, color?: string, size?: string) {
  const cart = getCart();
  const idx  = cart.findIndex(
    (i) => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
  );
  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({ product, quantity: 1, selectedColor: color, selectedSize: size });
  }
  saveCart(cart);
}

// ── Component ───────────────────────────────────────────────
interface Props { onClose: () => void; }

export default function Cart({ onClose }: Props) {
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Your Cart ({items.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 mt-16">Your cart is empty</p>
          ) : items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🧥</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{item.product.name}</p>
                {item.selectedColor && <p className="text-xs text-gray-400">Color: {item.selectedColor}</p>}
                {item.selectedSize  && <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>}
                <p className="text-purple-700 font-bold text-sm mt-1">
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </p>
                {/* Qty */}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => changeQty(idx, -1)} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">−</button>
                  <span className="text-sm">{item.quantity}</span>
                  <button onClick={() => changeQty(idx, +1)} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">+</button>
                </div>
              </div>

              <button onClick={() => remove(idx)} className="text-gray-300 hover:text-red-400 text-lg leading-none mt-1">×</button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex justify-between text-gray-800 font-bold mb-4">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-purple-600 text-white text-center font-medium py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}