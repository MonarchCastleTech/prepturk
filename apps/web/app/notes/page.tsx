'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotes } from '../../hooks/useNotes';
import { turkishIncludes, formatTurkishDateTime } from '../../lib/turkish';
import { cn } from '../../lib/utils';
import {
  ArrowLeft, StickyNote, Plus, Pin, PinOff, Trash2, Search, X,
} from 'lucide-react';

export default function NotesPage() {
  const { notes, add, remove, togglePin } = useNotes();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? notes.filter((n) => turkishIncludes(n.title, query) || turkishIncludes(n.body, query))
    : notes;

  const handleAdd = () => {
    const created = add(title, body);
    if (created) {
      setTitle('');
      setBody('');
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Komuta Merkezine Dön
      </Link>

      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
          <StickyNote className="h-3.5 w-3.5 text-emerald-300" />
          Notlar
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Kişisel Notlar</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
          Acil durum planları, telefon numaraları ve hatırlatmalar için hızlı notlar. Tümü çevrimdışı,
          yalnızca bu cihazda saklanır.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Yeni Not</h2>
          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık"
              className="w-full rounded-xl border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground placeholder:text-nomad-slate focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nomad-green/60"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notunuzu yazın..."
              rows={5}
              className="w-full resize-none rounded-xl border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground placeholder:text-nomad-slate focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nomad-green/60"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!title.trim() && !body.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nomad-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-nomad-green/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Not Ekle
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Notlarda ara..."
              className="w-full rounded-xl border border-nomad-border bg-nomad-surface py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-nomad-slate focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nomad-green/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Aramayı temizle"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-black/15 px-6 py-16 text-center">
              <StickyNote className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-3 text-sm text-slate-300">
                {notes.length === 0 ? 'Henüz not eklemediniz.' : 'Aramanızla eşleşen not bulunamadı.'}
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((note) => (
                <li
                  key={note.id}
                  className={cn(
                    'rounded-2xl border bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-4 shadow-panel transition-colors',
                    note.pinned ? 'border-nomad-green/30' : 'border-white/8'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 break-words text-sm font-semibold text-white">{note.title}</h3>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePin(note.id)}
                        aria-label={note.pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                        className={cn(
                          'rounded-lg p-1.5 transition-colors hover:bg-white/5',
                          note.pinned ? 'text-emerald-300' : 'text-slate-500 hover:text-white'
                        )}
                      >
                        {note.pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(note.id)}
                        aria-label="Notu sil"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {note.body && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{note.body}</p>
                  )}
                  <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    {formatTurkishDateTime(note.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
