'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import EmergencyPanel from './EmergencyPanel';
import SOSButton from './SOSButton';
import InstallPrompt from './InstallPrompt';
import { TourOverlay } from '../lib/tour';
import { useEasyModeStore, usePowerStore, useUiStore } from '../lib/stores';
import { cn } from '../lib/utils';

const NO_CHROME_PATHS = ['/login', '/setup', '/acil'];

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = !NO_CHROME_PATHS.includes(pathname);
  const { isEasyMode } = useEasyModeStore();
  const { isLowPower } = usePowerStore();
  const { sidebarOpen } = useUiStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isEasyMode) {
      document.documentElement.classList.add('easy-mode');
    } else {
      document.documentElement.classList.remove('easy-mode');
    }
    if (isLowPower) {
      document.documentElement.classList.add('low-power-mode');
    } else {
      document.documentElement.classList.remove('low-power-mode');
    }
    return () => {
      document.documentElement.classList.remove('easy-mode');
      document.documentElement.classList.remove('low-power-mode');
    };
  }, [isEasyMode, isLowPower]);

  if (!showChrome) {
    return (
      <>
        {children}
        <SOSButton />
        <TourOverlay />
        <InstallPrompt />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-nomad-bg">
      <Sidebar mobileNavOpen={mobileNavOpen} onMobileNavClose={() => setMobileNavOpen(false)} />
      <TopBar mobileNavOpen={mobileNavOpen} onMobileNavToggle={() => setMobileNavOpen((open) => !open)} />
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Navigasyon kaplamasini kapat"
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-300',
          isEasyMode || sidebarOpen
            ? 'lg:pl-[var(--shell-sidebar-width)]'
            : 'lg:pl-[var(--shell-sidebar-collapsed-width)]'
        )}
      >
        <main className="px-4 pb-8 pt-[calc(var(--shell-topbar-height)+1rem)] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <CommandPalette />
      <EmergencyPanel />
      <SOSButton />
      <TourOverlay />
      <InstallPrompt />
    </div>
  );
}
