'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceChatReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
  speechSupported: boolean;
  /** ALWAYS FALSE in offline mode. Voice requires internet for speech recognition. */
  requiresInternet: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

/**
 * Voice chat hook.
 * WARNING: SpeechRecognition sends audio to Google servers -- requires internet.
 * speechSynthesis may work offline if voices are pre-installed, but is unreliable.
 * This hook is DISABLED by default and clearly marked as online-only.
 */
export function useVoiceChat(): UseVoiceChatReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const supported = typeof window !== 'undefined' && !!SpeechRecognition;
  const speechSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find((v) => v.lang.startsWith('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    supported: false, // Always false -- voice requires internet
    speechSupported: false,
    requiresInternet: true,
    startListening: () => {},
    stopListening: () => {},
    speak: () => {},
    stopSpeaking: () => {},
  };

  // Original implementation below -- DISABLED for offline-only mode
  // To re-enable, remove the return above and uncomment below
  /*
  return {
    isListening,
    isSpeaking,
    transcript,
    supported,
    speechSupported,
    requiresInternet: true,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
  */
}
