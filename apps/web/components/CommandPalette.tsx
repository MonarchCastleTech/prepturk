'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Map,
  MessageSquare,
  Search,
  Settings,
  Shield,
  StickyNote,
  X,
} from 'lucide-react';
import { useUiStore } from '../lib/stores';
import { Input } from './ui/Input';

const commands = [
  { id: 'dashboard', label: 'Komuta Merkezi', icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D' },
  { id: 'documents', label: 'Belge Kütüphanesi', icon: FileText, href: '/documents', shortcut: 'G B' },
  { id: 'search', label: 'Komuta Araması', icon: Search, href: '/search', shortcut: 'G A' },
  { id: 'ai-chat', label: 'Yapay Zeka Asistanı', icon: MessageSquare, href: '/ai-chat', shortcut: 'G Y' },
  { id: 'education', label: 'Eğitim', icon: BookOpen, href: '/education', shortcut: 'G E' },
  { id: 'maps', label: 'Haritalar', icon: Map, href: '/maps', shortcut: 'G H' },
  { id: 'vault', label: 'Kasa', icon: Shield, href: '/vault', shortcut: 'G K' },
  { id: 'notes', label: 'Notlar', icon: StickyNote, href: '/notes', shortcut: 'G N' },
  { id: 'admin', label: 'Yönetim', icon: Settings, href: '/admin', shortcut: 'G O' },
];

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const [filter, setFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }

      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const filtered = commands.filter((command) =>
    command.label.toLowerCase().includes(filter.toLowerCase())
  );

  if (!commandPaletteOpen) {
    return null;
  }

  const handleSelect = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
    setFilter('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60" onClick={() => setCommandPaletteOpen(false)} />
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,27,34,0.98),rgba(13,18,23,0.98))] shadow-2xl shadow-black/45">
        <div className="flex items-center border-b border-white/8 px-4">
          <Search className="mr-3 h-5 w-5 flex-shrink-0 text-nomad-slate" />
          <Input
            autoFocus
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Komut, sayfa veya çalışma alanı ara"
            className="h-12 border-0 bg-transparent focus-visible:ring-0"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            className="rounded p-1 hover:bg-nomad-border"
          >
            <X className="h-4 w-4 text-nomad-slate" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-nomad-slate">Sonuç bulunamadı</p>
          )}
          {filtered.map((command) => (
            <button
              key={command.id}
              type="button"
              onClick={() => handleSelect(command.href)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
            >
              <command.icon className="h-4 w-4 flex-shrink-0 text-nomad-slate" />
              <span className="flex-1 text-sm">{command.label}</span>
              <kbd className="rounded bg-nomad-bg px-2 py-0.5 text-xs text-nomad-slate">
                {command.shortcut}
              </kbd>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-white/8 px-4 py-3 text-xs text-nomad-slate">
          <span>
            <kbd className="rounded bg-nomad-bg px-1.5 py-0.5">Ctrl/Cmd+K</kbd> Aç
          </span>
          <span>
            <kbd className="rounded bg-nomad-bg px-1.5 py-0.5">Esc</kbd> Kapat
          </span>
        </div>
      </div>
    </div>
  );
}
