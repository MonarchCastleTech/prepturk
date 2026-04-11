'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Footprints, Clock, Eye, MapPin, Volume2, Ruler, Info, Printer,
  ArrowRight, Calculator, Target, BookOpen
} from 'lucide-react';

interface DistanceMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  description: string;
  howTo: string[];
  formula?: string;
  practiceExercise?: string;
  tips: string[];
  accuracy: string;
}

const METHODS: DistanceMethod[] = [
  {
    id: 'step-counting',
    name: 'Adim Sayma',
    nameEn: 'Step Counting',
    icon: <Footprints className="h-7 w-7 text-nomad-green" />,
    description: 'Yetiskin bir insanin ortalama adim uzunlugu 0.75 metredir. Adim sayinizi 0.75 ile carparak mesafeyi hesaplayabilirsiniz.',
    howTo: [
      'Once kendi adim uzunlugunuzu olcun: 10 adim atin, toplam mesafeyi olcun, 10\'a bolun',
      'Yururken adimlarinizi sayin',
      'Adim sayisini adim uzunlugunuzla carpin',
      'Ornek: 1000 adim x 0.75m = 750 metre',
    ],
    formula: 'Mesafe (m) = Adim sayisi x Adim uzunlugu (ortalama 0.75m)',
    practiceExercise: '100 adim atin ve mesafeyi olcun. Kendi adim uzunlugunuzu hesaplayin. Sonra 500 adim icin tahmin yapin ve kontrol edin.',
    tips: [
      'Degisik yuzeylerde adim uzunlugu degisir (yumusak zeminde kisalir)',
      'Yorgunluk adim uzunlugunu kisaltir',
      'Egitimli arazide adim uzunlugu degisir (yukari kisalir, asagi uzar)',
      'Duzgun adimlarla yurumeye calisin',
    ],
    accuracy: 'Duz zeminde %90+, egitimli arazide %70-80',
  },
  {
    id: 'time-based',
    name: 'Zaman Bazli Tahmin',
    nameEn: 'Time-Based Estimation',
    icon: <Clock className="h-7 w-7 text-blue-400" />,
    description: 'Insanlarin yurume hizi degisir: duz yolda ~5 km/saat, yukari ~3 km/saat, asagi ~6 km/saat. Sure x hiz = mesafe.',
    howTo: [
      'Yurume surenizi hesaplayin (dakika veya saat)',
      'Arazi tipine gore hiz secin:',
      '  - Duz yol: 5 km/saat (83 m/dakika)',
      '  - Yukari yokuş: 3 km/saat (50 m/dakika)',
      '  - Asagi yokuş: 6 km/saat (100 m/dakika)',
      '  - Agir yuk: 3 km/saat',
      '  - Kosma: 8-12 km/saat',
      'Sure x hiz = mesafe',
    ],
    formula: 'Mesafe (km) = Hiz (km/saat) x Sure (saat)',
    practiceExercise: '10 dakika duz yolda yuruyun. Mesafeyi hesaplayin: 10 dk x 83 m/dk = 830 metre. Olcumle kontrol edin.',
    tips: [
      'Saat kullanmadan: kendi nabzinizi sayarak sureyi tahmin edin (normal nabiz: 60-100/dk)',
      'Bir sarkı soyleyerek sure tutun (ortalama sarkı 3-4 dakika)',
      'Kisa adimlarla 100 adim yaklasık 1 dakika surer',
      'Mola surelerini de hesaba katin',
    ],
    accuracy: 'Duzgun tempo ile %85-90',
  },
  {
    id: 'thumb-jump',
    name: 'Basparmak Atlatma',
    nameEn: 'Thumb-Jump Method',
    icon: <Eye className="h-7 w-7 text-purple-400" />,
    description: 'Kolinizi uzatin, basparmaginizi uzak nesneye hizalayin. Gozlerinizi degistirerek basparmagin ne kadar kaydigini olcun.',
    howTo: [
      'Kolinuzu onunuze dogru tam olarak uzatin',
      'Basparmaginizi dik tutun',
      'Bir gozunuzu kapatin ve basparmaginizi uzak bir nesneye hizalayin',
      'Diger gozunuzu acin ve oncekini kapatin -- basparmak "atlayacak"',
      'Basparmagin ne kadar kaydigini tahmin edin (nesne boyutuna gore)',
      'Mesafe yaklasik: (Kol uzunlugu / Goz arası mesafe) x Nesnenin kayma mesafesi',
      'Oransal: Kol uzunlugu ~60cm, goz arasi ~6cm, oran ~10x',
      'Yani nesne 10 metre kaydiysa, mesafe yaklasik 100 metre',
    ],
    formula: 'Mesafe = Kayma mesafesi x 10 (yaklasik oran)',
    tips: [
      'Alıştırma yaparak kendi oranınızı bulabilirsiniz',
      'Bilinen boyuttaki nesneleri referans alin (araba ~4.5m, kapi ~2m)',
      'Gece veya sisli hava de calismaz',
      'Cok uzak mesafeler icin (1km+) daha az dogru',
    ],
    accuracy: 'Alıştırılmış kullanıcı %70-80, acemi %50-60',
  },
  {
    id: 'landmark-triangulation',
    name: 'Yer Isle Ucgenleme',
    nameEn: 'Landmark Triangulation',
    icon: <MapPin className="h-7 w-7 text-amber-400" />,
    description: 'Iki bilinen yer isaretini kullanarak haritadaki konumunuzu tahmin edin.',
    howTo: [
      'En az iki tanidik yer isareti belirleyin (tepe, kule, bina)',
      'Bu yer isaretlerinin haritadaki konumlarini bilin',
      'Her yer isaretine gore yonunuzu belirleyin',
      'Iki yonun kesistigi nokta sizin konumunuzdur',
      'Harita uzerinde mesafeyi olcun',
    ],
    tips: [
      'Ucuncu bir yer isareti dogrulugu artırır',
      'Pusula varsa daha hassas sonuc alirsiniz',
      'Belirsiz yer isaretleri kullanmayın',
      'Cok yakin veya cok uzak yer isaretleri dogruluğu azaltir',
    ],
    accuracy: 'Iyi yer isaretleri ile %60-75',
  },
  {
    id: 'sound-travel',
    name: 'Ses Yolculugu',
    nameEn: 'Sound Travel Method',
    icon: <Volume2 className="h-7 w-7 text-cyan-400" />,
    description: 'Ses havada ~343 m/s (saniyede ~343 metre) hizla ilerler. Yildirim-cakma arasi mesafe = saniye / 3 = km.',
    howTo: [
      'Cakma isigini gordugunuzde saymaya baslayin',
      'Gokgurultusunu duyuncaya kadar sayin',
      'Saniyeyi 3\'e bolun = km cinsinden mesafe',
      'Ornek: 9 saniye / 3 = 3 km uzaklikta',
      'Her 3 saniye yaklasik 1 km\'dir',
    ],
    formula: 'Mesafe (km) = Saniye / 3',
    tips: [
      'Ruzgar sesin yonunu ve hizini etkiler',
      'Sicak hava sesi daha hizli iletir',
      'Bu yontem sadece yildirim icin degil, patlama gibi diger sesler icin de calisir',
      'Eko (yankı) yaniltici olabilir',
    ],
    accuracy: '%85-95 (acik havada)',
  },
  {
    id: 'visible-horizon',
    name: 'Gorunen Ufuk',
    nameEn: 'Visible Horizon',
    icon: <Target className="h-7 w-7 text-rose-400" />,
    description: 'Deniz seviyesinde gorunen ufuk yaklasik 5 km uzakliktadir. Tepeden bakildikca yukselise gore artar.',
    howTo: [
      'Deniz seviyesinde duruyorsanız: ufuk ~5 km',
      'Yukseklik arttikca ufuk uzaklasir:',
      '  - 1.5m boy (ayakta): ~4.4 km',
      '  - 10m yukseklik: ~11.3 km',
      '  - 50m yukseklik: ~25 km',
      '  - 100m yukseklik: ~35.7 km',
      '  - 500m yukseklik: ~80 km',
    ],
    formula: 'Ufuk mesafesi (km) = 3.57 x yukselk (metre)',
    tips: [
      'Atmosferik kosullar gorunurlugu etkiler',
      'Sis, yagmur veya toz gorunurlugu azaltir',
      'Cok net gunlerde ufuk daha uzak gorunur',
      'Daglik bolgelerde bu yontem daha az ise yarar',
    ],
    accuracy: '%70-80 (hava kosullarina bagli)',
  },
];

