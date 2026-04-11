'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Command, Menu, Search, Settings } from 'lucide-react';
import { useEasyModeStore, useUiStore } from '../lib/stores';
import { useTourStore } from '../lib/tour';
import { cn } from '../lib/utils';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import EasyModeToggle from './EasyModeToggle';

interface TopBarProps {
  mobileNavOpen?: boolean;
  onMobileNavToggle?: () => void;
}

export default function TopBar({ mobileNavOpen = false, onMobileNavToggle }: TopBarProps) {
  const router = useRouter();
  const { setCommandPaletteOpen, sidebarOpen } = useUiStore();
  const { isEasyMode } = useEasyModeStore();
  const { startTour } = useTourStore();
  const [localQuery, setLocalQuery] = useState('');
  const desktopShellExpanded = isEasyMode || sidebarOpen;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-40 border-b border-white/8 bg-[linear-gradient(180deg,rgba(17,24,30,0.96),rgba(12,16,20,0.9))] backdrop-blur-xl no-print',
        desktopShellExpanded
          ? 'lg:left-[var(--shell-sidebar-width)]'
          : 'lg:left-[var(--shell-sidebar-collapsed-width)]'
      )}
    >
      <div className="flex flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 lg:hidden"
              aria-label={mobileNavOpen ? 'Navigasyonu kapat' : 'Navigasyonu ac'}
              onClick={onMobileNavToggle}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="blue">Çevrimdışı</Badge>
              <Badge variant="secondary">Yerel İndeks</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-10 w-10"
              title="Komut Paleti"
            >
              <Command className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-10 w-10" title="Bildirimler">
              <Bell className="h-4 w-4" />
            </Button>

            <EasyModeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              title="Sistem Turu"
              onClick={startTour}
              data-tour="settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="w-full lg:max-w-5xl" data-tour="search">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nomad-slate" />
            <Input
              type="text"
              placeholder="AFAD planı, okul takvimi, ilaç prospektüsü ara"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="h-10 rounded-2xl border-white/10 bg-black/20 pl-11 pr-20 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            />
            <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-nomad-slate sm:inline-flex">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </div>
        </form>
      </div>
    </header>
  );
}
