'use client';

import Link from 'next/link';
import { usePreparedness, PREP_CATEGORIES } from '../../hooks/usePreparedness';
import { cn } from '../../lib/utils';
import {
  ArrowLeft, ShieldCheck, RotateCcw, Check, Droplets, HeartPulse, Radio,
  FileCheck, Tent, Users, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Droplets,
  HeartPulse,
  Radio,
  FileCheck,
  Tent,
  Users,
};

function readiness(percent: number): { label: string; tone: string; ring: string } {
  if (percent >= 80) return { label: 'Hazır', tone: 'text-emerald-300', ring: 'stroke-emerald-400' };
  if (percent >= 50) return { label: 'Yolda', tone: 'text-amber-300', ring: 'stroke-amber-400' };
  if (percent > 0) return { label: 'Başlangıç', tone: 'text-orange-300', ring: 'stroke-orange-400' };
  return { label: 'Henüz Başlanmadı', tone: 'text-slate-400', ring: 'stroke-slate-600' };
}

export default function PreparednessPage() {
  const prep = usePreparedness();
  const status = readiness(prep.overallPercent);
  const circumference = 2 * Math.PI * 52;
  const dash = (prep.overallPercent / 100) * circumference;

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Komuta Merkezine Dön
      </Link>

      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Hazırlık Skoru
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Afet Hazırlığınız Ne Durumda?
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              AFAD önerilerine dayalı temel hazırlık listesini tamamladıkça skorunuz yükselir.
              Tüm veriler yalnızca bu cihazda, çevrimdışı saklanır.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-300">
                {prep.completed}/{prep.total} madde tamamlandı
              </span>
              <button
                type="button"
                onClick={prep.reset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-nomad-border px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Sıfırla
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-white/8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className={cn('transition-all duration-700', status.ring)}
                  strokeDasharray={`${dash} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-semibold tabular-nums text-white">
                  {prep.overallPercent}%
                </span>
                <span className={cn('mt-1 text-xs font-semibold uppercase tracking-[0.14em]', status.tone)}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {PREP_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] ?? ShieldCheck;
          const pct = prep.categoryPercent(cat.id);
          return (
            <div
              key={cat.id}
              className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-xl bg-emerald-500/10 p-2">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </span>
                  <h2 className="text-base font-semibold text-white">{cat.title}</h2>
                </div>
                <span className="font-mono text-sm tabular-nums text-slate-300">{pct}%</span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-nomad-green transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <ul className="mt-4 space-y-2">
                {cat.items.map((item) => {
                  const done = prep.isChecked(cat.id, item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => prep.toggle(cat.id, item.id)}
                        aria-pressed={done}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          done
                            ? 'border-nomad-green/30 bg-nomad-green/10'
                            : 'border-white/8 bg-black/20 hover:border-white/15'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            done ? 'border-nomad-green bg-nomad-green text-white' : 'border-nomad-border text-transparent'
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className={cn('block text-sm', done ? 'text-white' : 'text-slate-200')}>
                            {item.label}
                          </span>
                          {item.detail && (
                            <span className="mt-0.5 block text-xs text-slate-400">{item.detail}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
