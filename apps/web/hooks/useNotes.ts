'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'prepturk:notes';

function load(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Note[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeId(): string {
  // Time-free, collision-resistant enough for local notes.
  return 'n_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

/** Sort: pinned first, then most-recently updated. */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export interface UseNotesResult {
  notes: Note[];
  ready: boolean;
  add: (title: string, body: string) => Note | null;
  update: (id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) => void;
  remove: (id: string) => void;
  togglePin: (id: string) => void;
}

export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNotes(sortNotes(load()));
    setReady(true);
  }, []);

  const persist = useCallback((next: Note[]) => {
    const sorted = sortNotes(next);
    setNotes(sorted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const stamp = () => new Date().toISOString();

  const add = useCallback(
    (title: string, body: string): Note | null => {
      const t = title.trim();
      const b = body.trim();
      if (!t && !b) return null;
      const note: Note = {
        id: makeId(),
        title: t || 'Başlıksız not',
        body: b,
        pinned: false,
        updatedAt: stamp(),
      };
      persist([note, ...notes]);
      return note;
    },
    [notes, persist]
  );

  const update = useCallback(
    (id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) => {
      persist(notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: stamp() } : n)));
    },
    [notes, persist]
  );

  const remove = useCallback((id: string) => persist(notes.filter((n) => n.id !== id)), [notes, persist]);

  const togglePin = useCallback(
    (id: string) => persist(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))),
    [notes, persist]
  );

  return { notes, ready, add, update, remove, togglePin };
}
