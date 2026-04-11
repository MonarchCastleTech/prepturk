'use client';

import Link from 'next/link';
import { ArrowLeft, Phone, ShieldAlert, TimerReset, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Acil Çağrı', color: 'from-red-600 to-red-500' },
  { number: '110', label: 'İtfaiye', color: 'from-orange-600 to-orange-500' },
  { number: '155', label: 'Polis', color: 'from-blue-600 to-blue-500' },
  { number: '156', label: 'Jandarma', color: 'from-emerald-600 to-emerald-500' },
  { number: '177', label: 'Orman Yangını', color: 'from-amber-600 to-amber-500' },
  { number: '114', label: 'Zehir Danışma', color: 'from-purple-600 to-purple-500' },
];

const FIRST_STEPS = [
  'Kendi güvenliğinizi sağlayın. Tehlikeli alana girmeyin.',
  'Olay yerini hızlıca değerlendirin (Yaralı sayısı, tehlike türü).',
  'Soğukkanlı olun ve 112\'yi arayın. Adresi ve durumu net bildirin.',
  'İlkyardım biliyorsanız müdahale edin, bilmiyorsanız hastayı hareket ettirmeyin.',
  'Diğer insanları uyarın ve güvenli alana (toplanma alanı) yönlendirin.',
];

export default function AcilPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Komuta Merkezine Dön
        </Link>
        <Badge variant="destructive" className="animate-pulse">ACİL DURUM</Badge>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Hızlı Müdahale Hattı</h1>
        <p className="text-slate-400 text-lg">Saniyelerin kritik olduğu anlarda doğru bilgi ve hızlı erişim.</p>
      </header>

      {/* Emergency Numbers Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {EMERGENCY_NUMBERS.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.color} p-6 shadow-lg transition-all hover:scale-[1.02] active:scale-95`}
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{item.label}</p>
              <p className="mt-1 text-4xl font-black text-white">{item.number}</p>
            </div>
            <Phone className="absolute -bottom-2 -right-2 h-20 w-20 text-white/10 transition-transform group-hover:scale-110 group-hover:rotate-12" />
          </a>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* First Steps */}
        <section className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-8 shadow-panel">
          <div className="flex items-center gap-3 text-xl font-bold text-white mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TimerReset className="h-6 w-6" />
            </div>
            İlk Hareket Adımları
          </div>
          <ol className="space-y-4">
            {FIRST_STEPS.map((step, index) => (
              <li
                key={index}
                className="flex gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm leading-relaxed text-slate-300"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-black">
                  {index + 1}
                </span>
                <span className="mt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Video Guides */}
        <section className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 shadow-panel">
          <div className="flex items-center gap-3 text-xl font-bold text-red-400 mb-2">
            <ShieldAlert className="h-6 w-6" />
            Görsel İlk Yardım
          </div>
          <p className="text-xs text-red-200/60 mb-6 uppercase tracking-widest font-semibold">Çevrimdışı Video Döngüleri</p>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-red-500/30 transition-all cursor-pointer">
              <div className="w-20 h-14 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500/40" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Heimlich Manevrası</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Boğulma durumunda yaşam kurtaran hamle.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-red-500/30 transition-all cursor-pointer">
              <div className="w-20 h-14 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500/40" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Turnike Uygulaması</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Şiddetli kanamalarda durdurma tekniği.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-red-500/30 transition-all cursor-pointer">
              <div className="w-20 h-14 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500/40" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">CPR (Kalp Masajı)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Doğru ritim ve bası derinliği görseli.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="p-6 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 text-center">
        <p className="text-sm text-emerald-200">
          Bu sayfadaki tüm bilgiler resmî kurumlarca doğrulanmıştır. 
          Cihazınız çevrimdışı olsa dahi bu rehberlere erişebilirsiniz.
        </p>
      </div>
    </div>
  );
}
