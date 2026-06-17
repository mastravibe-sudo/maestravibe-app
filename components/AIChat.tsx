'use client';

import { useState, useRef, useEffect } from 'react';
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
}

export default function AIChat({ products, onOpenProduct }: AIChatProps) {
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
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          products,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Chat failed');
      }

      const data = await response.json();
      const assistantText = data.message || 'Maafi chahta hoon, kuch masla hua. Dobara try karein.';

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
      if (hasTextToSpeech && input) {
        ttsStopRef.current = speakText(assistantText, {
          language: 'ur-PK',
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
        className="fixed bottom-6 right-6 z-90 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
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
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-95 w-full md:w-96 h-dvh md:h-150 bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-rose-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm">MaestraVibe AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-rose-100 text-xs">Online — Madad ke liye taiyaar</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white/80 hover:text-white transition"
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
            <div className="bg-gray-50 border-b border-gray-100 p-3 text-sm space-y-2">
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
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition text-gray-700 font-medium flex items-center gap-2"
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
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition text-red-600 font-medium flex items-center gap-2"
              >
                <span>🗑️</span> Clear History
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-rose-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Suggested products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-gray-500 font-medium px-1">Suggested Products:</p>
                      {msg.products.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            onOpenProduct(p);
                          }}
                          className="flex items-center gap-3 w-full bg-white border border-gray-100 rounded-2xl p-2.5 hover:border-rose-300 hover:shadow-md transition-all text-left group"
                        >
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                              🛍️
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-rose-600 transition">
                              {p.name}
                            </p>
                            <p className="text-rose-600 font-black text-sm mt-0.5">
                              Rs. {p.price.toLocaleString()}
                            </p>
                          </div>
                          <svg
                            className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {interimVoice && voiceActive && (
              <div className="flex justify-end">
                <div className="bg-rose-100 border border-rose-200 rounded-2xl rounded-br-sm px-4 py-2 text-xs text-rose-700 italic">
                  🎤 {interimVoice}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick questions (only at start) */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="shrink-0 text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full font-medium hover:bg-rose-100 transition whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0 space-y-2">
            {voiceActive && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-700">
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
                className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 transition"
              />

              {hasVoice && (
                <button
                  onClick={voiceActive ? stopListening : startListening}
                  className={`${
                    voiceActive ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                  } text-white rounded-full w-10 h-10 flex items-center justify-center transition shrink-0`}
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
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center transition shrink-0"
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
