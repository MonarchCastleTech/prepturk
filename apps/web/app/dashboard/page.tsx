import Link from 'next/link';
import {
  ArrowRight,
  BookOpenText,
  Brain,
  FolderArchive,
  Map,
  MessageSquare,
  Search,
  ShieldCheck,
  StickyNote,
} from 'lucide-react';

const quickAccessLinks = [
  {
    title: 'Belge Kütüphanesi',
    description: 'Resmî belgelere, rehberlere ve yerel arşive doğrudan erişim.',
    href: '/documents',
    icon: BookOpenText,
  },
  {
    title: 'Komuta Araması',
    description: 'Yerel indeks üzerinden hızlı ve akıllı arama.',
    href: '/search',
    icon: Search,
  },
  {
    title: 'Haritalar',
    description: 'Toplanma noktalarını ve saha bağlamını tek ekranda inceleyin.',
    href: '/maps',
    icon: Map,
  },
  {
    title: 'Yapay Zeka Asistanı',
    description: 'Belgelerden özet, yanıt ve hızlı bağlam çıkarın.',
    href: '/ai-chat',
    icon: Brain,
  },
];

const statusCards = [
  {
    label: 'Yerel İndeks',
    value: 'Hazır',
    detail: 'Belgeler ve notlar arama akışına dahil edildi.',
  },
  {
    label: 'Yapay Zeka Modeli',
    value: 'Etkin',
    detail: 'Qwen 0.5B (Ultra-Hafif) aktif durumda.',
  },
  {
    label: 'Çevrimdışı Arşivler',
    value: 'Aktif',
    detail: 'Wikipedia ve WikiMed yerel olarak sunuluyor.',
  },
];

const summaryCards = [
  {
    title: 'Bilgi Hattı',
    metric: '06',
    detail: 'Temel modüller aynı gezinme yapısında bağlandı.',
    icon: MessageSquare,
  },
  {
    title: 'Yerel Kaynaklar',
    metric: '24',
    detail: 'Belgeler, il paketleri ve notlar komuta akışında hazır.',
    icon: FolderArchive,
  },
  {
    title: 'Sistem Performansı',
    metric: 'Hafif',
    detail: 'Düşük kaynak kullanımı (Raspberry Pi / Laptop uyumlu).',
    icon: Cpu,
  },
];

export default function DashboardPage() {
  return (
    <main className="space-y-6 text-white">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] xl:items-start">
        <div className="max-w-3xl">
          <p className="shell-kicker">Sovereign Command</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Komuta Merkezi</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            Temel modüllere hızlı geçiş, çekirdek servis görünümü ve NOMAD-tier büyük veri arşivleri tek
            bir çalışma yüzeyinde toplanıyor.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Sistem Önerisi</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Cihazınız "Hafif" profil için optimize edildi. Akıcı bir deneyim için 0.5B AI modeli kullanılıyor.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-400/15 bg-amber-400/8 px-4 py-4">
            <p className="shell-muted-label">Dikkat</p>
            <p className="mt-2 text-sm leading-6 text-amber-100">
              Wikipedia arşivi etkinleştirildi (~30GB). Disk alanı kullanımını izleyin.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Hızlı Erişim</h2>
            <div className="hidden rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:inline-flex">
              Ana Modüller
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {quickAccessLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 transition-all duration-200 hover:border-emerald-400/25 hover:bg-emerald-400/[0.07]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-black/20">
                      <Icon className="h-5 w-5 text-emerald-200" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-200" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
          <h2 className="text-2xl font-semibold text-white">Yerel Sistem Durumu</h2>
          <div className="mt-5 space-y-3">
            {statusCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-200">{card.label}</p>
                  <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                    {card.value}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{card.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Operasyon Özeti</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Bilgi, acil durum ve saha akışlarının aynı komuta ritminde toplandığı özet paneli.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-300">{card.title}</p>
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{card.metric}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{card.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Link
          href="/notes"
          className="rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(22,31,39,0.96),rgba(12,17,21,0.92))] p-5 shadow-panel transition-colors duration-200 hover:border-white/12 hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-black/20">
              <StickyNote className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sonraki Adım</p>
              <p className="mt-1 text-sm text-slate-400">Kontrol listeleri ve aile notlarını güncelleyin.</p>
            </div>
          </div>
        </Link>

        <Link
          href="/province-packs"
          className="rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(22,31,39,0.96),rgba(12,17,21,0.92))] p-5 shadow-panel transition-colors duration-200 hover:border-white/12 hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-black/20">
              <FolderArchive className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Bölgesel Paketler</p>
              <p className="mt-1 text-sm text-slate-400">İl bazlı risk ve kaynak setlerini gözden geçirin.</p>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
