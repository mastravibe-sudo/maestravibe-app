/**
 * Voice/Speech Utilities
 * Handles voice recognition and text-to-speech
 */

export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

const defaultConfig: VoiceConfig = {
  language: 'ur-PK', // Urdu Pakistan
  continuous: false,
  interimResults: true,
};

/**
 * Check if browser supports Web Speech API
 */
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;

  return !!SpeechRecognition;
}

/**
 * Start voice recording and convert to text
 */
export function startVoiceRecognition(
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onStart?: () => void,
  onEnd?: () => void,
  config: VoiceConfig = defaultConfig
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Voice recognition not supported on this browser');
    return null;
  }

  const recognition = new SpeechRecognition();
  let finalTranscript = '';

  recognition.language = config.language || 'ur-PK';
  recognition.continuous = config.continuous || false;
  recognition.interimResults = config.interimResults !== false;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript) {
      onResult(interimTranscript);
    }
    if (finalTranscript) {
      onResult(finalTranscript.trim());
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  // Start recording
  try {
    recognition.start();
  } catch (error) {
    onError('Could not start recording');
    return null;
  }

  // Return stop function
  return () => {
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };
}

/**
 * Check if browser supports Text-to-Speech
 */
export function isTextToSpeechAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

/**
 * Speak text using browser's speech synthesis
 */
export function speakText(
  text: string,
  config: {
    language?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {}
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    config.onError?.('Text-to-speech not supported on this browser');
    return null;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.language = config.language || 'ur-PK';
    utterance.rate = config.rate || 1;
    utterance.pitch = config.pitch || 1;
    utterance.volume = config.volume || 1;

    utterance.onend = () => {
      config.onEnd?.();
    };

    utterance.onerror = (event: any) => {
      config.onError?.(event.error || 'Speech error');
    };

    window.speechSynthesis.speak(utterance);

    // Return function to stop speech
    return () => {
      window.speechSynthesis.cancel();
    };
  } catch (error) {
    config.onError?.('Error starting speech');
    return null;
  }
}

/**
 * Stop all speech
 */
export function stopAllSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return [];
  return window.speechSynthesis?.getVoices() || [];
}

/**
 * Find voice by language
 */
export function findVoiceByLanguage(language: string): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  return voices.find((v) => v.lang.startsWith(language)) || null;
}
