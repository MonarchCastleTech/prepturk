'use client';

import Link from 'next/link';
import { ArrowLeft, Biohazard, AlertTriangle, ShieldCheck, Zap, Info, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const KBRN_TYPES = [
  {
    id: 'kimyasal',
    title: 'Kimyasal Saldırı',
    desc: 'Zehirli gazlar (Sarin, Hardal, VX) ve endüstriyel kimyasallar.',
    action: 'Kimyasal gazlar genellikle havadan ağırdır ve çöker. Binanın ÜST katlarına çıkın. Pencereleri ve kapıları koli bandı veya ıslak havlu ile sıkıca kapatın.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    id: 'biyolojik',
    title: 'Biyolojik Saldırı',
    desc: 'Hastalık yapıcı bakteri, virüs veya toksinlerin (Şarbon, Çiçek) yayılması.',
    action: 'Maske (N95 veya FFP3) takın. Kişisel hijyene (el yıkama) azami özen gösterin. Kaynağı belirsiz suları mutlaka kaynatın. Sokağa çıkmayın.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    id: 'radyolojik',
    title: 'Radyolojik Tehdit (Kirli Bomba)',
    desc: 'Radyoaktif maddelerin patlayıcılar aracılığıyla çevreye dağıtılması.',
    action: 'Patlama alanından rüzgarın ters yönüne doğru hızla uzaklaşın. Dışarıdaysanız burnunuzu/ağzınızı bezle kapatın. Kapalı bir alana girin ve kirli kıyafetleri çıkarıp poşetleyin.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    id: 'nukleer',
    title: 'Nükleer Patlama',
    desc: 'Büyük çaplı yıkım, ısı, ışık ve ölümcül radyasyon salınımı.',
    action: 'Parlama gördüğünüz an ASLA ışığa bakmayın. Derhal çukur bir yere veya sağlam bir duvar dibine yüzüstü yatın. Şok dalgası geçtikten sonra en yakın sağlam yeraltı sığınağına girin.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
];

const SHELTER_RULES = [
  'Dışarıdan sığınağa girerken kıyafetlerinizi çıkarın ve çift katlı çöp poşetine koyup ağzını bağlayın.',
  'Bol sabun ve su ile (mümkünse şampuan kullanmadan, saç kremi kesinlikle kullanmadan) duş alın.',
  'Pencereleri, kapı altlarını, havalandırma deliklerini ve şömineleri koli bandı ve kalın naylon ile kapatın (Sızdırmazlık).',
  'İyot tabletlerini SADECE resmi makamlar (Sağlık Bakanlığı) duyurduktan sonra ve belirtilen dozda alın. Önceden almak faydasız ve zararlıdır.',
  'AFAD ve resmî makamlardan "Tehlike Geçti" (Beyaz İkaz) anonsu gelene kadar sığınaktan ÇIKMAYIN.',
];

export default function NukleerTehlikePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Komuta Merkezine Dön
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
          <Printer className="h-4 w-4 mr-2" />
          Rehberi Yazdır
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Biohazard className="h-8 w-8 text-purple-500" />
          KBRN & Nükleer Tehlike
        </h1>
        <p className="text-slate-400 text-lg">Kimyasal, Biyolojik, Radyolojik ve Nükleer tehditlere karşı resmî AFAD protokolleri.</p>
      </header>

      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-tight">KBRN İkazı (Siyah Alarm)</h3>
              <p className="text-sm text-purple-200/80 mt-1 leading-relaxed">
                Radyo veya hoparlörlerden <strong>3 dakika süreli kesik kesik çalan siren sesi</strong> duyduğunuzda KBRN saldırısı söz konusudur. Derhal sığınağa veya izole edilmiş kapalı bir odaya gidin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {KBRN_TYPES.map((type) => (
          <Card key={type.id} className={`border ${type.border} ${type.bg}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg ${type.color}`}>{type.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-300">{type.desc}</p>
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <p className="text-xs font-bold uppercase tracking-wider text-white mb-1">Ne Yapılmalı?</p>
                <p className="text-sm text-slate-200 leading-relaxed">{type.action}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Sızdırmazlık ve Arınma
          </h2>
          <Card className="border-white/10 bg-white/[0.02] h-full">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Nükleer sızıntı veya serpinti (fallout) durumunda görünmez radyoaktif partiküller havada taşınır. Bu partiküllerin kapalı alana ve vücudunuza temasını engellemek hayati önem taşır.
              </p>
              <ul className="space-y-3">
                {SHELTER_RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Nükleer Patlama Anı (İlk 10 Saniye)
          </h2>
          <Card className="border-red-500/20 bg-red-500/5 h-full">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20">
                  <h3 className="text-red-400 font-bold mb-2">1. Işığa Bakmayın (Körlük Riski)</h3>
                  <p className="text-sm text-red-200/70">Nükleer patlamanın parlaması güneşte kat kat parlaktır ve anında kalıcı körlüğe yol açabilir.</p>
                </div>
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20">
                  <h3 className="text-red-400 font-bold mb-2">2. Hemen Yere Yatın</h3>
                  <p className="text-sm text-red-200/70">Işık dalgasını yıkıcı şok dalgası takip eder. Rüzgarın uçuracağı cam ve molozlardan korunmak için yüzüstü yatın, ellerinizi ensenizde birleştirin.</p>
                </div>
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20">
                  <h3 className="text-red-400 font-bold mb-2">3. Serpinti Başlamadan Saklanın</h3>
                  <p className="text-sm text-red-200/70">Patlamadan hemen sonra (ilk 15 dakika içinde) radyoaktif kül (serpinti) yağmaya başlar. Vakit kaybetmeden en yakın yer altı sığınağına girin.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
