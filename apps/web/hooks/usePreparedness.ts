'use client';

import { useCallback, useEffect, useState } from 'react';

// A self-contained, fully-offline preparedness checklist. Items follow AFAD's
// "afet çantası / aile afet planı" guidance. State lives in localStorage so it
// works with zero backend and survives reloads.

export interface PrepItem {
  id: string;
  label: string;
  detail?: string;
}

export interface PrepCategory {
  id: string;
  title: string;
  /** lucide icon name resolved by the page */
  icon: string;
  items: PrepItem[];
}

export const PREP_CATEGORIES: PrepCategory[] = [
  {
    id: 'su-gida',
    title: 'Su ve Gıda',
    icon: 'Droplets',
    items: [
      { id: 'su', label: 'Kişi başı 3 günlük su (günde 4 litre)', detail: 'İçme ve temizlik için' },
      { id: 'gida', label: '3 günlük bozulmayan gıda', detail: 'Konserve, kuru gıda, bebek maması' },
      { id: 'acdi', label: 'El açacağı ve çakı' },
      { id: 'aritma', label: 'Su arıtma tableti veya filtre' },
    ],
  },
  {
    id: 'ilk-yardim',
    title: 'İlk Yardım ve Sağlık',
    icon: 'HeartPulse',
    items: [
      { id: 'canta', label: 'İlk yardım çantası', detail: 'Sargı, antiseptik, makas, eldiven' },
      { id: 'ilac', label: 'Düzenli kullanılan ilaçlar (1 hafta)' },
      { id: 'maske', label: 'Maske ve hijyen malzemeleri' },
      { id: 'recete', label: 'Reçete ve sağlık bilgisi kopyası' },
    ],
  },
  {
    id: 'iletisim',
    title: 'İletişim ve Bilgi',
    icon: 'Radio',
    items: [
      { id: 'radyo', label: 'Pilli/kurmalı radyo', detail: 'AFAD ve resmî yayınlar için' },
      { id: 'powerbank', label: 'Şarjlı powerbank ve kablolar' },
      { id: 'fener', label: 'El feneri ve yedek pil' },
      { id: 'numaralar', label: 'Acil numaralar ve buluşma noktası yazılı' },
    ],
  },
  {
    id: 'belgeler',
    title: 'Belgeler ve Nakit',
    icon: 'FileCheck',
    items: [
      { id: 'kimlik', label: 'Kimlik ve önemli belge kopyaları', detail: 'Su geçirmez poşette' },
      { id: 'nakit', label: 'Küçük banknotlarla acil nakit' },
      { id: 'usb', label: 'Yedek belgeler için USB bellek' },
    ],
  },
  {
    id: 'barinma',
    title: 'Barınma ve Isınma',
    icon: 'Tent',
    items: [
      { id: 'battaniye', label: 'Termal battaniye / uyku tulumu' },
      { id: 'giysi', label: 'Mevsime uygun yedek giysi' },
      { id: 'duduk', label: 'Düdük ve işaret malzemesi' },
      { id: 'yangin', label: 'Yangın söndürücü ve kibrit/çakmak' },
    ],
  },
  {
    id: 'plan',
    title: 'Aile Planı',
    icon: 'Users',
    items: [
      { id: 'bulusma', label: 'Aile buluşma noktası belirlendi' },
      { id: 'gorev', label: 'Aile üyelerine görev dağılımı yapıldı' },
      { id: 'cocuk', label: 'Çocuklar için kimlik kartı hazırlandı' },
      { id: 'tatbikat', label: 'Tahliye tatbikatı yapıldı' },
    ],
  },
];

const STORAGE_KEY = 'prepturk:preparedness';

export const TOTAL_PREP_ITEMS = PREP_CATEGORIES.reduce((n, c) => n + c.items.length, 0);

function itemKey(categoryId: string, itemId: string) {
  return `${categoryId}:${itemId}`;
}

function readState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export interface PreparednessResult {
  checked: Record<string, boolean>;
  ready: boolean;
  toggle: (categoryId: string, itemId: string) => void;
  reset: () => void;
  isChecked: (categoryId: string, itemId: string) => boolean;
  total: number;
  completed: number;
  overallPercent: number;
  categoryPercent: (categoryId: string) => number;
}

export function usePreparedness(): PreparednessResult {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChecked(readState());
    setReady(true);
  }, []);

  const persist = useCallback((next: Record<string, boolean>) => {
    setChecked(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = useCallback(
    (categoryId: string, itemId: string) => {
      const key = itemKey(categoryId, itemId);
      setChecked((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        if (!next[key]) delete next[key];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* storage unavailable */
        }
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => persist({}), [persist]);

  const isChecked = useCallback(
    (categoryId: string, itemId: string) => Boolean(checked[itemKey(categoryId, itemId)]),
    [checked]
  );

  const completed = PREP_CATEGORIES.reduce(
    (n, c) => n + c.items.filter((i) => checked[itemKey(c.id, i.id)]).length,
    0
  );

  const overallPercent = TOTAL_PREP_ITEMS === 0 ? 0 : Math.round((completed / TOTAL_PREP_ITEMS) * 100);

  const categoryPercent = useCallback(
    (categoryId: string) => {
      const cat = PREP_CATEGORIES.find((c) => c.id === categoryId);
      if (!cat || cat.items.length === 0) return 0;
      const done = cat.items.filter((i) => checked[itemKey(categoryId, i.id)]).length;
      return Math.round((done / cat.items.length) * 100);
    },
    [checked]
  );

  return {
    checked,
    ready,
    toggle,
    reset,
    isChecked,
    total: TOTAL_PREP_ITEMS,
    completed,
    overallPercent,
    categoryPercent,
  };
}
