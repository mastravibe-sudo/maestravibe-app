// app/api/ai-chat/route.ts
// ─── MaestraVibe AI Chat — Production Backend ─────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import type { AIChatRequest, AIChatResponse, Market, NormalizedProduct } from '@/types/ai';

import { detectIntent }                  from '@/lib/intent-detector';
import { buildSmartCatalog }             from '@/lib/product-search';
import { buildSystemPrompt }             from '@/lib/prompt-builder';
import { findKnowledgeMatch }            from '@/lib/knowledge-base';
import { normalizeUserInput }            from '@/lib/voice-normalizer';

// ── Constants ─────────────────────────────────────────────────────────────────
const GROQ_API_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL    = 'llama-3.1-8b-instant';
const MAX_TOKENS    = 400;
const TEMPERATURE   = 0.3;    // lower = more precise
const MAX_PRODUCTS  = 80;     // max products sent to catalog
const MAX_HISTORY   = 8;      // last N messages sent to LLM
const MAX_MSG_LEN   = 500;    // per-message char limit
const UUID_REGEX    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPId(p: any): string {
  const raw = p?.id ?? p?._id ?? '';
  return typeof raw === 'string' ? raw.trim().slice(0, 36) : '';
}

function normalizeProduct(p: any): NormalizedProduct | null {
  const id = getPId(p);
  if (!id) return null;
  return {
    _id:         id,
    name:        String(p.name        ?? '').slice(0, 100).trim(),
    price:       Math.max(0, Number(p.price ?? 0)),
    category:    String(p.category    ?? '').slice(0, 50).trim(),
    description: String(p.description ?? '').slice(0, 200).trim(),
    images:      Array.isArray(p.images) ? p.images.slice(0, 3) : [],
    colors:      Array.isArray(p.colors) ? p.colors.slice(0, 10) : [],
    sizes:       Array.isArray(p.sizes)  ? p.sizes.slice(0, 10)  : [],
  };
}

function sanitizeOutput(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 2000)
    .trim();
}

function extractUUIDs(raw: string): string[] {
  const match = raw.match(/SUGGEST_IDS:\[([^\]]*)\]/);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => UUID_REGEX.test(s));
}

// ── Rate limiting (in-memory, per IP) ────────────────────────────────────────
// For production: replace with Redis-based rate limiter
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now     = Date.now();
  const window  = 60_000; // 1 minute
  const limit   = 30;     // 30 req/min per IP
  const entry   = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ── Validate request body ─────────────────────────────────────────────────────
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!Array.isArray(body?.messages)) return { valid: false, error: 'messages must be an array' };
  if (!Array.isArray(body?.products))  return { valid: false, error: 'products must be an array' };
  if (body.messages.length === 0)      return { valid: false, error: 'messages array is empty' };
  if (!['pk', 'us'].includes(body.market ?? 'pk')) return { valid: false, error: 'invalid market' };
  return { valid: true };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY not configured');
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: AIChatRequest & { market?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const { valid, error: validErr } = validateRequest(body);
  if (!valid) return NextResponse.json({ error: validErr }, { status: 400 });

  const market: Market = (body.market as Market) ?? 'pk';

  // ── Normalize products ────────────────────────────────────────────────────
  const products: NormalizedProduct[] = (body.products || [])
    .map(normalizeProduct)
    .filter((p): p is NormalizedProduct => p !== null)
    .slice(0, MAX_PRODUCTS);

  // ── Get last user message ─────────────────────────────────────────────────
  const rawUserText = body.messages
    .filter((m) => m.role === 'user')
    .at(-1)?.content ?? '';

  const userText = normalizeUserInput(rawUserText).slice(0, MAX_MSG_LEN);

  if (!userText) {
    return NextResponse.json({ error: 'Empty user message' }, { status: 400 });
  }

  // ── Step 1: Check knowledge base first (for FAQ-type queries) ────────────
  const knowledgeAnswer = findKnowledgeMatch(userText, market);

  // ── Step 2: Detect intent ─────────────────────────────────────────────────
  const intent = detectIntent(userText, market);

  // ── Step 3: Build smart product catalog ──────────────────────────────────
  const { catalog, topResults } = buildSmartCatalog(
    products,
    intent,
    userText,
    market
  );

  // ── Step 4: Build system prompt ───────────────────────────────────────────
  const systemPrompt = buildSystemPrompt({
    market,
    intent,
    catalog,
    topResultsLen: topResults.length,
  });

  // If knowledge base has an answer AND it's a pure FAQ query (no product search needed),
  // we still send to LLM so it can personalize, but we inject the knowledge as context
  const knowledgeInjection = knowledgeAnswer
    ? `\n\n📚 KNOWLEDGE BASE ANSWER (use this if relevant):\n${knowledgeAnswer}`
    : '';

  // ── Step 5: Prepare messages for Groq ────────────────────────────────────
  const conversationHistory = body.messages
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role:    m.role,
      content: String(m.content).slice(0, MAX_MSG_LEN),
    }));

  // ── Step 6: Call Groq API ─────────────────────────────────────────────────
  let groqResponse: Response;
  try {
    groqResponse = await fetch(GROQ_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        max_tokens:  MAX_TOKENS,
        temperature: TEMPERATURE,
        messages: [
          {
            role:    'system',
            content: systemPrompt + knowledgeInjection,
          },
          ...conversationHistory,
        ],
      }),
    });
  } catch (fetchErr: any) {
    console.error('❌ Groq fetch error:', fetchErr.message);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 503 }
    );
  }

  // ── Step 7: Handle Groq errors ────────────────────────────────────────────
  if (!groqResponse.ok) {
    const errText = await groqResponse.text().catch(() => 'Unknown error');
    console.error(`❌ Groq API error ${groqResponse.status}:`, errText);

    if (groqResponse.status === 429) {
      return NextResponse.json(
        { error: 'AI is busy, please try again in a moment' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `AI service error: ${groqResponse.status}` },
      { status: groqResponse.status }
    );
  }

  // ── Step 8: Parse Groq response ───────────────────────────────────────────
  let groqData: any;
  try {
    groqData = await groqResponse.json();
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
  }

  const fullText: string = groqData.choices?.[0]?.message?.content ?? '';
  if (!fullText) {
    return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
  }

  // ── Step 9: Extract product IDs ───────────────────────────────────────────
  const suggestedIds = extractUUIDs(fullText);

  // Validate IDs against actual product list
  const productIdSet = new Set(products.map((p) => p._id));
  const validatedIds = suggestedIds
    .filter((id) => productIdSet.has(id))
    .slice(0, 3);

  // ── Step 10: Clean message ────────────────────────────────────────────────
  const message = sanitizeOutput(
    fullText.replace(/SUGGEST_IDS:\[[^\]]*\]/g, '').trim()
  );

  // ── Step 11: Return response ──────────────────────────────────────────────
  const response: AIChatResponse = {
    message,
    suggestedProductIds: validatedIds,
    intent: intent.type,
    // Only include debug in dev
    ...(process.env.NODE_ENV === 'development' && {
      debugInfo: {
        intentType:       intent.type,
        intentConfidence: intent.confidence,
        entities:         intent.entities,
        topResultsCount:  topResults.length,
        validatedIds,
        knowledgeHit:     !!knowledgeAnswer,
        groqTokensUsed:   groqData.usage?.total_tokens,
      },
    }),
  };

  return NextResponse.json(response);
}
