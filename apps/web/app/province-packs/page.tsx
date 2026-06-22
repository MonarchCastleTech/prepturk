'use client';

import useSWR from 'swr';
import { apiGet } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatTurkishDate } from '../../lib/turkish';
import {
  FolderArchive,
  CheckCircle,
  FileText,
  Shield,
  BookOpen,
  Map,
  AlertTriangle,
  Info,
  Database,
} from 'lucide-react';

interface ProvincePack {
  id: string;
  province_code: string;
  province_name: string;
  version: string;
  is_active: boolean;
  included_documents_count: number;
  created_at: string;
  updated_at: string;
}

const allProvinces = [
  { code: '01', name: 'Adana' },
  { code: '06', name: 'Ankara' },
  { code: '07', name: 'Antalya' },
  { code: '16', name: 'Bursa' },
  { code: '34', name: 'İstanbul' },
  { code: '35', name: 'İzmir' },
  { code: '38', name: 'Kayseri' },
  { code: '42', name: 'Konya' },
  { code: '55', name: 'Samsun' },
  { code: '61', name: 'Trabzon' },
];

const packContents = [
  { label: 'İl bazlı mevzuat özetleri', icon: FileText },
  { label: 'Yerel afet planları', icon: AlertTriangle },
  { label: 'Acil toplanma alanları', icon: Map },
  { label: 'İlçe sağlık kurumları', icon: BookOpen },
  { label: 'Eğitim kurumları listesi', icon: Shield },
  { label: 'Kritik altyapı bilgileri', icon: Info },
];

export default function ProvincePacksPage() {
  const { data: activePacks } = useSWR<ProvincePack[]>(
    '/province-packs/?is_active=true',
    (path: string) => apiGet<ProvincePack[]>(path),
    { revalidateOnFocus: false }
  );

  const activePackCodes = new Set((activePacks || []).map((pack) => pack.province_code));

  return (
    <div className="space-y-6 text-white">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.96),rgba(10,13,17,0.92))] p-5 shadow-panel sm:p-6">
          <p className="shell-kicker">Yerel paketler</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">İl Paketleri</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                İl içerikleri, sürüm durumu ve belge kapsamı tek envanter görünümünde izleniyor.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Hazır kapsam</p>
            <p className="mt-2 text-3xl font-semibold text-white">{allProvinces.length}</p>
            <p className="mt-2 text-sm text-slate-300">Kurulum paketiyle gelen il seti</p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
            <p className="shell-muted-label">Etkin paket</p>
            <p className="mt-2 text-3xl font-semibold text-white">{activePackCodes.size}</p>
            <p className="mt-2 text-sm text-emerald-100/80">Aktif olan il içeriği</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Çalışma modu</p>
            <p className="mt-2 text-xl font-semibold text-white">Tam çevrimdışı</p>
            <p className="mt-2 text-sm text-slate-300">Ek indirme veya dış bağlantı gerekmez</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {allProvinces.map((province) => {
          const pack = (activePacks || []).find((item) => item.province_code === province.code);
          const isActive = activePackCodes.has(province.code);

          return (
            <Card
              key={province.code}
              className="border-white/8 bg-[linear-gradient(180deg,rgba(20,27,34,0.95),rgba(12,17,21,0.95))] shadow-panel"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-white">{province.name}</CardTitle>
                    <p className="mt-1 text-sm text-slate-300">
                      {isActive ? 'Etkin ve çalışma yüzeyine dahil' : 'Etkinleştirme bekliyor'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {province.code}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div
                  className={
                    isActive
                      ? 'rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100'
                      : 'rounded-2xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-100'
                  }
                >
                  {isActive ? 'Aktif ve erişilebilir' : 'Etkinleştirme bekliyor'}
                </div>

                {isActive && pack ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sürüm</p>
                      <p className="mt-2 font-semibold text-white">{pack.version}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Belge</p>
                      <p className="mt-2 font-semibold text-white">{pack.included_documents_count}</p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-white/8 bg-black/15 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Son güncelleme</p>
                      <p className="mt-2 font-semibold text-white">{formatTurkishDate(pack.updated_at)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-300">
                    Bu il içeriği kurulumla birlikte gelir. Dış bağlantı olmadan kullanılabilir ve gerektiğinde yerel olarak etkinleştirilir.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Database className="h-5 w-5 text-emerald-300" />
            Paket içerikleri
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {packContents.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 text-sm text-slate-300"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Shield className="h-5 w-5 text-sky-300" />
            Hak manifestosu
          </h2>
          <div className="mt-5 space-y-3 rounded-2xl border border-white/8 bg-black/15 p-5 text-sm leading-6 text-slate-300">
            <p>Tüm paket içerikleri kamu yararına açık kaynaklardan derlenmiştir.</p>
            <p>Mevzuat belgeleri resmi yayınlardan, afet planları yerel kurum arşivlerinden alınır.</p>
            <p>Eğitim ve sağlık içerikleri bağlantı gerektirmeden yerel kullanım için hazırlanır.</p>
            <p className="border-t border-white/8 pt-3 text-xs text-slate-400">
              Bu içerikler acil durum, eğitim ve kamusal hazırlık amaçlı ücretsiz kullanım için paketlenmiştir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
