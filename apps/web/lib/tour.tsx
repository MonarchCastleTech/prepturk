'use client';

import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: "PrepTürk'e Hoş Geldiniz!",
    description: 'Sistem turu başlıyor. Neler yapabileceğinizi birlikte gösterelim.',
  },
  {
    id: 'search',
    title: 'Her Şeyi Arayabilirsiniz',
    description: 'Arama çubuğundan belgelere, rehberlere ve tüm bilgilere ulaşabilirsiniz.',
    targetSelector: '[data-tour="search"]',
  },
  {
    id: 'ai',
    title: 'Yapay Zekâ Asistanı',
    description: 'Sorularınızı sorun. Yapay zekâ yerel belgelerden alıntı yaparak yanıt verir.',
    targetSelector: '[data-tour="ai"]',
  },
  {
    id: 'emergency',
    title: 'Acil Durum Butonu',
    description: 'Kırmızı SOS butonu her zaman sağ alttadır. Acil numaralara tek tıkla ulaşırsınız.',
    targetSelector: '[data-tour="sos"]',
  },
  {
    id: 'documents',
    title: 'Belge Kütüphanesi',
    description: 'Resmî belgeler, afet rehberleri ve eğitim materyalleri burada toplanır.',
    targetSelector: '[data-tour="documents"]',
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    description: 'Kolay mod, dil, tema ve diğer ayarları buradan yönetebilirsiniz.',
    targetSelector: '[data-tour="settings"]',
  },
];

const TOUR_STORAGE_KEY = 'prepturk:tourCompleted';

interface TourStore {
  isRunning: boolean;
  currentStep: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourStore>((set) => ({
  isRunning: false,
  currentStep: 0,
  startTour: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    }
    set({ isRunning: true, currentStep: 0 });
  },
  endTour: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
    set({ isRunning: false, currentStep: 0 });
  },
  nextStep: () => set((s) => {
    if (s.currentStep >= TOUR_STEPS.length - 1) {
      if (typeof window !== 'undefined') localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      return { isRunning: false, currentStep: 0 };
    }
    return { currentStep: s.currentStep + 1 };
  }),
  prevStep: () => set((s) => ({
    currentStep: Math.max(0, s.currentStep - 1),
  })),
  resetTour: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(TOUR_STORAGE_KEY);
    set({ isRunning: false, currentStep: 0 });
  },
}));

export function hasCompletedTour(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
}

export function TourOverlay() {
  const { isRunning, currentStep, nextStep, prevStep, endTour } = useTourStore();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!isRunning || !step.targetSelector) {
      setHighlightRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setHighlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);

    const observer = new MutationObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setHighlightRect(r);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [isRunning, currentStep, step.targetSelector]);

  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handlePrev = useCallback(() => {
    prevStep();
  }, [prevStep]);

  const handleSkip = useCallback(() => {
    endTour();
  }, [endTour]);

  if (!isRunning) return null;

  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="tour-overlay">
      {highlightRect && (
        <div
          className="tour-highlight"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        />
      )}

      <div
        className="tour-tooltip"
        style={{
          top: highlightRect
            ? Math.max(16, highlightRect.bottom + 16)
            : '50%',
          left: highlightRect
            ? Math.min(highlightRect.left, window.innerWidth - 420)
            : '50%',
          transform: highlightRect ? undefined : 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-nomad-slate">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-nomad-green">{step.title}</h3>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 rounded hover:bg-nomad-border transition-colors"
            title="Turu atla"
          >
            <X className="h-5 w-5 text-nomad-slate" />
          </button>
        </div>

        <p className="text-nomad-slate mb-4 leading-relaxed">{step.description}</p>

        <div className="h-1 bg-nomad-bg rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-nomad-green rounded-full study-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-nomad-slate text-sm"
          >
            Atla
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Geri
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              className="text-sm"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  Başla <Play className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  İleri <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
