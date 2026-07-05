// components/home/icons.tsx
'use client';

export const Icon = ({ d, cls = 'w-5 h-5' }: { d: string; cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

export const CartIco   = ({ cls }: { cls?: string }) => <Icon cls={cls ?? 'w-5 h-5'} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />;
export const SearchIco = () => <Icon cls="w-4 h-4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
export const CloseIco  = () => <Icon cls="w-5 h-5" d="M6 18L18 6M6 6l12 12" />;
export const BackIco   = () => <Icon cls="w-5 h-5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />;
export const ChevR     = () => <Icon cls="w-4 h-4" d="M9 5l7 7-7 7" />;
export const ChevL     = () => <Icon cls="w-4 h-4" d="M15 19l-7-7 7-7" />;
export const CheckIco  = () => <Icon cls="w-4 h-4" d="M5 13l4 4L19 7" />;
export const StarIco   = () => <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>;
export const LocIco    = () => <Icon cls="w-4 h-4" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />;
export const SpinIco   = () => <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>;
export const EyeIco    = () => <Icon cls="w-4 h-4" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />;
export const HeartIco  = ({ filled }: { filled: boolean }) => filled
  ? <svg className="w-4 h-4 text-rose-500 fill-rose-500" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
  : <Icon cls="w-4 h-4 text-gray-400" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
export const FlashIco  = () => <Icon cls="w-4 h-4" d="M13 10V3L4 14h7v7l9-11h-7z" />;
export const FestIco   = () => <Icon cls="w-4 h-4" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
export const TruckIco  = () => <Icon cls="w-5 h-5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zm0 0l2-1h2l2-3V9l-2-2h-4v9z" />;
export const ShieldIco = () => <Icon cls="w-5 h-5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
export const TrendIco  = () => <Icon cls="w-5 h-5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;