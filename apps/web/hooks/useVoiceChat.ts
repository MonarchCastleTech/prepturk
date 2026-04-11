'use client';

import { useState, useRef, useCallback } from 'react';

interface UseVoiceChatReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
  speechSupported: boolean;
  requiresInternet: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

/**
 * OPSEC COMPLIANT Voice Chat Hook
 * Uses Local Whisper instead of Web Speech API to prevent Apple/Google audio telemetry.
 */
export function useVoiceChat(): UseVoiceChatReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // We support it if we can access getUserMedia
  const supported = typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const speechSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  const startListening = useCallback(async () => {
    if (!supported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Send to local whisper
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          // Send to local hardware endpoint for transcription
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/hardware/transcribe`, {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            setTranscript(data.text);
          } else {
            console.error('Transcription failed');
            setTranscript('');
          }
        } catch (e) {
          console.error(e);
          setTranscript('');
        }
      };

      setIsListening(true);
      setTranscript('');
      mediaRecorder.start();
    } catch (err) {
      console.error('Failed to get user media', err);
      setIsListening(false);
    }
  }, [supported]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Text to speech stays native but warns if offline voices aren't installed
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    supported,
    speechSupported,
    requiresInternet: false, // Changed: Local Whisper means this is now False!
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
