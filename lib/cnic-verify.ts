// lib/cnic-verify.ts
// OPTIONAL second check: asks a vision model whether the image is a Pakistani CNIC.
// OFF by default. Enable with CNIC_AI_CHECK=on and ANTHROPIC_API_KEY (optional CNIC_AI_MODEL).
// NOTE: when ON, the CNIC photo is sent to a third-party API. Mention this in your privacy policy.
// It never asks the model to read or return the CNIC number.

const PROMPT =
  'You are screening an upload on a marketplace. Does this image show a Pakistani national identity card ' +
  '(CNIC / NICOP), front or back, photographed or scanned? Do NOT read or repeat any numbers or names. ' +
  'Reply with ONLY this JSON: {"is_cnic": true} or {"is_cnic": false}';

export async function verifyCnicWithAI(jpeg: Buffer): Promise<{ checked: boolean; ok: boolean }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (process.env.CNIC_AI_CHECK !== 'on' || !key) return { checked: false, ok: true };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.CNIC_AI_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: jpeg.toString('base64') } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { checked: false, ok: true }; // API problem: fall back to manual admin review
    const data = await res.json();
    const text: string = (data.content ?? []).map((b: any) => b.text ?? '').join('');
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    if (json.is_cnic === false) return { checked: true, ok: false };
    return { checked: true, ok: json.is_cnic === true };
  } catch {
    return { checked: false, ok: true };
  }
}