'use client';

import Link from 'next/link';
import { ArrowLeft, Phone, ShieldAlert, TimerReset } from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Acil Çağrı', color: 'from-red-600 to-red-500' },
  { number: '110', label: 'İtfaiye', color: 'from-orange-600 to-amber-500' },
  { number: '155', label: 'Polis', color: 'from-blue-600 to-sky-500' },
  { number: '156', label: 'Jandarma', color: 'from-emerald-700 to-emerald-500' },
];

const FIRST_STEPS = [
  'Çök, kapan ve tutun. Sarsıntı veya ilk tehlike anında hareketi azalt.',
  'Gaz, elektrik ve açık alev varsa güvenli biçimde kapat.',
  'Yakınlarını kısa mesajla bilgilendir, hattı meşgul etme.',
  'Toplanma planına geçmeden önce yaralı ve yangın riski kontrolü yap.',
];

export default function EmergencyPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Komuta merkezine dön
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(41,18,18,0.96),rgba(21,12,16,0.94))] p-6 shadow-panel sm:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-100">
            <ShieldAlert className="h-3.5 w-3.5" />
            Hızlı Erişim
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Acil Durum Paneli
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-red-50/80 sm:text-base">
              Kritik çağrı hatları, ilk hareket adımları ve çevrimdışı hızlı erişim tek panelde toplanır.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/70">Kritik çağrı hatları</p>
            <p className="mt-3 text-3xl font-semibold text-white">{EMERGENCY_NUMBERS.length}</p>
            <p className="mt-2 text-sm text-red-50/75">Tek dokunuşla aranabilecek acil numaralar</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/70">İlk hareket adımları</p>
            <p className="mt-3 text-3xl font-semibold text-white">{FIRST_STEPS.length}</p>
            <p className="mt-2 text-sm text-red-50/75">İlk dakikada izlenecek güvenli sıralama</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">Çalışma modu</p>
            <p className="mt-3 text-xl font-semibold text-white">Tam çevrimdışı</p>
            <p className="mt-2 text-sm text-red-50/75">Bu panel bağlantı gerektirmeden çalışır</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(30,17,20,0.95),rgba(17,12,15,0.95))] p-6 shadow-panel">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Phone className="h-5 w-5 text-red-200" />
            Kritik çağrı hatları
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EMERGENCY_NUMBERS.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className={`rounded-[1.6rem] border border-white/8 bg-gradient-to-br ${item.color} p-5 text-white transition-transform active:scale-[0.99]`}
              >
                <div className="text-4xl font-semibold">{item.number}</div>
                <div className="mt-2 text-sm text-white/85">{item.label}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(30,17,20,0.95),rgba(17,12,15,0.95))] p-6 shadow-panel">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <TimerReset className="h-5 w-5 text-red-200" />
            İlk hareket adımları
          </div>
          <ol className="mt-5 space-y-3">
            {FIRST_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 text-sm leading-6 text-red-50/85"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-sm font-semibold text-red-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(30,17,20,0.95),rgba(17,12,15,0.95))] p-6 shadow-panel mt-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <ShieldAlert className="h-5 w-5 text-red-200" />
          Hızlı İlk Yardım (Video Rehber)
        </div>
        <p className="mt-2 text-sm text-red-50/80 mb-4">
          Cihazda önceden yüklü, yüksek oranda sıkıştırılmış (AV1) sessiz görsel döngüler. Ağ bağlantısı gerektirmez.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Heimlich Maneuver */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <div className="aspect-video bg-black/60 relative flex items-center justify-center">
              <span className="text-nomad-slate text-xs absolute z-10">Heimlich.mp4</span>
              {/* Placeholder for actual <video> tag */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjUgMyAxOSAxMiA1IDIxIDUgMyI+PC9wb2x5Z29uPjwvc3ZnPg==')] bg-center bg-no-repeat opacity-50"></div>
            </div>
            <div className="p-3">
              <h4 className="text-white text-sm font-semibold">Heimlich Manevrası</h4>
              <p className="text-xs text-red-50/60 mt-1">Boğulma durumunda karına bası uygulaması.</p>
            </div>
          </div>
          
          {/* Tourniquet */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <div className="aspect-video bg-black/60 relative flex items-center justify-center">
              <span className="text-nomad-slate text-xs absolute z-10">Turnike_Uygulama.mp4</span>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjUgMyAxOSAxMiA1IDIxIDUgMyI+PC9wb2x5Z29uPjwvc3ZnPg==')] bg-center bg-no-repeat opacity-50"></div>
            </div>
            <div className="p-3">
              <h4 className="text-white text-sm font-semibold">Turnike Uygulaması</h4>
              <p className="text-xs text-red-50/60 mt-1">Şiddetli kanamayı durdurma adımları.</p>
            </div>
          </div>

          {/* CPR */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <div className="aspect-video bg-black/60 relative flex items-center justify-center">
              <span className="text-nomad-slate text-xs absolute z-10">Kalp_Masaji_Ritim.mp4</span>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjUgMyAxOSAxMiA1IDIxIDUgMyI+PC9wb2x5Z29uPjwvc3ZnPg==')] bg-center bg-no-repeat opacity-50"></div>
            </div>
            <div className="p-3">
              <h4 className="text-white text-sm font-semibold">Kalp Masajı Ritmi (CPR)</h4>
              <p className="text-xs text-red-50/60 mt-1">Doğru el pozisyonu ve bası hızı görseli.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
