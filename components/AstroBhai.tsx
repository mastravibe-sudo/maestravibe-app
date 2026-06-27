// components/AstroBhai.tsx — FIXED VERSION
// Key fixes:
// 1. Product card tap → onOpenProduct fires correctly
// 2. "Show me picture" → tells user to tap card
// 3. Removed all fake link generation
// 4. Better message rendering
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMarket } from '@/lib/market-context';
import {
  saveChatMessage,
  getCurrentChatSession,
  startNewChatSession,
  clearAllChatHistory,
} from '@/lib/chat-storage';
import {
  isSpeechRecognitionAvailable,
  isTextToSpeechAvailable,
  startVoiceRecognition,
  speakText,
  stopAllSpeech,
} from '@/lib/voice-utils';

// ── Types ──────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSuggestion[];
  timestamp?: number;
}

interface ProductSuggestion {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description?: string;
}

interface AstroBhaiProps {
  products: {
    id?: string;
    _id?: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    description: string;
    colors: string[];
    sizes: string[];
  }[];
  onOpenProduct?: (product: any) => void;
}

function getPId(p: any): string {
  const raw = p?.id || p?._id || '';
  return typeof raw === 'string' ? raw.slice(0, 36) : '';
}

function sanitize(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 2000);
}

// ── Astronaut SVG ──────────────────────────────────────────────
function AstronautSVG({ mood }: { mood: 'idle' | 'wave' | 'jump' | 'spin' }) {
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="40" cy="28" r="18" fill="#e8e8e8" stroke="#ccc" strokeWidth="1.5" />
      <circle cx="40" cy="28" r="13" fill="#b3d4ff" opacity="0.6" />
      <ellipse cx="35" cy="22" rx="4" ry="2.5" fill="white" opacity="0.5" transform="rotate(-20 35 22)" />
      <circle cx="35" cy="27" r="2" fill="#1a1a2e" />
      <circle cx="45" cy="27" r="2" fill="#1a1a2e" />
      <circle cx="35.7" cy="26.3" r="0.6" fill="white" />
      <circle cx="45.7" cy="26.3" r="0.6" fill="white" />
      <path d="M36 31 Q40 34 44 31" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="28" y="44" width="24" height="22" rx="8" fill="#f0f0f0" stroke="#ddd" strokeWidth="1" />
      <rect x="30" y="44" width="20" height="6" rx="3" fill="#e0e0e0" />
      <rect x="33" y="52" width="14" height="9" rx="3" fill="#ccc" />
      <circle cx="37" cy="56" r="1.5" fill="#ff6b6b" />
      <circle cx="40" cy="56" r="1.5" fill="#ffd93d" />
      <circle cx="43" cy="56" r="1.5" fill="#6bcb77" />
      <rect x="16" y="47" width="12" height="7" rx="3.5" fill="#f0f0f0" stroke="#ddd" strokeWidth="1" />
      <rect x="52" y="47" width="12" height="7" rx="3.5" fill="#f0f0f0" stroke="#ddd" strokeWidth="1" />
      <rect x="30" y="64" width="8" height="10" rx="4" fill="#e0e0e0" />
      <rect x="42" y="64" width="8" height="10" rx="4" fill="#e0e0e0" />
      <rect x="29" y="72" width="10" height="5" rx="2.5" fill="#ccc" />
      <rect x="41" y="72" width="10" height="5" rx="2.5" fill="#ccc" />
      <line x1="40" y1="10" x2="40" y2="4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="3" r="2" fill="#ff6b6b" />
      <circle cx="18" cy="18" r="1" fill="#ffd93d" opacity="0.8" />
      <circle cx="62" cy="15" r="1.2" fill="#ffd93d" opacity="0.9" />
      <circle cx="64" cy="35" r="0.8" fill="white" opacity="0.7" />
      <circle cx="16" cy="38" r="1" fill="white" opacity="0.6" />
    </svg>
  );
}