export default function MesafeTahminPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState('');
  const [customStepLength, setCustomStepLength] = useState('0.75');
  const [timeMinutes, setTimeMinutes] = useState('');
  const [terrain, setTerrain] = useState('flat');
  const [soundSeconds, setSoundSeconds] = useState('');
  const [heightMeters, setHeightMeters] = useState('');

  const calculatedDistance = () => {
    if (selectedMethod === 'step-counting' && stepCount) {
      return (parseFloat(stepCount) * parseFloat(customStepLength)).toFixed(0) + ' metre';
    }
    if (selectedMethod === 'time-based' && timeMinutes) {
      const speeds: Record<string, number> = { flat: 83, uphill: 50, downhill: 100, loaded: 50 };
      return (parseFloat(timeMinutes) * (speeds[terrain] || 83)).toFixed(0) + ' metre';
    }
    if (selectedMethod === 'sound-travel' && soundSeconds) {
      return (parseFloat(soundSeconds) / 3).toFixed(1) + ' km';
    }
    if (selectedMethod === 'visible-horizon' && heightMeters) {
      return (3.57 * Math.sqrt(parseFloat(heightMeters))).toFixed(1) + ' km';
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ruler className="h-7 w-7 text-nomad-green" />
            Mesafe Tahmini
          </h1>
          <p className="text-nomad-slate text-sm">Distance Estimation Without GPS</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />
          Yazdir
        </Button>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`p-4 rounded-lg border text-center transition-all ${
              selectedMethod === method.id
                ? 'border-nomad-green bg-nomad-green/10'
                : 'border-nomad-border bg-nomad-surface hover:border-nomad-green/30'
            }`}
          >
            <div className="flex justify-center mb-2">{method.icon}</div>
            <p className="text-sm font-medium">{method.name}</p>
            <p className="text-xs text-nomad-slate">{method.nameEn}</p>
          </button>
        ))}
      </div>

      {/* Selected Method Detail */}
      {selectedMethod && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {METHODS.find((m) => m.id === selectedMethod)?.icon}
              <div>
                <span>{METHODS.find((m) => m.id === selectedMethod)?.name}</span>
                <p className="text-sm text-nomad-slate font-normal">{METHODS.find((m) => m.id === selectedMethod)?.nameEn}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const method = METHODS.find((m) => m.id === selectedMethod);
              if (!method) return null;

              return (
                <>
                  <p className="text-sm text-foreground">{method.description}</p>

                  {/* Calculator */}
                  {(selectedMethod === 'step-counting' || selectedMethod === 'time-based' ||
                    selectedMethod === 'sound-travel' || selectedMethod === 'visible-horizon') && (
                    <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-nomad-green" />
                        Hesaplayici / Calculator
                      </h4>

                      {selectedMethod === 'step-counting' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-nomad-slate mb-1 block">Adim Sayisi</label>
                              <input
                                type="number"
                                value={stepCount}
                                onChange={(e) => setStepCount(e.target.value)}
                                placeholder="1000"
                                className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-nomad-slate mb-1 block">Adim Uzunlugu (m)</label>
                              <input
                                type="number"
                                value={customStepLength}
                                onChange={(e) => setCustomStepLength(e.target.value)}
                                step="0.01"
                                className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                              />
                            </div>
                          </div>
                          {calculatedDistance() && (
                            <div className="p-3 bg-nomad-green/10 border border-nomad-green/30 rounded-lg text-center">
                              <p className="text-2xl font-bold text-nomad-green">{calculatedDistance()}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedMethod === 'time-based' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-nomad-slate mb-1 block">Süre (dakika)</label>
                              <input
                                type="number"
                                value={timeMinutes}
                                onChange={(e) => setTimeMinutes(e.target.value)}
                                placeholder="10"
                                className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-nomad-slate mb-1 block">Arazi Tipi</label>
                              <select
                                value={terrain}
                                onChange={(e) => setTerrain(e.target.value)}
                                className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                              >
                                <option value="flat">Duz yol (5 km/s)</option>
                                <option value="uphill">Yukari yokuş (3 km/s)</option>
                                <option value="downhill">Asagi yokuş (6 km/s)</option>
                                <option value="loaded">Agir yuklu (3 km/s)</option>
                              </select>
                            </div>
                          </div>
                          {calculatedDistance() && (
                            <div className="p-3 bg-nomad-green/10 border border-nomad-green/30 rounded-lg text-center">
                              <p className="text-2xl font-bold text-nomad-green">{calculatedDistance()}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedMethod === 'sound-travel' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-nomad-slate mb-1 block">Saniye (cakma-gokgurultu)</label>
                            <input
                              type="number"
                              value={soundSeconds}
                              onChange={(e) => setSoundSeconds(e.target.value)}
                              placeholder="9"
                              className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                            />
                          </div>
                          {calculatedDistance() && (
                            <div className="p-3 bg-nomad-green/10 border border-nomad-green/30 rounded-lg text-center">
                              <p className="text-2xl font-bold text-nomad-green">{calculatedDistance()}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedMethod === 'visible-horizon' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-nomad-slate mb-1 block">Yukselk (metre)</label>
                            <input
                              type="number"
                              value={heightMeters}
                              onChange={(e) => setHeightMeters(e.target.value)}
                              placeholder="50"
                              className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                            />
                          </div>
                          {calculatedDistance() && (
                            <div className="p-3 bg-nomad-green/10 border border-nomad-green/30 rounded-lg text-center">
                              <p className="text-2xl font-bold text-nomad-green">{calculatedDistance()}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* How To */}
                  <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-nomad-green" />
                      Nasil Yapilir / How To
                    </h4>
                    <ol className="space-y-2">
                      {method.howTo.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Formula */}
                  {method.formula && (
                    <div className="p-3 bg-blue-950/30 border border-blue-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">Formul / Formula</h4>
                      <p className="text-sm text-blue-200 font-mono">{method.formula}</p>
                    </div>
                  )}

                  {/* Practice Exercise */}
                  {method.practiceExercise && (
                    <div className="p-3 bg-purple-950/30 border border-purple-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-300 mb-1">Alıştırma / Practice Exercise</h4>
                      <p className="text-sm text-purple-200">{method.practiceExercise}</p>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <h4 className="text-sm font-semibold mb-3">Ipuclari / Tips</h4>
                    <ul className="space-y-2">
                      {method.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-nomad-green flex-shrink-0 mt-1" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Accuracy */}
                  <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-amber-300 mb-1">Dogruluk / Accuracy</h4>
                    <p className="text-sm text-amber-200">{method.accuracy}</p>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Printable Reference Card */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardHeader>
          <CardTitle>Referans Karti / Reference Card</CardTitle>
          <CardDescription>Hizli basvuru icin -- yazdirip yaninizda tasıyabilirsiniz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-nomad-green mb-1">Adim Sayma</h4>
              <p className="text-xs text-nomad-slate">Adim x 0.75m = metre</p>
              <p className="text-xs text-nomad-slate">1000 adim ≈ 750m</p>
            </div>
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-blue-400 mb-1">Zaman Bazli</h4>
              <p className="text-xs text-nomad-slate">Duz: 83m/dk | Yukari: 50m/dk | Asagi: 100m/dk</p>
            </div>
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-cyan-400 mb-1">Ses Yolculugu</h4>
              <p className="text-xs text-nomad-slate">Saniye / 3 = km</p>
              <p className="text-xs text-nomad-slate">3 saniye ≈ 1 km</p>
            </div>
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-rose-400 mb-1">Gorunen Ufuk</h4>
              <p className="text-xs text-nomad-slate">3.57 x √yukseklik(m) = km</p>
              <p className="text-xs text-nomad-slate">Deniz seviyesi: ~5 km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-nomad-border">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Neden OneMLI / Why It's Important</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            GPS olmadan mesafe tahmin edebilmek, acil durumlarda hayati oneme sahiptir. Yuruyus rotasi planlama,
            yardim mesafesini belirleme ve guvenli bolgeye ulasma gibi durumlarda bu yontemler kullanisli olacaktir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
