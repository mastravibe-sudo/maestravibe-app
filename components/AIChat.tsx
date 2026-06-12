'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSuggestion[];
}

interface ProductSuggestion {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface AIChatProps {
  products: { _id: string; name: string; price: number; images: string[]; category: string; description: string; colors: string[]; sizes: string[] }[];
  onOpenProduct: (product: any) => void;
}

export default function AIChat({ products, onOpenProduct }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Assalam o Alaikum! 👋 Main MaestraVibe ka AI assistant hoon. Aap mujhse kuch bhi pooch sakte hain — products, delivery, sizing, ya koi bhi masla. Main aapki madad karoonga! 🛍️',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build product catalog summary for AI context
      const productCatalog = products.slice(0, 60).map(p =>
        `ID:${p._id} | ${p.name} | Rs.${p.price} | Category:${p.category} | ${p.description?.slice(0, 80) ?? ''}`
      ).join('\n');

      const systemPrompt = `Tu MaestraVibe ka helpful AI shopping assistant hai. MaestraVibe ek Pakistani online fashion store hai jo Lahore se operate karta hai.

STORE INFO:
- Name: MaestraVibe
- Delivery: Poore Pakistan mein, Rs.1500+ par free delivery
- Payment: Cash on Delivery (COD) — koi advance nahi
- Return Policy: 7 din ka return
- WhatsApp: 03274050806
- Delivery Time: 2-4 din

PRODUCTS (${products.length} total):
${productCatalog}

TERE KAAM:
1. Customer ki problem sun aur relevant products suggest kar
2. Agar customer ne health/pain issue bataya (back pain, knee pain, posture etc.) to comfort/support products suggest kar
3. Products suggest karte waqt EXACTLY yeh format use kar jab relevant product mile:
   [PRODUCT:product_id_here]
4. Urdu/Roman Urdu mein baat kar, friendly tone rakh
5. Prices batao, sizes guide karo, comparison karo agar pucha jaye
6. Agar koi product nahi mila to honestly batao aur alternatives suggest karo
7. Har response mein helpful raho, sales-y mat bano`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const rawText: string = data.content?.[0]?.text ?? 'Maafi chahta hoon, kuch masla hua. Dobara try karein.';

      // Extract product IDs from [PRODUCT:xxx] tags
      const productMatches = [...rawText.matchAll(/\[PRODUCT:([^\]]+)\]/g)];
      const suggestedIds = productMatches.map(m => m[1].trim());
      const cleanText = rawText.replace(/\[PRODUCT:[^\]]+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();

      const suggestedProducts: ProductSuggestion[] = suggestedIds
        .map(id => products.find(p => p._id === id))
        .filter(Boolean) as ProductSuggestion[];

      const assistantMsg: Message = {
        role: 'assistant',
        content: cleanText,
        products: suggestedProducts.length > 0 ? suggestedProducts : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (!open) setUnread(u => u + 1);

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Internet connection check karein aur dobara try karein. 🙏',
      }]);
    } finally {
      setLoading(false);
    }
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
        className="fixed bottom-6 right-6 z-[90] bg-rose-600 hover:bg-rose-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
        title="AI Assistant se poochein"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-[95] w-full md:w-96 h-[100dvh] md:h-[600px] bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="bg-rose-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="text-white font-bold text-sm">MaestraVibe AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-rose-100 text-xs">Online — Madad ke liye taiyaar</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                  {/* Bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Suggested products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-gray-500 font-medium px-1">Suggested Products:</p>
                      {msg.products.map(p => (
                        <button
                          key={p._id}
                          onClick={() => { onOpenProduct(p); }}
                          className="flex items-center gap-3 w-full bg-white border border-gray-100 rounded-2xl p-2.5 hover:border-rose-300 hover:shadow-md transition-all text-left group"
                        >
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">🛍️</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-rose-600 transition">{p.name}</p>
                            <p className="text-rose-600 font-black text-sm mt-0.5">Rs. {p.price.toLocaleString()}</p>
                          </div>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                    <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions (only at start) */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="shrink-0 text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full font-medium hover:bg-rose-100 transition whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Kuch bhi poochein..."
                className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 transition"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center transition shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}