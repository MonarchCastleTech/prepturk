'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldAlert, AlertTriangle, Radio, Home, Info, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ALARM_TYPES = [
  {
    name: 'Sarı İkaz',
    meaning: 'Hava Saldırısı İhtimali',
    sound: '3 dakika süreli DÜZ siren sesi.',
    action: 'Bina içindeki gaz, elektrik ve su vanalarını kapatın. Yanan ocak ve sobaları söndürün. Pencereleri kapatıp perdeleri çekin. Sığınağa gitmek üzere hazırlanın.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    name: 'Kırmızı Alarm',
    meaning: 'Hava Saldırısı Tehlikesi',
    sound: '3 dakika süreli YÜKSELİP ALÇALAN (dalgalı) siren sesi.',
    action: 'Derhal en yakın sığınağa veya önceden belirlenmiş güvenli bir bodrum katına girin. "Tehlike Geçti" ikazına kadar içeride, sükunetle bekleyin.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    name: 'Siyah Alarm',
    meaning: 'KBRN Tehlikesi (Kimyasal, Biyolojik, Radyolojik, Nükleer)',
    sound: '3 dakika süreli KESİK KESİK siren sesi.',
    action: 'Derhal KBRN korumalı sığınağa girin. Sığınak yoksa, üst katlarda (gaz havadan ağırsa) penceresi az ve sızdırmazlığı sağlanmış odaya sığındıktan sonra açık yerlerinizi örtün.',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
  },
  {
    name: 'Beyaz İkaz',
    meaning: 'Tehlike Geçti',
    sound: 'Radyo, televizyon veya megafon ile duyurulur.',
    action: 'Sığınılan yerden çıkarak normal yaşama dönebilirsiniz. Yardıma muhtaç olanlara yardım edin.',
    color: 'text-white',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
  },
];

const SHELTER_ITEMS = [
  'Kişi başı günlük 3 Litre Su (en az 14 günlük)',
  'Bozulmayan, konserve veya kuru gıdalar',
  'Pilli veya kranklı radyo (AFAD duyuruları için TRT FM)',
  'Yedek pilleriyle birlikte el feneri',
  'Kapsamlı ilk yardım çantası ve sürekli kullanılan ilaçlar',
  'Önemli belgelerin kopyaları (Kimlik, tapu) - Kasa modülünde de tutun',
  'Uyku tulumu veya kalın battaniyeler',
  'Hijyen malzemeleri (Çöp poşeti, ıslak mendil, sabun)',
  'Düdük (Enkaz altında kalma durumunda sinyal için)',
];

export default function SavasDurumuPage() {
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
          <ShieldAlert className="h-8 w-8 text-red-500" />
          Savaş & Sivil Savunma
        </h1>
        <p className="text-slate-400 text-lg">AFAD Sivil Savunma protokollerine dayalı resmi savaş, saldırı ve sığınak rehberi.</p>
      </header>

      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-tight">Kritik Bilgi</h3>
              <p className="text-sm text-red-200/80 mt-1 leading-relaxed">
                Bu rehber, saldırı ve savaş durumlarında sivil halkın alması gereken önlemleri içerir. İkaz ve alarm seslerini öğrenin ve mahallenizdeki en yakın "Sığınak" (Toplanma Alanı DEĞİL) konumunu önceden tespit edin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Radio className="h-6 w-6 text-emerald-400" />
          İkaz ve Alarm İşaretleri
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ALARM_TYPES.map((alarm, i) => (
            <Card key={i} className={`border ${alarm.borderColor} ${alarm.bgColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-xl ${alarm.color}`}>{alarm.name}</CardTitle>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">{alarm.meaning}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Siren Sesi</p>
                  <p className="text-sm text-white font-mono">{alarm.sound}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Yapılması Gerekenler</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{alarm.action}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-400" />
            Sığınak Hazırlığı
          </h2>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-sm text-blue-200/80 leading-relaxed">
                  <strong>Sığınak Nedir?</strong> Nükleer, konvansiyonel, biyolojik ve kimyasal silahların etkilerinden korunmak amacıyla yer altında veya sağlam yapılı binaların bodrumlarında inşa edilen, dış dünyadan izole edilebilen yerlerdir. "Afet Toplanma Alanları" sığınak değildir (Toplanma alanları genelde açık parklardır ve hava saldırısında güvensizdir).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Sığınakta Bulunması Gerekenler</h3>
                <ul className="space-y-2">
                  {SHELTER_ITEMS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Info className="h-6 w-6 text-amber-400" />
            Genel Kurallar
          </h2>
          <Card className="border-white/10 bg-white/[0.02] h-full">
            <CardContent className="pt-6 space-y-4">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5"><AlertTriangle className="h-4 w-4" /></div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white block">Sokağa Çıkmayın</strong>
                    Saldırı anında dışarıdaysanız en yakın sağlam binanın bodrumuna veya bir hendeğe sığının. Yüzüstü yatarak başınızı koruyun.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5"><AlertTriangle className="h-4 w-4" /></div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white block">İletişimi Açık Tutun</strong>
                    Acil olmayan durumlar haricinde telefon hatlarını meşgul etmeyin. Sadece SMS kullanın veya İnternetsiz Mesh (Meshtastic) ağlarına geçin. Bilgi almak için pilli radyonuzdan (TRT FM) AFAD duyurularını dinleyin.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5"><AlertTriangle className="h-4 w-4" /></div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white block">Karartma Uygulayın</strong>
                    Gece gerçekleşen hava saldırılarında (siren veya anonsla belirtilir) ışıkları kapatın, dışarıdan ışık sızmasını engellemek için kalın perdeleri veya battaniyeleri pencerelere gerin.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
