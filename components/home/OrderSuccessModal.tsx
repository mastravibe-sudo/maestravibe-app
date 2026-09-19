// components/home/OrderSuccessModal.tsx
'use client';

import { CheckIco } from './icons';

interface OrderSuccessModalProps {
  isPK: boolean;
  onClose: () => void;
}

export default function OrderSuccessModal({ isPK, onClose }: OrderSuccessModalProps) {
  const steps = [
    'Order submitted for verification',
    'Our team will verify your delivery details',
    'Delivery in 2–4 business days',
    isPK ? 'Pay the delivery person on arrival' : 'Payment collected online',
  ];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
        <h1 className="text-2xl sm:text-3xl font-black text-green-600 mb-2">Order Pending Verification</h1>
        <p className="text-gray-500 mb-6">Thank you for choosing MaestraVibe. We will confirm your order after verification.</p>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 text-left text-sm space-y-2 text-gray-700">
          {steps.map((s, i) => <p key={i} className="flex items-center gap-2"><CheckIco /> {s}</p>)}
        </div>
        <button onClick={onClose} className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black transition-all">Continue Shopping</button>
      </div>
    </div>
  );
}