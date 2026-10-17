// components/supplier/AvatarUpload.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Store } from 'lucide-react';

async function downscale(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the image');
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not process the image'))), 'image/jpeg', 0.85));
}

export default function AvatarUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/supplier/avatar', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setUrl(d.avatar_url); setName(d.name); } })
      .catch(() => {});
  }, []);

  const pick = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Choose a JPG, PNG or WEBP image.'); return; }
    setBusy(true);
    try {
      const blob = await downscale(file);
      const fd = new FormData();
      fd.append('file', blob, 'avatar.jpg');
      const res = await fetch('/api/supplier/avatar', { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Upload failed');
      setUrl(d.avatar_url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Profile picture" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
        ) : (
          <span className="grid place-items-center w-20 h-20 rounded-full bg-violet-100 text-violet-700"><Store className="w-8 h-8" aria-hidden="true" /></span>
        )}
        <input ref={inputRef} id="avatar-input" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        <label htmlFor="avatar-input" className="absolute -bottom-1 -right-1 grid place-items-center w-9 h-9 rounded-full bg-violet-600 text-white cursor-pointer shadow" aria-label="Change profile picture">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Camera className="w-4 h-4" aria-hidden="true" />}
        </label>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate">{name || 'Your store'}</p>
        <p className="text-sm text-gray-500">Shown next to your products.</p>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
}