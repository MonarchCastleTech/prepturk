'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';
import {
  Thermometer, Wind, Droplets, Activity, AlertTriangle, AlertCircle,
  Info, ArrowLeft, Stethoscope, Heart, Brain, Bandage, Shield, X, Printer
} from 'lucide-react';

interface SymptomInfo {
  id: string;
  nameTr: string;
  nameEn: string;
  icon: React.ReactNode;
  immediateAction: string[];
  monitorAndReassess: string[];
  homeCare: string[];
  warningSigns112: string[];
  whatNotToDo: string[];
  firstAidSteps: string[];
  childrenNote?: string;
  elderlyNote?: string;
}

const SYMPTOMS: SymptomInfo[] = [
  {
    id: 'fever',
    nameTr: 'Yüksek Ateş',
    nameEn: 'Fever',
    icon: <Thermometer className="h-8 w-8 text-red-400" />,
    immediateAction: [
      'Ateş 39°C üzeriyse: Ilık su ile silme yapın',
      'Parasetamol/ibuprofen verin (doz: yetişkin 500-1000mg, çocuk 10-15mg/kg)',
      'Bol sıvı verin (su, çay, çorba)',
      'Hafif giydirin, battaniye ile sarmayın',
    ],
    monitorAndReassess: [
      'Her 4 saatte ateşi ölçün',
      'Sıvı alımını takip edin',
      'İlaçlama sonrası 1-2 saat içinde düşüş yoksa tekrar değerlendirin',
      'Belirtiler 3 günden fazla sürüyorsa doktora danışın',
    ],
    homeCare: [
      'Dinlenme: Yatak istirahati',
      'Sıvı: Günde en az 2-3 litre',
      'Hafif yiyecekler: Çorba, pilav, muz',
      'Oda sıcaklığını normal tutun (20-22°C)',
      'Ilık duş (soğuk değil)',
    ],
    warningSigns112: [
      'Ateş 40°C üzeri ve düşmüyorsa',
      'Bilinç bulanıklığı veya konfüzyon',
      'Boyun sertliği (menenjit şüphesi)',
      'Nöbet geçirme',
      'Mor döküntü (ciltte kanama)',
      'Nefes almada zorluk',
    ],
    whatNotToDo: [
      'ALKOL ile silme YAPMAYIN (zehirlenme riski)',
      'Aspirin çocuklara VERMEYİN (Reye sendromu riski)',
      'Battaniye ile sarmayın (ateşi daha da yükseltir)',
      'Buzlu su kullanmayın (titreme ateşi yükseltir)',
    ],
    firstAidSteps: [
      'Ateşi ölçün (mümkünse)',
      'Hafif giydirin',
      'Ilık suyla alın, boyun, kasık bölgesini silin',
      'Parasetamol verin',
      'Bol sıvı içirin',
      '30 dakika sonra tekrar ölçün',
    ],
    childrenNote: 'Çocuklarda 38.5°C üzeri ateş önemlidir. 3 aydan küçük bebeklerde 38°C üzeri ateş ACİL DURUM -- hemen 112\'yi arayın.',
    elderlyNote: 'Yaşlılarda ateş düşük olabilir ama enfeksiyon ciddi olabilir. 37.8°C üzeri dikkatle izlenmelidir.',
  },
  {
    id: 'breathing',
    nameTr: 'Nefes Darlığı',
    nameEn: 'Breathing Difficulty',
    icon: <Wind className="h-8 w-8 text-blue-400" />,
    immediateAction: [
      'HEMEN 112\'yi arayın',
      'Hastayı yarı oturur pozisyona getirin',
      'Dar giysileri gevşetin',
      'Temiz hava akışı sağlayın',
      'Sakinleştirin -- panik nefes darlığını artırır',
      'Varsa inhaler veya oksijen verin',
    ],
    monitorAndReassess: [
      'Nefes hızını sayın (normal: 12-20/dk)',
      'Dudak ve tırnak rengini kontrol edin (morarma = acil)',
      'Konuşabilip konuşamadığını kontrol edin',
      'Bilinç durumunu takip edin',
    ],
    homeCare: [
      'Dik oturma pozisyonu',
      'Dudak büzerek nefes verme (pursed-lip breathing)',
      'Yavaş, derin nefes egzersizleri',
      'Sakin ortam, stres azaltma',
    ],
    warningSigns112: [
      'Dudaklarda veya yüzde morarma',
      'Konuşamama (tek kelime bile)',
      'Göğüs iç çekilmeleri',
      'Bilinç kaybı',
      'Nefes sesi gelmiyorsa',
      'Hızlı nefes (30+/dk)',
    ],
    whatNotToDo: [
      'Hastayı yatırmayın (nefes alma zorlaşır)',
      'Yiyecek veya içecek vermeyin (boğulma riski)',
      'Paniğe kapılmayın -- sakin olun',
    ],
    firstAidSteps: [
      '112\'yi arayın',
      'Yarı oturur pozisyonda oturtun',
      'Giysileri gevşetin',
      'Temiz hava sağlayın',
      'Varsa ilaçlarını verin',
      'Bilinç kaybı olursa: yatırın, yan çevirin',
      'Nefes durursa: CPR başlayın',
    ],
  },
  {
    id: 'chest-pain',
    nameTr: 'Göğüs Ağrısı',
    nameEn: 'Chest Pain',
    icon: <Heart className="h-8 w-8 text-rose-400" />,
    immediateAction: [
      'HEMEN 112\'yi arayın',
      'Hastayı yarı oturur pozisyonda dinlendirin',
      'Varsa aspirin çiğnetin (300mg, alerjisi yoksa)',
      'Dar giysileri gevşetin',
      'Hareket etmesini engelleyin',
    ],
    monitorAndReassess: [
      'Ağrının yayılımını takip edin (kol, çene, sırt)',
      'Nabız ve nefes hızını kontrol edin',
      'Terleme var mı kontrol edin',
      'Bilinç durumunu takip edin',
    ],
    homeCare: [
      'Sadece 112 gelene kadar bekleme',
      'Sakin tutun, hareket ettirmeyin',
      'Kapıyı açık bırakın (sağlık ekibi için)',
    ],
    warningSigns112: [
      'Göğüste baskı, sıkışma veya ağrı (5+ dakika)',
      'Sol kola yayılan ağrı',
      'Çene, boyun veya sırt ağrısı',
      'Soğuk terleme',
      'Bulantı veya kusma',
      'Nefes darlığı',
    ],
    whatNotToDo: [
      'Hastayı YÜRÜTMEYİN veya taşımayın',
      'Yiyecek veya içecek VERMEYİN',
      'Ağrı kesici vermeyin (belirtileri maskeler)',
      'Yalnız bırakmayın',
    ],
    firstAidSteps: [
      '112\'yi arayın',
      'Yarı oturur pozisyonda oturtun',
      '300mg aspirin çiğnetin (alerji yoksa)',
      'Giysileri gevşetin',
      'Sakinleştirin',
      'Kalp durursa: CPR + 112',
    ],
  },
];