// ── Product Card ───────────────────────────────────────────────
// Standalone component so clicking always works
function ProductCard({
  product,
  isPK,
  formatPrice,
  onClick,
}: {
  product: ProductSuggestion;
  isPK: boolean;
  formatPrice: (p: number) => string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-3 w-full bg-indigo-900/60 border border-indigo-700 rounded-2xl p-2.5 hover:border-indigo-400 hover:bg-indigo-800/60 active:scale-98 transition-all text-left group cursor-pointer"
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-indigo-700 bg-indigo-800">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-indigo-100 line-clamp-2 group-hover:text-white transition">
          {product.name}
        </p>
        <p className="text-indigo-300 font-black text-sm mt-0.5">
          {formatPrice(product.price)}
        </p>
        {product.description && (
          <p className="text-indigo-500 text-xs mt-0.5 line-clamp-1">
            {product.description.slice(0, 55)}
          </p>
        )}
        {/* Clear CTA */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-indigo-400 group-hover:text-indigo-200 transition font-medium">
            {isPK ? '👆 Tap karo — photo & details dekhein' : '👆 Tap to view photos & details'}
          </span>
        </div>
      </div>

      <svg className="w-4 h-4 text-indigo-500 group-hover:text-indigo-300 shrink-0 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AstroBhai({ products, onOpenProduct }: AstroBhaiProps) {
  const { market } = useMarket();
  const isPK = market === 'pk';

  const formatPrice = useCallback((price: number): string => {
    try {
      const num = Number(price) || 0;
      if (isPK) return `Rs. ${num.toLocaleString('en-PK')}`;
      return `$${Math.ceil(num / 280).toLocaleString('en-US')}`;
    } catch {
      return isPK ? `Rs. ${price}` : `$${Math.ceil(Number(price) / 280)}`;
    }
  }, [isPK]);

  const [open,         setOpen]         = useState(false);
  const [mood,         setMood]         = useState<'idle' | 'wave' | 'jump' | 'spin'>('idle');
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [unread,       setUnread]       = useState(0);
  const [voiceActive,  setVoiceActive]  = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [ttsEnabled,   setTtsEnabled]   = useState(true);
  const [interimVoice, setInterimVoice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasSTT,       setHasSTT]       = useState(false);
  const [hasTTS,       setHasTTS]       = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const voiceStopRef = useRef<(() => void) | null>(null);
  const proactiveRef = useRef<NodeJS.Timeout | null>(null);

  const greeting = isPK
    ? 'Assalam o Alaikum! 👋 Main Astro Bhai hoon — MaestraVibe ka assistant! 🚀\n\nKya dhundh rahe hain aaj? Watches, shoes, headphones — bataein main abhi dikhaata hoon! 🛍️'
    : "Hey there! 👋 I'm Astro Bhai, your MaestraVibe shopping assistant! 🚀\n\nWhat are you looking for today? Tap a category or just tell me! 🛍️";

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    setHasSTT(isSpeechRecognitionAvailable());
    setHasTTS(isTextToSpeechAvailable());
    const session = getCurrentChatSession();
    if (session && session.messages.length > 0) {
      setMessages(
        session.messages.map((m) => ({
          role:      m.role,
          content:   m.content,
          timestamp: m.timestamp,
        }))
      );
    } else {
      setMessages([{ role: 'assistant', content: greeting, timestamp: Date.now() }]);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (open) {
      if (proactiveRef.current) clearTimeout(proactiveRef.current);
      return;
    }
    proactiveRef.current = setTimeout(() => {
      setMood('wave');
      setTimeout(() => setMood('idle'), 2000);
    }, 8000);
    return () => { if (proactiveRef.current) clearTimeout(proactiveRef.current); };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      setMood('jump');
      setTimeout(() => setMood('idle'), 600);
    } else {
      stopAllSpeech();
      setIsSpeaking(false);
    }
  }, [open]);

  const speak = useCallback((text: string) => {
    if (!hasTTS || !ttsEnabled) return;
    stopAllSpeech();
    setIsSpeaking(true);
    const clean = text
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[🚀🛍️👋✅❌📦💰🔄⌚👟🎁]/g, '')
      .replace(/SUGGEST_IDS:\[[^\]]*\]/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .trim();
    speakText(clean, {
      language: isPK ? 'ur-PK' : 'en-US',
      rate:     isPK ? 0.9 : 1.0,
      onEnd:    () => setIsSpeaking(false),
      onError:  () => setIsSpeaking(false),
    });
  }, [hasTTS, ttsEnabled, isPK]);

  const stopSpeaking = useCallback(() => {
    stopAllSpeech();
    setIsSpeaking(false);
  }, []);

  // ── Open product handler ───────────────────────────────────────
  const handleOpenProduct = useCallback((suggestionProduct: ProductSuggestion) => {
    // Find full product data
    const fullProduct = products.find((p) => getPId(p) === suggestionProduct._id);
    const productToOpen = fullProduct || suggestionProduct;

    if (onOpenProduct) {
      onOpenProduct(productToOpen);
      setOpen(false); // close chat to show product
    }
  }, [products, onOpenProduct]);

  // ── Send message ───────────────────────────────────────────────
  const send = useCallback(async (text?: string) => {
    const raw = (text ?? input).trim();
    const userText = raw.slice(0, 500);
    if (!userText || loading) return;

    setInput('');
    setInterimVoice('');
    stopSpeaking();

    const userMsg: Message = { role: 'user', content: userText, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatMessage(userText, 'user');
    setLoading(true);

    try {
      const safeProducts = products
        .map((p) => ({
          _id:         getPId(p),
          name:        String(p.name        || '').slice(0, 100),
          price:       Number(p.price       || 0),
          category:    String(p.category    || '').slice(0, 50),
          description: String(p.description || '').slice(0, 150),
          images:      Array.isArray(p.images) ? p.images.slice(0, 3) : [],
          colors:      Array.isArray(p.colors) ? p.colors.slice(0, 10) : [],
          sizes:       Array.isArray(p.sizes)  ? p.sizes.slice(0, 10) : [],
        }))
        .filter((p) => p._id);

      const res = await fetch('/api/ai-chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map((m) => ({
            role:    m.role,
            content: m.content.slice(0, 500),
          })),
          products: safeProducts,
          market,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data          = await res.json();
      const assistantText = sanitize(
        data.message || (isPK ? 'Maafi! Dobara try karein. 🙏' : 'Sorry, please try again! 🙏')
      );

      // Match suggested IDs to actual products
      const suggestedProducts: ProductSuggestion[] = (data.suggestedProductIds || [])
        .slice(0, 3)
        .map((id: string) => {
          if (typeof id !== 'string' || id.length < 5) return null;
          const found = products.find((p) => getPId(p) === id);
          if (!found) return null;
          return {
            _id:         getPId(found),
            name:        found.name,
            price:       found.price,
            images:      found.images,
            category:    found.category,
            description: found.description,
          };
        })
        .filter(Boolean) as ProductSuggestion[];

      const assistantMsg: Message = {
        role:      'assistant',
        content:   assistantText,
        products:  suggestedProducts.length > 0 ? suggestedProducts : undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      saveChatMessage(assistantText, 'assistant');
      if (!open) setUnread((u) => u + 1);
      speak(assistantText);
      setMood('spin');
      setTimeout(() => setMood('idle'), 700);

    } catch (err: any) {
      console.error('AstroBhai error:', err.message);
      const errMsg = isPK
        ? 'Maafi! Kuch masla hua. Thodi dair baad dobara try karein. 🙏'
        : 'Sorry! Something went wrong. Please try again shortly. 🙏';
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg, timestamp: Date.now() }]);
      speak(errMsg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, products, market, open, speak, isPK, stopSpeaking]);

  // ── Voice ──────────────────────────────────────────────────────
  const startListening = () => {
    if (voiceActive) return;
    stopSpeaking();
    setVoiceActive(true);
    voiceStopRef.current = startVoiceRecognition(
      (t) => { setInterimVoice(t); setInput(t); },
      (e) => { setVoiceActive(false); if (e !== 'no-speech') console.error('Voice error:', e); },
      undefined,
      () => setVoiceActive(false),
      { language: isPK ? 'ur-PK' : 'en-US' }
    );
  };

  const stopListening = () => {
    voiceStopRef.current?.();
    voiceStopRef.current = null;
    setVoiceActive(false);
  };

  const quickQuestions = isPK
    ? ['⌚ Watches dikhao', '👟 Shoes chahiye', '💰 2000 tak best?', '📦 Delivery kitne din?', '🔄 Return policy?']
    : ['⌚ Show me watches', '👟 Show me shoes', '💰 Best under $20?', '📦 Shipping time?', '🔄 Return policy?'];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-[90]">
        {unread > 0 && !open && (
          <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
            {unread}
          </div>
        )}
        {mood === 'wave' && !open && (
          <div className="absolute bottom-full right-0 mb-3 bg-white rounded-2xl rounded-br-none shadow-xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
            {isPK ? '👋 Kuch chahiye? Main hoon yahan!' : '👋 Need help finding something?'}
            <div className="absolute bottom-0 right-4 translate-y-full border-8 border-transparent border-t-white" />
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          title={isPK ? 'Astro Bhai se poochein' : 'Chat with Astro Bhai'}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 shadow-2xl hover:shadow-violet-400/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{
            animation:
              mood === 'idle' ? 'astro-float 3s ease-in-out infinite' :
              mood === 'wave' ? 'astro-wave 0.4s ease-in-out 3' :
              mood === 'jump' ? 'astro-jump 0.4s ease-out' :
              'astro-spin 0.7s ease-in-out',
          }}
        >
          <div className="w-12 h-12"><AstronautSVG mood={mood} /></div>
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-[95] w-full md:w-96 h-dvh md:h-[620px] bg-[#0d0d2b] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-indigo-800">

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ background: 'linear-gradient(135deg, #1a1a4e 0%, #2d2d7e 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center border-2 border-indigo-400 overflow-hidden">
                <AstronautSVG mood="idle" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Astro Bhai 🚀 {isPK ? '🇵🇰' : '🇺🇸'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-indigo-300 text-xs">{isPK ? 'Online — Madad ke liye!' : 'Online — Here to help!'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {hasTTS && (
                <button
                  onClick={() => { setTtsEnabled((v) => !v); if (isSpeaking) stopSpeaking(); }}
                  className={`p-1.5 rounded-lg transition ${ttsEnabled ? 'text-green-400' : 'text-indigo-500'}`}
                >
                  {ttsEnabled ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </button>
              )}
              {isSpeaking && (
                <button onClick={stopSpeaking} className="p-1.5 rounded-lg text-amber-400 animate-pulse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h12v16H6z" /></svg>
                </button>
              )}
              <button onClick={() => setShowSettings(!showSettings)} className="text-indigo-300 hover:text-white transition p-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button onClick={() => setOpen(false)} className="text-indigo-300 hover:text-white text-2xl leading-none transition">×</button>
            </div>
          </div>

          {/* Stars */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white" style={{
                width:     `${Math.random() * 2 + 1}px`,
                height:    `${Math.random() * 2 + 1}px`,
                top:       `${Math.random() * 100}%`,
                left:      `${Math.random() * 100}%`,
                opacity:   Math.random() * 0.6 + 0.2,
                animation: `twinkle ${Math.random() * 2 + 1.5}s ease-in-out infinite ${Math.random() * 2}s`,
              }} />
            ))}
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="bg-indigo-950 border-b border-indigo-800 p-3 text-sm space-y-1 relative z-10">
              <button onClick={() => { startNewChatSession(); setMessages([{ role: 'assistant', content: greeting, timestamp: Date.now() }]); setShowSettings(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-900 transition text-indigo-200 font-medium flex items-center gap-2">
                🆕 {isPK ? 'Naya Chat shuru karo' : 'Start New Chat'}
              </button>
              <button onClick={() => { clearAllChatHistory(); setMessages([{ role: 'assistant', content: greeting, timestamp: Date.now() }]); setShowSettings(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-900 transition text-red-400 font-medium flex items-center gap-2">
                🗑️ {isPK ? 'Chat history delete karo' : 'Clear Chat History'}
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-700 border border-indigo-500 flex items-center justify-center mr-2 shrink-0 mt-1 overflow-hidden">
                    <AstronautSVG mood="idle" />
                  </div>
                )}

                <div className={`max-w-[82%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                  {/* Message bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-indigo-900/80 text-indigo-100 border border-indigo-700 rounded-bl-sm'
                  }`}>
                    {msg.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                  </div>

                  {/* Listen button */}
                  {msg.role === 'assistant' && hasTTS && (
                    <button onClick={() => speak(msg.content)}
                      className="flex items-center gap-1 text-indigo-500 hover:text-indigo-300 text-xs px-1 transition">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                      {isPK ? 'Sunو' : 'Listen'}
                    </button>
                  )}

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 mt-1">
                      <p className="text-xs text-indigo-400 font-medium px-1">
                        {isPK ? '🛍️ Tap karo — full details & photos dekhein:' : '🛍️ Tap any card to view photos & details:'}
                      </p>
                      {msg.products.map((p) => (
                        <ProductCard
                          key={p._id}
                          product={p}
                          isPK={isPK}
                          formatPrice={formatPrice}
                          onClick={() => handleOpenProduct(p)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-indigo-700 border border-indigo-500 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
                  <AstronautSVG mood="idle" />
                </div>
                <div className="bg-indigo-900/80 border border-indigo-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Voice interim */}
            {interimVoice && voiceActive && (
              <div className="flex justify-end">
                <div className="bg-indigo-700/50 border border-indigo-600 rounded-2xl rounded-br-sm px-4 py-2 text-xs text-indigo-200 italic flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse shrink-0" />
                  {interimVoice}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick questions — show on fresh chat */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-indigo-950/80 border-t border-indigo-800 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 relative z-10">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="shrink-0 text-xs bg-indigo-800 text-indigo-200 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-700 hover:text-white transition whitespace-nowrap border border-indigo-700">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 bg-indigo-950/90 border-t border-indigo-800 shrink-0 space-y-2 relative z-10">
            {voiceActive && (
              <div className="bg-indigo-900 border border-indigo-600 rounded-lg px-3 py-2 text-xs text-indigo-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                {isPK ? 'Sun raha hoon — bolein...' : 'Listening — speak now...'}
              </div>
            )}
            {isSpeaking && (
              <div className="bg-indigo-900 border border-green-700 rounded-lg px-3 py-2 text-xs text-green-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {isPK ? 'Astro Bhai bol raha hai...' : 'Astro Bhai is speaking...'}
                </div>
                <button onClick={stopSpeaking} className="text-green-400 hover:text-white transition font-bold ml-2">
                  ■ {isPK ? 'Rokو' : 'Stop'}
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={isPK ? 'Kuch bhi poochein...' : 'Ask me anything...'}
                maxLength={500}
                autoComplete="off"
                className="flex-1 bg-indigo-900/80 border-2 border-indigo-700 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-indigo-400 focus:outline-none focus:border-indigo-400 transition"
              />
              {hasSTT && (
                <button onClick={voiceActive ? stopListening : startListening}
                  className={`${voiceActive ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-700 hover:bg-indigo-600'} text-white rounded-full w-10 h-10 flex items-center justify-center transition shrink-0`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {voiceActive
                      ? <path d="M6 4h12v16H6z" />
                      : <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                    }
                  </svg>
                </button>
              )}
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes astro-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes astro-wave  { 0%, 100% { transform: translateY(0px) rotate(0deg); } 25% { transform: translateY(-4px) rotate(-8deg); } 75% { transform: translateY(-4px) rotate(8deg); } }
        @keyframes astro-jump  { 0% { transform: translateY(0px); } 40% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
        @keyframes astro-spin  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes twinkle     { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
      `}</style>
    </>
  );
}
