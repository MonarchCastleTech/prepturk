'use client';

import Link from 'next/link';
import { ArrowLeft, Wheat, Sun, Droplets, ThermometerSnowflake, Flame, ShieldAlert, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const KISLIK_METHODS = [
  {
    title: 'Tarhana',
    desc: 'Un, yoğurt, domates, biber ve otların mayalanıp kurutulması. Aylarca bozulmaz, su ve ateşle anında sıcak bir öğün olur.',
    tips: ['Güneş görmeyen, havadar ve kuru bir yerde bez torbalarda saklayın.', 'Nemden uzak tutun, cam kavanoza koyarsanız tam kuruduğundan emin olun.'],
    icon: Sun,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  },
  {
    title: 'Erişte / Makarna',
    desc: 'Yumurta ve unla yapılan hamurun kesilip gölgede kurutulması. Yüksek kalori sağlar ve çok uzun süre dayanır.',
    tips: ['Kuruturken hamurların birbirine yapışmamasına özen gösterin.', 'Bez torbalarda nemsiz ortamda saklayın.'],
    icon: Wheat,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
  {
    title: 'Turşu',
    desc: 'Sebzelerin tuzlu su (salamura) ve sirke içinde laktik asit fermantasyonu ile saklanması. Kış aylarında probiyotik ve vitamin kaynağıdır.',
    tips: ['Kullanılacak tuz mutlaka kaya tuzu olmalı (iyotlu tuz erime yapar).', 'Su kaynatılıp soğutulmuş olmalı.'],
    icon: Droplets,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  {
    title: 'Salça ve Konserve',
    desc: 'Domates ve biberlerin kaynatılıp asitliği yükseltilerek sıcakken vakumlanması.',
    tips: ['Kapaklar mutlaka yeni ve paslanmaz olmalı.', 'Kaynatma süresine (en az 20-30 dk) dikkat edilmeli (Botulizm tehlikesi!).'],
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  },
  {
    title: 'Kurutulmuş Sebze/Meyve',
    desc: 'Patlıcan, biber, fasulye, incir ve kayısının güneşte veya gölgede kurutulması.',
    tips: ['Direkt güneş veya gölge, sebzenin türüne göre seçilmelidir.', 'İyice kurumayanlar küflenir.'],
    icon: ThermometerSnowflake,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  }
];

export default function KislikHazirlikPage() {
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
          <Wheat className="h-8 w-8 text-amber-400" />
          Kışlık Hazırlık ve Anadolu Pratikleri
        </h1>
        <p className="text-slate-400">Elektriksiz ve dolapsız uzun süreli gıda saklama yöntemleri.</p>
      </header>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-tight">Kritik Uyarı (Botulizm)</h3>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                Konserve yaparken hijyene ve kaynama süresine çok dikkat edin. Şişen, bombeli veya köpüren kapaklı konserveleri <strong>kesinlikle tüketmeyin</strong> (Ölümcül zehirlenme riski).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {KISLIK_METHODS.map((method, i) => (
          <Card key={i} className={`border-white/10 bg-white/[0.02]`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-2 rounded-xl ${method.bg} ${method.color}`}>
                  <method.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{method.title}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{method.desc}</p>
              <ul className="space-y-2">
                {method.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check className="h-3 w-3 mt-0.5 text-emerald-400 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
