// components/home/CountdownTimer.tsx
'use client';

import { useEffect, useState } from 'react';

export default function CountdownTimer({ endsAt, dark = true }: { endsAt: string; dark?: boolean }) {
  const calcRemaining = () => {
    const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
  };
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    setTime(calcRemaining());
    const id = window.setInterval(() => setTime(calcRemaining()), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={`text-sm font-black px-2.5 py-1.5 rounded-lg tabular-nums ${dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>{v}</span>
          {i < 2 && <span className={`font-black text-sm ${dark ? 'text-gray-900' : 'text-white'}`}>:</span>}
        </span>
      ))}
    </div>
  );
}