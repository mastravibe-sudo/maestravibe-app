
export async function generateSpeech(text: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  const voiceId = "pNInz6obpgDQGcFmaJgB";

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error("ElevenLabs TTS failed");
  }

  const audioBlob = await res.blob();
  return URL.createObjectURL(audioBlob);
}