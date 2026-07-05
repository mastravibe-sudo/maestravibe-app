// components/admin/shared.tsx
export const INPUT = 'w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 transition-colors bg-white';

export const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700 border border-blue-200',
  pending:   'bg-amber-100 text-amber-700 border border-amber-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  delivered: 'bg-teal-100 text-teal-700 border border-teal-200',
  read:      'bg-gray-100 text-gray-600 border border-gray-200',
  replied:   'bg-purple-100 text-purple-700 border border-purple-200',
  not_submitted: 'bg-gray-100 text-gray-500 border border-gray-200',
  submitted:      'bg-blue-100 text-blue-700 border border-blue-200',
  shipped:        'bg-teal-100 text-teal-700 border border-teal-200',
};

export function sanitizeFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  const ext  = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
  const safe = base
    .replace(/[^\x00-\x7F]/g, '_').replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'image';
  return `${safe}${ext}`;
}

export function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export function Ico({ d, cls = 'w-4 h-4' }: { d: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
export function SpinnerIcon() {
  return <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />;
}

export const RefreshIcon  = () => <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />;
export const CloseIcon    = () => <Ico d="M6 18L18 6M6 6l12 12" />;
export const UploadIcon   = () => <Ico cls="w-8 h-8 text-gray-300" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
export const EditIcon     = () => <Ico cls="w-3.5 h-3.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;
export const TrashIcon    = () => <Ico cls="w-3.5 h-3.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;
export const LogoutIcon   = () => <Ico d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />;
export const EmailIcon    = () => <Ico d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
export const PlusIcon     = () => <Ico d="M12 4v16m8-8H4" />;
export const ProductsIco  = () => <Ico d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />;
export const OrdersIco    = () => <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />;
export const SubsIco      = () => <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
export const SubmitIco    = () => <Ico d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4z" />;
export const HomeIco      = () => <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
export const AccountsIco  = () => <Ico d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3.13a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 100-8" />;
export const FestIco      = () => <Ico d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
export const LayersIco    = () => <Ico cls="w-3.5 h-3.5" d="M12 4l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z" />;
export const CJIco        = () => <Ico d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;