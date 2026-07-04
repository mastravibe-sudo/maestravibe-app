// app/api/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'TTS not configured' }, { status: 500 });
    }

    const cleanText = text
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000);

    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Natural Urdu voice
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.88,
            style: 0.05,
            speed: 0.91,        // Important for clarity
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs Error:", err);
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
  }
}