'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'maestravibe-pwa-dismissed-until';
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIOSSafari() {
  const userAgent = window.navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|OPiOS|EdgiOS/.test(userAgent);
  return ios && !otherBrowser;
}

function wasDismissed() {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

export default function PwaInstallPrompt() {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [iosSafari, setIosSafari] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      setVisible(false);
      return;
    }

    const media = window.matchMedia('(max-width: 767px)');
    const updateDevice = () => {
      const isMobile = media.matches;
      const standalone = isStandalone();
      const ios = isIOSSafari();
      setMobile(isMobile);
      setIosSafari(ios);
      setVisible(isMobile && !standalone && !wasDismissed() && ios);
    };

    updateDevice();
    media.addEventListener('change', updateDevice);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      if (!isStandalone() && !wasDismissed() && media.matches) setVisible(true);
    };
    const handleInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      media.removeEventListener('change', updateDevice);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [pathname]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_FOR_MS)); } catch { /* storage may be unavailable */ }
    setVisible(false);
    setShowInstructions(false);
  };

  const install = async () => {
    if (iosSafari) {
      setShowInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  if (!mobile || !visible) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-[60] flex items-center gap-3 rounded-2xl border border-violet-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md sm:left-auto sm:max-w-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-lg font-black text-white">MV</div>
        <button type="button" onClick={install} className="min-h-11 min-w-0 flex-1 text-left text-sm font-bold text-gray-900">
          Add MaestraVibe to your home screen
        </button>
        <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="min-h-11 min-w-11 rounded-xl text-xl text-gray-500 hover:bg-gray-100">×</button>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black text-gray-900">Install MaestraVibe</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Tap Share, then Add to Home Screen to install MaestraVibe.</p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowInstructions(false)} className="min-h-11 flex-1 rounded-xl border-2 border-gray-200 px-4 text-sm font-bold text-gray-700">Close</button>
              <button type="button" onClick={dismiss} className="min-h-11 flex-1 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
