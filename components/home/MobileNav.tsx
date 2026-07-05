// components/home/MobileNav.tsx
'use client';

interface MobileNavProps {
  cartCount: number;
  onHome: () => void;
  onShop: () => void;
  onCart: () => void;
}

export default function MobileNav({ cartCount, onHome, onShop, onCart }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 border-t border-gray-200 backdrop-blur-xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.25)]">
      <div className="grid grid-cols-4 px-2 py-2">
        <button onClick={onHome} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3"/></svg>
          Home
        </button>
        <button onClick={onShop} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/></svg>
          Shop
        </button>
        <button onClick={onCart} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z"/></svg>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black rounded-full min-w-[14px] h-[14px] px-1 flex items-center justify-center">{cartCount}</span>}
          </div>
          Cart
        </button>
        <button onClick={onCart} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/></svg>
          More
        </button>
      </div>
    </div>
  );
}