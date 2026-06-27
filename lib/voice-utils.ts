// lib/voice-utils.ts  — REPLACE your existing file with this
// Handles: ElevenLabs TTS (primary) + Browser TTS (fallback) + STT

// ── Types ──────────────────────────────────────────────────────────────────────
interface SpeakOptions {
  language?: string;
  rate?:     number;
  pitch?:    number;
  volume?:   number;
  onEnd?:    () => void;
  onError?:  (e: string) => void;
}

// ── Active audio tracker ───────────────────────────────────────────────────────
let activeAudio: HTMLAudioElement | null = null;

// ── Stop all speech (ElevenLabs + browser) ────────────────────────────────────
export function stopAllSpeech(): void {
  // Stop ElevenLabs audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  // Stop browser TTS
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ── ElevenLabs TTS (primary) ──────────────────────────────────────────────────
async function speakWithElevenLabs(
  text: string,
  options: SpeakOptions = {}
): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text }),
    });

    if (!res.ok) {
      console.warn("ElevenLabs TTS failed:", res.status);
      return false;
    }

    const audioBlob = await res.blob();
    const audioUrl  = URL.createObjectURL(audioBlob);
    const audio     = new Audio(audioUrl);
    activeAudio     = audio;

    audio.volume = options.volume ?? 1.0;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      activeAudio = null;
      options.onEnd?.();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      activeAudio = null;
      options.onError?.("ElevenLabs playback error");
    };

    await audio.play();
    return true;
  } catch (err) {
    console.warn("ElevenLabs error:", err);
    return false;
  }
}

// ── Browser TTS (fallback) ────────────────────────────────────────────────────
function speakWithBrowser(text: string, options: SpeakOptions = {}): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance  = new SpeechSynthesisUtterance(text);
  utterance.lang   = options.language ?? "en-US";
  utterance.rate   = options.rate     ?? 1.0;
  utterance.pitch  = options.pitch    ?? 1.0;
  utterance.volume = options.volume   ?? 1.0;

  utterance.onend   = () => options.onEnd?.();
  utterance.onerror = (e) => options.onError?.(e.error);

  window.speechSynthesis.speak(utterance);
}

// ── Main speakText function ───────────────────────────────────────────────────
// Tries ElevenLabs first, falls back to browser TTS if it fails
export function speakText(
  text: string,
  options: SpeakOptions = {}
): (() => void) {
  stopAllSpeech();

  // Try ElevenLabs, fallback to browser
  speakWithElevenLabs(text, options).then((success) => {
    if (!success) {
      console.info("Falling back to browser TTS");
      speakWithBrowser(text, options);
    }
  });

  // Return stop function
  return () => stopAllSpeech();
}

// ── Availability checks ───────────────────────────────────────────────────────
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function isTextToSpeechAvailable(): boolean {
  // Always true — either ElevenLabs or browser TTS will work
  return typeof window !== "undefined";
}

// ── Voice recognition (STT) — unchanged ──────────────────────────────────────
export function startVoiceRecognition(
  onInterim:  (text: string) => void,
  onError:    (error: string) => void,
  onFinal?:   (text: string) => void,
  onEnd?:     () => void,
  options:    { language?: string } = {}
): () => void {
  if (typeof window === "undefined") return () => {};

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("not-supported");
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.lang          = options.language ?? "en-US";
  recognition.continuous    = false;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript   = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript) onInterim(interimTranscript);
    if (finalTranscript)   (onFinal ?? onInterim)(finalTranscript);
  };

  recognition.onerror = (event: any) => onError(event.error);
  recognition.onend   = () => onEnd?.();

  recognition.start();
  return () => recognition.stop();
}
