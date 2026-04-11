'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Printer,
  Antenna,
  MapPin,
  AlertTriangle,
  Info,
  Zap,
  Signal,
  Clock,
  Flashlight,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Cpu
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface ProvinceFreq {
  city: string;
  trtFM: string;
  trtRadyo1: string;
}

const PROVINCE_FREQS: ProvinceFreq[] = [
  { city: 'İstanbul', trtFM: '95.2 MHz', trtRadyo1: '95.6 MHz' },
  { city: 'Ankara', trtFM: '97.4 MHz', trtRadyo1: '98.3 MHz' },
  { city: 'İzmir', trtFM: '93.4 MHz', trtRadyo1: '96.4 MHz' },
  { city: 'Antalya', trtFM: '96.0 MHz', trtRadyo1: '97.2 MHz' },
  { city: 'Bursa', trtFM: '96.8 MHz', trtRadyo1: '97.8 MHz' },
  { city: 'Adana', trtFM: '99.6 MHz', trtRadyo1: '100.5 MHz' },
  { city: 'Konya', trtFM: '93.8 MHz', trtRadyo1: '95.4 MHz' },
  { city: 'Gaziantep', trtFM: '96.4 MHz', trtRadyo1: '97.6 MHz' },
];

const AMATEUR_RADIO_INFO = {
  band2m: '145.000 - 145.800 MHz',
  callingFreq: '145.500 MHz FM Simplex',
  emergencyFreq: '145.500 MHz',
  repeaterInput: '145.000 - 145.500 MHz (Giriş)',
  repeaterOutput: '145.600 - 145.800 MHz (Çıkış)',
  license: 'Telsiz Operatörlük Belgesi (TOB) gereklidir.',
};

const AFAD_INFO = [
  'Afet anında TRT FM üzerinden resmî AFAD duyuruları yapılır.',
  'Düzenli saatlerde bilgi güncellemesi sağlanır (genellikle her 2 saatte bir).',
  'Toplanma alanları, yardım dağıtımı ve güvenlik uyarıları buradan paylaşılır.',
  'Tahliye duyuruları ve güvenli güzergâh bilgileri aktarılır.',
];

export default function RadyoFrekansPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    afad: true,
    trt: true,
    amateur: false,
    antenna: false,
    signal: false,
  });

  const toggle = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
          <Printer className="h-4 w-4 mr-2" />
          Rehberi Yazdır
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Radio className="h-8 w-8 text-emerald-400" />
          Radyo Frekans Rehberi
        </h1>
        <p className="text-slate-400">İnternet ve şebeke kesintilerinde resmî bilgi kaynaklarına erişim.</p>
      </header>

      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-tight">SDR Entegrasyonu</h3>
              <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                Eğer cihazınıza bir RTL-SDR dongle takılıysa, PrepTürk bu frekansları otomatik olarak tarayabilir ve sinyal gücünü raporlayabilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {/* AFAD Section */}
        <Card className="border-white/8 bg-white/[0.02] overflow-hidden">
          <button onClick={() => toggle('afad')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AFAD Acil Durum Yayını</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Öncelikli Kanal</p>
              </div>
            </div>
            {expanded.afad ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
          </button>
          {expanded.afad && (
            <CardContent className="pt-0 pb-6 px-6 space-y-4">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-200/80 leading-relaxed">
                Afet anında en güncel ve doğrulanmış bilgi kaynağı <strong>TRT FM</strong> kanalıdır.
              </div>
              <ul className="space-y-3">
                {AFAD_INFO.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>

        {/* TRT Frequencies Table */}
        <Card className="border-white/8 bg-white/[0.02] overflow-hidden">
          <button onClick={() => toggle('trt')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Signal className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">İl Bazlı TRT Frekansları</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Bölgesel Yayınlar</p>
              </div>
            </div>
            {expanded.trt ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
          </button>
          {expanded.trt && (
            <CardContent className="pt-0 pb-6 px-6">
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Şehir</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">TRT FM</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">TRT Radyo 1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PROVINCE_FREQS.map((prov, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{prov.city}</td>
                        <td className="py-3 px-4 font-mono text-emerald-200 text-center">{prov.trtFM}</td>
                        <td className="py-3 px-4 font-mono text-emerald-200 text-center">{prov.trtRadyo1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Amateur Radio */}
        <Card className="border-white/8 bg-white/[0.02] overflow-hidden">
          <button onClick={() => toggle('amateur')} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Amatör Telsiz Frekansları</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Gönüllü İletişim Ağı</p>
              </div>
            </div>
            {expanded.amateur ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
          </button>
          {expanded.amateur && (
            <CardContent className="pt-0 pb-6 px-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Çağrı Frekansı</p>
                  <p className="text-xl font-mono text-emerald-400 font-bold">{AMATEUR_RADIO_INFO.callingFreq}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Acil Durum (Emergency)</p>
                  <p className="text-xl font-mono text-red-400 font-bold">{AMATEUR_RADIO_INFO.emergencyFreq}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
                <strong>Not:</strong> {AMATEUR_RADIO_INFO.license} Olağanüstü durumlarda PMR446 (Lisanssız) frekansları da kullanılabilir.
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center">
        <Flashlight className="h-10 w-10 text-emerald-500/40 mx-auto mb-4" />
        <h3 className="text-white font-semibold">Görsel İşaretleşme</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          Radyo iletişimi kurulamıyorsa uluslararası ışık işaretlerini kullanın.
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="h-10 px-4 font-mono text-emerald-400 border-emerald-400/20">... --- ... (SOS)</Badge>
        </div>
      </div>
    </div>
  );
}
