'use client';

import { useState, useCallback } from 'react';

const HOMEWORK_SYSTEM_PROMPT =
  'Sen bir öğretmensin. Öğrenciye cevabı doğrudan söyleme. İpucu ver, yol göster, ama işini kendin yapma. Adım adım düşündür. Öğrencinin seviyesine uygun dil kullan. Asla doğrudan cevap verme, bunun yerine öğrenciyi doğru yöne yönlendir. Sorular sorarak düşünmesini sağla.';

const DEFAULT_SYSTEM_PROMPT =
  'Sen bir yardımcı asistansın. Kullanıcının sorularını doğrudan ve net bir şekilde yanıtla.';

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
    return `Bu soruyu cevaplamak için öncelikle terimin geçtiği bölümü tekrar oku. Terimin bağlam içindeki anlamını düşün. Bana bu terimle ilgili bildiklerini yaz, birlikte değerlendirelim.`;
  }

  if (lower.includes('nasıl') || lower.includes('nasil')) {
    return `Bu tip sorularda öncelikle problemin ne istediğini belirlemelisin. Adımları tek tek yaz. İlk adım ne olmalıdır? Önceki benzer soruları düşün, hangi yöntemi kullanmıştın?`;
  }

  if (lower.includes('neden') || lower.includes('nicin') || lower.includes('niçin')) {
    return `Sebep-sonuç ilişkisi kurman gerekiyor. Öncelikle olayları sırala. Her olayın bir önceki olayla bağlantısı ne? Metinde hangi bilgiler bu bağlantıyı açıklıyor?`;
  }

  if (lower.includes('hesapla') || lower.includes('bul') || lower.includes('coz')) {
    return `Matematiksel problemlerde önce verilenleri listele. Hangi formülü kullanman gerekebilir? Benzer örnekleri hatırla. Önce daha basit bir versiyonunu çözmeyi dene.`;
  }

  if (lower.includes('acikla') || lower.includes('anlat')) {
    return `Açıklama yaparken önce ana fikri belirle. Sonra destekleyici bilgileri sırala. Kendine şu soruyu sor: "Bu konuyu bir arkadaşıma nasıl anlatırım?" En önemli 3 noktayı yaz.`;
  }

  return `Bu soruyu cevaplamadan önce, konuyla ilgili elinde hangi bilgiler var? Metni veya notlarını tekrar gözden geçir. Bana ne düşündüğünü yaz, üzerinde birlikte çalışalım.`;
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
      return `[ÖDEV MODU] Öğrenci sorusu: "${question}"\n\nÖğretmen yönlendirmesi: ${hint}`;
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
