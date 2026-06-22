'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Minimal shape of the (non-standard but widely supported) beforeinstallprompt event.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'prepturk:installDismissed';

/**
 * PWA install prompt. PrepTürk is meant to be installed and run fully offline,
 * so we surface a friendly, dismissible "add to device" card when the browser
 * signals the app is installable. Hidden once installed or dismissed.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Already running as an installed app — nothing to prompt.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      /* storage unavailable */
    }
    if (dismissed) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      /* storage unavailable */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferred(null);
  };

  if (!visible || !deferred) return null;

  return (
    <div className="no-print fixed bottom-4 left-4 z-40 hidden max-w-sm sm:block">
      <div className="rounded-2xl border border-nomad-green/30 bg-nomad-surface/95 p-4 shadow-float backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex rounded-xl bg-nomad-green/15 p-2">
            <Download className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">PrepTürk&apos;ü Cihazınıza Kurun</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Uygulamayı çevrimdışı kullanmak için ana ekranınıza ekleyin. İnternet olmadan da çalışır.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={install}
                className="rounded-lg bg-nomad-green px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-nomad-green/90"
              >
                Kur
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg border border-nomad-border px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5"
              >
                Daha Sonra
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Kurulum bildirimini kapat"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
