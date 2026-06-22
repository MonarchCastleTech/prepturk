'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, CheckCircle2, CircleSlash, type LucideIcon } from 'lucide-react';

interface ExternalServiceViewProps {
  title: string;
  kicker: string;
  description: string;
  icon: LucideIcon;
  /** Whether the optional integration is enabled (from a NEXT_PUBLIC_ENABLE_* flag). */
  enabled: boolean;
  /** Local URL of the service when enabled. */
  url: string;
  /** Name of the env flag that enables this, shown in the disabled-state help. */
  enableFlag: string;
  features: string[];
}

/**
 * Honest presentation for an optional, locally-hosted companion service
 * (Kolibri, Kiwix/Wikipedia, CyberChef). When enabled, offers a launch button to
 * the local URL; when not, explains exactly how to turn it on. No fake content.
 */
export default function ExternalServiceView({
  title,
  kicker,
  description,
  icon: Icon,
  enabled,
  url,
  enableFlag,
  features,
}: ExternalServiceViewProps) {
  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Komuta Merkezine Dön
      </Link>

      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <Icon className="h-3.5 w-3.5 text-emerald-300" />
              {kicker}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{description}</p>
          </div>

          <div className="shrink-0">
            {enabled ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <span className="inline-flex items-center gap-2 rounded-xl bg-nomad-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-nomad-green/90">
                  <ExternalLink className="h-4 w-4" />
                  Servisi Aç
                </span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-200">
                <CircleSlash className="h-4 w-4" />
                Etkin Değil
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Neler Sunar?</h2>
          <ul className="mt-4 space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5 shadow-panel">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Durum</h2>
          {enabled ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Etkin
              </p>
              <div className="rounded-xl border border-white/8 bg-black/30 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Yerel Adres</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-300">{url}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p className="leading-6">
                Bu servis isteğe bağlıdır ve yerelde ayrı bir bileşen olarak çalışır. Etkinleştirmek için
                kurulumda aşağıdaki ortam değişkenini açın ve servisi başlatın:
              </p>
              <code className="block rounded-xl border border-white/8 bg-black/30 px-3 py-2 font-mono text-xs text-emerald-200">
                {enableFlag}=true
              </code>
              <p className="text-xs text-slate-400">
                Tüm bileşenler çevrimdışı çalışacak şekilde tasarlanmıştır; internet bağlantısı gerekmez.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
