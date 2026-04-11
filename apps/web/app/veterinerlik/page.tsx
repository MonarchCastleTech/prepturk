'use client';

import Link from 'next/link';
import { ArrowLeft, Dog, Pill, Droplets, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export default function VeterinerlikPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
          Rehberi Yazdır
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Dog className="h-8 w-8 text-teal-400" />
          Hayvan Bakımı & Veterinerlik
        </h1>
        <p className="text-slate-400">Afet durumunda evcil hayvanlar ve çiftlik hayvanları için kriz veterinerliği.</p>
      </header>

      <Card className="border-teal-500/20 bg-teal-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-teal-500/10 text-teal-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-tight">Kritik Kural</h3>
              <p className="text-xs text-teal-200/80 mt-1 leading-relaxed">
                İnsanlar için üretilen ağrı kesicileri (Parasetamol, İbuprofen, Aspirin) KEDİ VE KÖPEKLERE ASLA VERMEYİN. Organ yetmezliğine ve hızlı ölüme neden olur.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Pill className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Yara Bakımı ve İlk Yardım</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Hayvanlar acı çekerken sahiplerini bile ısırabilir. Önce ağzını yumuşak bir bezle bağlayın.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Kanayan bölgeye temiz bir bezle bastırın (insanlardaki gibi).</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Yaraları temizlemek için sadece serum fizyolojik veya kaynatılıp soğutulmuş su (veya baticon) kullanın. Alkol veya tentürdiyot açık yaraya sürülmez.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Droplets className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Gıda ve Su Zehirlenmesi</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Kirli su içen hayvanlarda şiddetli ishal görülür. Susuz kalmalarını önleyin.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Şiddetli zehirlenme durumunda 1 tatlı kaşığı oksijenli su (%3) içirilerek kusturulabilir (Ancak ne yuttuğunu biliyorsanız). Kesici cisim veya asit/baz yuttuysa ASLA kusturmayın.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
