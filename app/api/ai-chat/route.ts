import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, products } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build product catalog for AI context
    const productCatalog = (products || [])
      .slice(0, 100)
      .map(
        (p: any) =>
          `ID:${p._id} | ${p.name} | Rs.${p.price} | Category:${p.category} | Sizes:${(p.sizes || []).join(',')} | Colors:${(p.colors || []).join(',')} | ${p.description?.slice(0, 100) ?? ''}`
      )
      .join('\n');

    const systemPrompt = `You are MaestraVibe's friendly AI shopping assistant. MaestraVibe is a Pakistani online store based in Lahore.

STORE INFO:
- Name: MaestraVibe
- Location: Lahore, Pakistan
- Delivery: All over Pakistan, Free delivery on orders above Rs.1500
- Payment: Cash on Delivery (COD) - No advance payment required
- Return Policy: 7-day returns available
- WhatsApp Support: 03274050806
- Delivery Time: 2-4 business days
- Website: www.maestravibe.com

AVAILABLE PRODUCTS (${products?.length || 0} total):
${productCatalog}

YOUR RESPONSIBILITIES:
1. Listen to customer queries and provide helpful suggestions
2. Recommend products based on customer needs and preferences
3. When suggesting a product, ALWAYS use this exact format:
   [PRODUCT:product_id_here]
4. Be conversational and friendly, use casual Urdu/Roman Urdu mix
5. Provide prices, sizes, colors, and delivery information
6. Compare products if asked
7. If exact product not found, suggest alternatives
8. Ask clarifying questions to better understand needs
9. Remember: Customer asks "AI assistant" about gym equipment? Ask: "Dumbbells? Home workout equipment? Fitness accessories?"
10. Be helpful, not pushy

IMPORTANT:
- Respond in Urdu/Roman Urdu with English product names
- Use emojis to make it friendly
- Keep responses concise but helpful
- Always be honest if product not available`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json(
        { error: 'AI service error', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text || 'Maafi chahta hoon, kuch masla hua. Dobara try karein.';

    // Extract product suggestions
    const productMatches = [...assistantMessage.matchAll(/\[PRODUCT:([^\]]+)\]/g)];
    const suggestedProductIds = productMatches.map((m) => m[1].trim());

    // Clean the text
    const cleanText = assistantMessage
      .replace(/\[PRODUCT:[^\]]+\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({
      message: cleanText,
      suggestedProductIds,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
