'use client';

import { useState, useCallback } from 'react';

const HOMEWORK_SYSTEM_PROMPT =
  'Sen bir ogretmensin. Ogrenciye cevabi dogrudan soyleme. Ipucu ver, yol goster, ama isini kendin yapma. Adim adim dusundur. Ogrencinin seviyesine uygun dil kullan. Asla dogrudan cevap verme, bunun yerine ogrenciyi dogru yone yonlendir. Sorular sorarak dusunmesini sagla.';

const DEFAULT_SYSTEM_PROMPT =
  'Sen bir yardimci asistansin. Kullanicinin sorularini dogrudan ve net bir sekilde yanitla.';

interface HomeworkModeResult {
  isHomeworkMode: boolean;
  systemPrompt: string;
  transformQuestion: (question: string) => string;
  toggleHomeworkMode: () => void;
  setHomeworkMode: (enabled: boolean) => void;
}

function generateHintResponse(question: string): string {
  const lower = question.toLowerCase();

  if (lower.includes('nedir') || lower.includes('ne demek')) {
    return `Bu soruyu cevaplamak icin oncelikle terimin gectigi bolumu tekrar oku. Terimin baglam icindeki anlamini dusun. Bana bu terimle ilgili bildiklerini yaz, birlikte degerlendirelim.`;
  }

  if (lower.includes('nasıl') || lower.includes('nasil')) {
    return `Bu tip sorularda oncelikle problemin ne istedigini belirlemelisin. Adimlari tek tek yaz. Ilk adim ne olmalidir? Onceki benzer sorulari dusun, hangi yontemi kullanmistin?`;
  }

  if (lower.includes('neden') || lower.includes('nicin') || lower.includes('niçin')) {
    return `Sebep-sonuc iliskisi kurman gerekiyor. Oncelikle olaylari sirala. Her olayin bir onceki olayla baglantisi ne? Metinde hangi bilgiler bu baglantiyi acikliyor?`;
  }

  if (lower.includes('hesapla') || lower.includes('bul') || lower.includes('coz')) {
    return `Matematiksel problemlerde once verilenleri listele. Hangi formulu kullanman gerekebilir? Benzer ornekleri hatirla. once daha basit bir versiyonunu cozmeyi dene.`;
  }

  if (lower.includes('acikla') || lower.includes('anlat')) {
    return `Aciklama yaparken once ana fikri belirle. Sonra destekleyici bilgileri sirala. Kendine su soruyu sor: "Bu konuyu bir arkadasima nasil anlatirim?" En onemli 3 noktayi yaz.`;
  }

  return `Bu soruyu cevaplamadan once, konuyla ilgili elinde hangi bilgiler var? Metni veya notlarini tekrar gozden gecir. Bana ne dusundugunu yaz, uzerinde birlikte calisalim.`;
}

export function useHomeworkMode(): HomeworkModeResult {
  const [isHomeworkMode, setIsHomeworkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('prepturk:homeworkMode') === 'true';
  });

  const toggleHomeworkMode = useCallback(() => {
    setIsHomeworkMode((prev) => {
      const newVal = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('prepturk:homeworkMode', String(newVal));
      }
      return newVal;
    });
  }, []);

  const setHomeworkMode = useCallback((enabled: boolean) => {
    setIsHomeworkMode(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepturk:homeworkMode', String(enabled));
    }
  }, []);

  const systemPrompt = isHomeworkMode ? HOMEWORK_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT;

  const transformQuestion = useCallback(
    (question: string): string => {
      if (!isHomeworkMode) return question;
      const hint = generateHintResponse(question);
      return `[ODEV MODU] Ogrenci sorusu: "${question}"\n\nOgretmen yonlendirmesi: ${hint}`;
    },
    [isHomeworkMode]
  );

  return {
    isHomeworkMode,
    systemPrompt,
    transformQuestion,
    toggleHomeworkMode,
    setHomeworkMode,
  };
}