export default function SemptomKontrolPage() {
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomInfo | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        {selectedSymptom && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedSymptom(null)} className="text-slate-400">
            <X className="h-4 w-4 mr-1" />
            Semptom Seçimine Dön
          </Button>
        )}
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-emerald-400" />
          Semptom Kontrol & Triaj
        </h1>
        <p className="text-slate-400">Belirtilere göre acil durum önceliği belirleme ve ilk müdahale rehberi.</p>
      </header>

      {/* Critical Disclaimer */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400 uppercase tracking-tight">Tıbbi Uyarı</h3>
              <p className="text-sm text-red-200/80 mt-1 leading-relaxed">
                Bu sistem bir teşhis aracı değildir. Acil durumlarda vakit kaybetmeden <strong>112</strong>'yi arayın. 
                Buradaki bilgiler resmî kılavuzlara dayalı genel bilgilendirme amaçlıdır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSymptom ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYMPTOMS.map((symptom) => (
            <button
              key={symptom.id}
              onClick={() => setSelectedSymptom(symptom)}
              className="group relative p-6 rounded-2xl border border-white/8 bg-white/[0.02] text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
            >
              <div className="mb-4 inline-flex p-3 rounded-xl bg-black/20 group-hover:scale-110 transition-transform">
                {symptom.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{symptom.nameTr}</h3>
              <p className="text-sm text-slate-400 mt-1">{symptom.nameEn}</p>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Detayları Gör <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Immediate & 112 */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-red-500/30 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Anında Aksiyon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {selectedSymptom.immediateAction.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-red-100">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-white/8 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    İlk Yardım Adımları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {selectedSymptom.firstAidSteps.map((step, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300">
                        {step}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Warnings & Notes */}
            <div className="space-y-6">
              <Card className="border-red-600/40 bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-red-400 text-base uppercase tracking-wider">
                    112 Çağrılmalı:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedSymptom.warningSigns112.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-amber-400 text-sm font-bold uppercase">Yapmayın:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedSymptom.whatNotToDo.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-200/70">
                        <X className="h-3 w-3 mt-0.5 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer UI */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => window.print()} className="border-white/10 text-slate-400">
              <Printer className="h-4 w-4 mr-2" />
              Bu Semptom Kartını Yazdır
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
