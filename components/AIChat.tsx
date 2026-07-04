'use client';

import { useState, useRef, useEffect } from 'react';
import { useMarket } from '@/lib/market-context';
import {
  saveChatMessage,
  getCurrentChatSession,
  startNewChatSession,
  clearAllChatHistory,
  getUserPreferences,
  saveUserPreferences,
} from '@/lib/chat-storage';
import {
  isSpeechRecognitionAvailable,
  isTextToSpeechAvailable,
  startVoiceRecognition,
  speakText,
  stopAllSpeech,
} from '@/lib/voice-utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSuggestion[];
  timestamp?: number;
}

interface ProductSuggestion {
  description: string;
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface AIChatProps {
  products: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    description: string;
    colors: string[];
    sizes: string[];
  }[];
  onOpenProduct: (product: any) => void;
  onAddToCart?: (product: any) => void;
  pageContext?: string;
  cartItems?: Array<{ name: string; price: number; qty: number }>;
}

export default function AIChat({ products, onOpenProduct, onAddToCart, pageContext = '', cartItems = [] }: AIChatProps) {
  const { market } = useMarket();
  const isPK = market === 'pk';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Assalam o Alaikum! 👋 Main MaestraVibe ka AI assistant hoon. Aap mujhse kuch bhi pooch sakte hain — products, delivery, sizing, ya koi bhi masla. Main aapki madad karoonga! 🛍️',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);
  const [interimVoice, setInterimVoice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const [hasTextToSpeech, setHasTextToSpeech] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceStopRef = useRef<(() => void) | null>(null);
  const ttsStopRef = useRef<(() => void) | null>(null);

  // Initialize voice capabilities and load chat history
  useEffect(() => {
    setHasVoice(isSpeechRecognitionAvailable());
    setHasTextToSpeech(isTextToSpeechAvailable());

    // Load chat history from local storage
    const session = getCurrentChatSession();
    if (session && session.messages.length > 0) {
      const loadedMessages: Message[] = session.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));
      setMessages(loadedMessages);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setInput('');
    setInterimVoice('');

    const userMessage: Message = {
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveChatMessage(userText, 'user');
    const existingPrefs = getUserPreferences();
    const extractedCategories = products
      .filter((p) => [p.name, p.category, p.description].some((field) => field?.toLowerCase().includes(userText.toLowerCase())))
      .map((p) => p.category)
      .filter(Boolean);
    saveUserPreferences({
      preferredCategories: Array.from(new Set([...(existingPrefs.preferredCategories ?? []), ...extractedCategories])).slice(0, 5),
      lastSearchTerms: Array.from(new Set([...(existingPrefs.lastSearchTerms ?? []), userText])).slice(-8),
    });
    setLoading(true);

    try {
      const userPrefs = getUserPreferences();
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          products,
          market,
          pageContext,
          cartItems,
          userPrefs,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Chat failed');
      }

      const data = await response.json();
      const rawAssistantText = data.message || 'Maafi chahta hoon, kuch masla hua. Dobara try karein.';
      const assistantText = rawAssistantText
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/(^|\n)\s*[-*•]+\s*/g, '$1')
        .replace(/(^|\n)\s*\d+\.\s*/g, '$1')
        .trim();

      // Find suggested products
      const suggestedProducts: ProductSuggestion[] = (
        data.suggestedProductIds || []
      )
        .map((id: string) => products.find((p) => p._id === id))
        .filter(Boolean);

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantText,
        products: suggestedProducts.length > 0 ? suggestedProducts : undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      saveChatMessage(assistantText, 'assistant');
      if (!open) setUnread((u) => u + 1);

      // Optional: Speak the response
      if (hasTextToSpeech) {
        ttsStopRef.current = speakText(assistantText, {
          language: isPK ? 'ur-PK' : 'en-US',
          rate: isPK ? 0.95 : 1.05,
          pitch: isPK ? 0.95 : 1.0,
          onEnd: () => {
            ttsStopRef.current = null;
          },
        });
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Internet connection check karein aur dobara try karein. 🙏';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMsg,
          timestamp: Date.now(),
        },
      ]);
      saveChatMessage(errorMsg, 'assistant');
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (voiceActive) return;

    setVoiceActive(true);
    setInterimVoice('');

    voiceStopRef.current = startVoiceRecognition(
      (transcript) => {
        setInterimVoice(transcript);
        setInput(transcript);
      },
      (error) => {
        setVoiceActive(false);
        if (error !== 'no-speech') {
          alert(`Voice error: ${error}`);
        }
      },
      undefined,
      () => {
        setVoiceActive(false);
      },
      { language: 'ur-PK' }
    );
  };

  const stopListening = () => {
    if (voiceStopRef.current) {
      voiceStopRef.current();
      voiceStopRef.current = null;
    }
    setVoiceActive(false);
  };

  const quickQuestions = [
    '🎁 Naye products kya hain?',
    '📦 Delivery kitne din mein?',
    '💰 Sasta acha product chahiye',
    '👗 Women ke liye best kya hai?',
    '🔄 Return policy kya hai?',
  ];

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-90 bg-[#F2A33C] hover:bg-[#d6942f] text-[#1F2345] rounded-full w-14 h-14 flex items-center justify-center shadow-[0_24px_48px_rgba(242,163,60,0.22)] transition-all hover:scale-110 active:scale-95"
        title="AI Assistant se poochein"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-95 w-full md:w-96 h-dvh md:h-150 bg-[#F7EFE8] md:rounded-[32px] shadow-[0_32px_80px_rgba(33,34,56,0.18)] flex flex-col overflow-hidden ring-1 ring-[#E9D6C6]">
          {/* Header */}
          <div className="bg-[#1F2345] px-4 py-3 flex items-center justify-between shrink-0 ring-1 ring-[#3C3F65]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F2A33C] rounded-full flex items-center justify-center text-lg shadow-[0_0_0_8px_rgba(242,163,60,0.16)]">
                🤖
              </div>
              <div>
                <p className="text-[#F7EFE8] font-semibold text-sm tracking-tight">MaestraVibe AI</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#8DCB8A] rounded-full animate-pulse" />
                  <p className="text-[#D8C6B1] text-xs">Online — madad ke liye taiyaar</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-[#D8C6B1] hover:text-white transition"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-[#FBF5EE] border-b border-[#E9D6C6] p-3 text-sm space-y-2">
              <button
                onClick={() => {
                  startNewChatSession();
                  setMessages([
                    {
                      role: 'assistant',
                      content: 'Naya chat session start ho gya! 👋 Kya main aapki madad kar sakta hoon?',
                      timestamp: Date.now(),
                    },
                  ]);
                  setShowSettings(false);
                }}
                className="w-full text-left px-3 py-2 rounded-2xl bg-white/90 hover:bg-white transition text-[#312D2A] font-medium flex items-center gap-2 ring-1 ring-[#E9D6C6]"
              >
                <span>🆕</span> New Chat
              </button>
              <button
                onClick={() => {
                  clearAllChatHistory();
                  setMessages([
                    {
                      role: 'assistant',
                      content: 'Chat history clear ho gyi. Fresh start! 🎉',
                      timestamp: Date.now(),
                    },
                  ]);
                  setShowSettings(false);
                }}
                className="w-full text-left px-3 py-2 rounded-2xl bg-[#FEEBE7] hover:bg-[#fde4de] transition text-[#B74C4A] font-medium flex items-center gap-2 ring-1 ring-[#F5D0CB]"
              >
                <span>🗑️</span> Clear History
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F0E8]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-[26px] text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#1F2345] text-[#F7EFE8] rounded-br-[12px] rounded-tl-[26px] rounded-tr-[26px]'
                        : 'bg-white text-[#312D2A] shadow-[0_18px_40px_rgba(47,35,31,0.08)] border border-[#E9D6C6] rounded-bl-[12px] rounded-tl-[26px] rounded-tr-[26px]'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Suggested products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center gap-2 px-1 pb-1">
                        <span className="w-10 h-0.5 bg-[#F2A33C] rounded-full block" />
                        <p className="text-xs text-[#6F5E4D] font-semibold uppercase tracking-[0.24em]">Suggested products</p>
                      </div>
                      <div className="grid gap-3">
                        {msg.products.map((p) => {
                          const fullP = products.find((fp) => fp._id === p._id);
                          const productToOpen = fullP || p;
                          return (
                            <div key={p._id} className="bg-white border border-[#E9D6C6] rounded-[28px] shadow-[0_18px_35px_rgba(47,35,31,0.06)] overflow-hidden">
                              <div className="grid grid-cols-[94px_minmax(0,1fr)] gap-3 p-3 items-start">
                                <div className="w-24 h-24 rounded-[24px] overflow-hidden bg-[#1F2345] shadow-inner">
                                  {p.images?.[0] ? (
                                    <img
                                      src={p.images[0]}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl text-[#D8C6B1]">
                                      🛍️
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-semibold text-[#1F2345] line-clamp-2">
                                      {p.name}
                                    </p>
                                    <span className="text-xs font-semibold bg-[#F2A33C] text-[#1F2345] px-2 py-1 rounded-full">
                                      {market === 'pk' ? `Rs ${p.price.toLocaleString()}` : `$${(p.price / 280).toFixed(2)}`}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#7C6A58] mt-2 line-clamp-2">
                                    {p.description || 'Product details available.'}
                                  </p>
                                  <div className="mt-3 flex items-center justify-between gap-2">
                                    <span className="text-[11px] uppercase tracking-[0.18em] text-[#A58D78]">
                                      {p.category || 'Category'}
                                    </span>
                                    <button
                                      onClick={() => onOpenProduct(productToOpen)}
                                      className="text-[11px] text-[#1F2345] font-semibold uppercase tracking-[0.18em]"
                                    >
                                      View item
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {fullP && onAddToCart && (
                                <div className="border-t border-[#E9D6C6] bg-[#FBF5EE] p-3 flex gap-2">
                                  <button
                                    onClick={() => {
                                      onAddToCart(fullP);
                                      setMessages((prev) => [
                                        ...prev,
                                        {
                                          role: 'assistant',
                                          content: isPK ? `✅ ${p.name} cart mein add ho gaya!` : `✅ ${p.name} added to cart!`,
                                          timestamp: Date.now(),
                                        },
                                      ]);
                                    }}
                                    className="flex-1 text-xs bg-[#1F2345] text-[#F7EFE8] px-3 py-2 rounded-2xl hover:bg-[#252a49] transition font-semibold"
                                  >
                                    🛒 {isPK ? 'Cart mein add karo' : 'Add to cart'}
                                  </button>
                                  <button
                                    onClick={() => onOpenProduct(fullP)}
                                    className="flex-1 text-xs bg-[#F2A33C] text-[#1F2345] px-3 py-2 rounded-2xl hover:bg-[#d6942f] transition font-semibold"
                                  >
                                    {isPK ? 'Details dekho' : 'View details'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E9D6C6] rounded-3xl px-4 py-3 shadow-[0_12px_28px_rgba(47,35,31,0.08)]">
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2 h-2 bg-[#F2A33C] rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-[#F2A33C] rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-[#F2A33C] rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {interimVoice && voiceActive && (
              <div className="flex justify-end">
                <div className="bg-[#FBF5EE] border border-[#E9D6C6] rounded-3xl px-4 py-2 text-xs text-[#7C6A58] italic">
                  🎤 {interimVoice}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick questions (only at start) */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 bg-[#FBF5EE] border-t border-[#E9D6C6] flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="shrink-0 text-[11px] bg-[#1F2345] text-[#F7EFE8] px-3 py-2 rounded-full font-semibold hover:bg-[#252a49] transition whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-[#E9D6C6] shrink-0 space-y-2">
            {voiceActive && (
              <div className="bg-[#FBF5EE] border border-[#E9D6C6] rounded-lg px-3 py-2 text-xs text-[#7C6A58]">
                🎤 Listening...
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Kuch bhi poochein..."
                className="flex-1 border-2 border-[#E9D6C6] rounded-full px-4 py-3 text-sm bg-white text-[#312D2A] placeholder:text-[#A28F7D] focus:outline-none focus:border-[#F2A33C] transition"
              />

              {hasVoice && (
                <button
                  onClick={voiceActive ? stopListening : startListening}
                  className={`${
                    voiceActive ? 'bg-[#D54B4C] hover:bg-[#b54344]' : 'bg-[#F2A33C] hover:bg-[#d6942f]'
                  } text-[#1F2345] rounded-full w-10 h-10 flex items-center justify-center transition shrink-0`}
                  title={voiceActive ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {voiceActive ? (
                      <path d="M6 4h12v16H6z" />
                    ) : (
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                    )}
                  </svg>
                </button>
              )}

              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="bg-[#1F2345] hover:bg-[#252a49] disabled:bg-gray-200 disabled:text-gray-400 text-[#F7EFE8] rounded-full w-10 h-10 flex items-center justify-center transition shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
