// components/supplier/CnicUpload.tsx
'use client';
// Drop into the SUPPLIER dashboard (Account Settings / Verification tab):  <CnicUpload />

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, CreditCard, Loader2, ShieldCheck, Upload, XCircle } from 'lucide-react';

type Side = 'front' | 'back';
type Doc = { kind: 'cnic_front' | 'cnic_back'; status: 'pending' | 'approved' | 'rejected'; size_bytes: number; review_note?: string | null };

const ACCEPT = 'image/jpeg,image/png,image/webp';

// Phone photos can be 5 MB+, and the server accepts ~4 MB. Shrink in the browser first;
// the server then compresses again to 200 KB or less.
async function downscale(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the image');
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not process the image'))), 'image/jpeg', 0.85));
}

function Slot({ side, doc, onDone }: { side: Side; doc?: Doc; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!ACCEPT.split(',').includes(file.type)) { setError('Only a JPG, PNG or WEBP photo of your CNIC is allowed.'); return; }
    setBusy(true);
    try {
      const blob = await downscale(file);
      const fd = new FormData();
      fd.append('side', side);
      fd.append('file', blob, `${side}.jpg`);
      const res = await fetch('/api/supplier/cnic', { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Upload failed');
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const badge =
    doc?.status === 'approved' ? { Icon: CheckCircle2, cls: 'text-emerald-600', text: 'Approved' }
    : doc?.status === 'rejected' ? { Icon: XCircle, cls: 'text-rose-600', text: 'Rejected' }
    : doc ? { Icon: Clock, cls: 'text-amber-600', text: 'Waiting for review' } : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-violet-600" aria-hidden="true" />
        <h3 className="font-semibold text-gray-900">CNIC {side === 'front' ? 'Front' : 'Back'}</h3>
      </div>

      {badge ? (
        <p className={`flex items-center gap-1.5 text-sm font-medium ${badge.cls}`}>
          <badge.Icon className="w-4 h-4" aria-hidden="true" /> {badge.text}
          <span className="text-gray-500 font-normal">&middot; saved at {Math.round((doc?.size_bytes ?? 0) / 1024)} KB</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">Not uploaded yet.</p>
      )}
      {doc?.status === 'rejected' && doc.review_note && <p className="text-sm text-rose-600">Reason: {doc.review_note}</p>}

      <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" id={`cnic-${side}`} onChange={(e) => pick(e.target.files?.[0])} />
      <label
        htmlFor={`cnic-${side}`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 min-h-11 text-sm font-semibold cursor-pointer ${
          busy ? 'bg-gray-200 text-gray-500 pointer-events-none' : 'bg-violet-600 text-white hover:bg-violet-700'
        }`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Upload className="w-4 h-4" aria-hidden="true" />}
        {doc ? 'Replace photo' : 'Choose CNIC photo'}
      </label>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

export default function CnicUpload() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const load = useCallback(() => {
    fetch('/api/supplier/cnic', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { documents: [] }))
      .then((d) => setDocs(d.documents ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <ShieldCheck className="w-5 h-5 text-violet-600 shrink-0" aria-hidden="true" />
        <p>
          Upload clear photos of the front and back of your CNIC. Only CNIC images are accepted. Photos are
          automatically reduced to 200 KB or less and stored privately; only our admin team can view them.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slot side="front" doc={docs.find((d) => d.kind === 'cnic_front')} onDone={load} />
        <Slot side="back" doc={docs.find((d) => d.kind === 'cnic_back')} onDone={load} />
      </div>
    </section>
  );
}