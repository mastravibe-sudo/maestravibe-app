// components/home/CartDrawer.tsx
'use client';

import { formatPrice } from '@/lib/home/helpers';
import { CloseIco } from './icons';

interface CartDrawerProps {
  cart: any[];
  market: string;
  cartCount: number;
  cartTotal: number;
  onClose: () => void;
  onUpdateQuantity: (index: number, updater: (item: any) => any) => void;
  onRemove: (index: number) => void;
  onStartShopping: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  cart, market, cartCount, cartTotal,
  onClose, onUpdateQuantity, onRemove, onStartShopping, onCheckout,
}: CartDrawerProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center bg-white">
          <h2 className="text-lg font-black text-gray-900">Your Cart <span className="text-violet-600">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span></h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><CloseIco /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-gray-500 font-semibold">Your cart is empty</p>
              <button onClick={onStartShopping} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">Start Shopping</button>
            </div>
          ) : cart.map((item, index) => (
            <div key={index} className="flex gap-3 border border-gray-100 rounded-2xl p-3 bg-gray-50">
              <img src={item.images?.[0]} className="w-20 h-20 object-cover rounded-xl shrink-0" alt={item.name} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3.5 h-3.5 rounded-full border shrink-0 ring-1 ring-gray-200" style={{ backgroundColor: item.selectedColor }} />
                  <span className="text-xs text-gray-500">{item.selectedColor}</span>
                  {item.selectedSize && item.selectedSize !== 'Standard' && <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{item.selectedSize}</span>}
                </div>
                <p className="font-black text-violet-700 text-sm mt-1">{formatPrice(item.price * item.quantity, market)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQuantity(index, x => ({ ...x, quantity: Math.max(1, x.quantity - 1) }))} className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-violet-400 transition-colors flex items-center justify-center text-gray-600">−</button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(index, x => ({ ...x, quantity: x.quantity + 1 }))} className="w-7 h-7 border-2 rounded-lg text-sm font-bold hover:border-violet-400 transition-colors flex items-center justify-center text-gray-600">+</button>
                  <button onClick={() => onRemove(index)} className="text-red-400 text-xs ml-2 hover:text-red-600 font-semibold">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t bg-white">
            <div className="flex justify-between mb-4"><span className="font-bold text-gray-700">Total</span><span className="font-black text-xl text-violet-700">{formatPrice(cartTotal, market)}</span></div>
            <button onClick={onCheckout} className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-base transition-all">Proceed to Checkout ({cartCount} items)</button>
          </div>
        )}
      </div>
    </div>
  );
}