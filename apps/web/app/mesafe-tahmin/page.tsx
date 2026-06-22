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
    name: 'Adım Sayma',
    nameEn: 'Step Counting',
    icon: <Footprints className="h-7 w-7 text-nomad-green" />,
    description: 'Yetişkin bir insanın ortalama adım uzunluğu 0.75 metredir. Adım sayınızı 0.75 ile çarparak mesafeyi hesaplayabilirsiniz.',
    howTo: [
      'Önce kendi adım uzunluğunuzu ölçün: 10 adım atın, toplam mesafeyi ölçün, 10\'a bölün',
      'Yürürken adımlarınızı sayın',
      'Adım sayısını adım uzunluğunuzla çarpın',
      'Örnek: 1000 adım x 0.75m = 750 metre',
    ],
    formula: 'Mesafe (m) = Adım sayısı x Adım uzunluğu (ortalama 0.75m)',
    practiceExercise: '100 adım atın ve mesafeyi ölçün. Kendi adım uzunluğunuzu hesaplayın. Sonra 500 adım için tahmin yapın ve kontrol edin.',
    tips: [
      'Değişik yüzeylerde adım uzunluğu değişir (yumuşak zeminde kısalır)',
      'Yorgunluk adım uzunluğunu kısaltır',
      'Eğimli arazide adım uzunluğu değişir (yukarı kısalır, aşağı uzar)',
      'Düzgün adımlarla yürümeye çalışın',
    ],
    accuracy: 'Düz zeminde %90+, eğimli arazide %70-80',
  },
  {
    id: 'time-based',
    name: 'Zaman Bazlı Tahmin',
    nameEn: 'Time-Based Estimation',
    icon: <Clock className="h-7 w-7 text-blue-400" />,
    description: 'İnsanların yürüme hızı değişir: düz yolda ~5 km/saat, yukarı ~3 km/saat, aşağı ~6 km/saat. Süre x hız = mesafe.',
    howTo: [
      'Yürüme sürenizi hesaplayın (dakika veya saat)',
      'Arazi tipine göre hız seçin:',
      '  - Düz yol: 5 km/saat (83 m/dakika)',
      '  - Yukarı yokuş: 3 km/saat (50 m/dakika)',
      '  - Aşağı yokuş: 6 km/saat (100 m/dakika)',
      '  - Ağır yük: 3 km/saat',
      '  - Koşma: 8-12 km/saat',
      'Süre x hız = mesafe',
    ],
    formula: 'Mesafe (km) = Hız (km/saat) x Süre (saat)',
    practiceExercise: '10 dakika düz yolda yürüyün. Mesafeyi hesaplayın: 10 dk x 83 m/dk = 830 metre. Ölçümle kontrol edin.',
    tips: [
      'Saat kullanmadan: kendi nabzınızı sayarak süreyi tahmin edin (normal nabız: 60-100/dk)',
      'Bir şarkı söyleyerek süre tutun (ortalama şarkı 3-4 dakika)',
      'Kısa adımlarla 100 adım yaklaşık 1 dakika sürer',
      'Mola sürelerini de hesaba katın',
    ],
    accuracy: 'Düzgün tempo ile %85-90',
  },
  {
    id: 'thumb-jump',
    name: 'Başparmak Atlatma',
    nameEn: 'Thumb-Jump Method',
    icon: <Eye className="h-7 w-7 text-purple-400" />,
    description: 'Kolunuzu uzatın, başparmağınızı uzak nesneye hizalayın. Gözlerinizi değiştirerek başparmağın ne kadar kaydığını ölçün.',
    howTo: [
      'Kolunuzu önünüze doğru tam olarak uzatın',
      'Başparmağınızı dik tutun',
      'Bir gözünüzü kapatın ve başparmağınızı uzak bir nesneye hizalayın',
      'Diğer gözünüzü açın ve öncekini kapatın -- başparmak "atlayacak"',
      'Başparmağın ne kadar kaydığını tahmin edin (nesne boyutuna göre)',
      'Mesafe yaklaşık: (Kol uzunluğu / Göz arası mesafe) x Nesnenin kayma mesafesi',
      'Oransal: Kol uzunluğu ~60cm, göz arası ~6cm, oran ~10x',
      'Yani nesne 10 metre kaydıysa, mesafe yaklaşık 100 metre',
    ],
    formula: 'Mesafe = Kayma mesafesi x 10 (yaklaşık oran)',
    tips: [
      'Alıştırma yaparak kendi oranınızı bulabilirsiniz',
      'Bilinen boyuttaki nesneleri referans alın (araba ~4.5m, kapı ~2m)',
      'Gece veya sisli havada çalışmaz',
      'Çok uzak mesafeler için (1km+) daha az doğru',
    ],
    accuracy: 'Alıştırılmış kullanıcı %70-80, acemi %50-60',
  },
  {
    id: 'landmark-triangulation',
    name: 'Yer İşaretiyle Üçgenleme',
    nameEn: 'Landmark Triangulation',
    icon: <MapPin className="h-7 w-7 text-amber-400" />,
    description: 'İki bilinen yer işaretini kullanarak haritadaki konumunuzu tahmin edin.',
    howTo: [
      'En az iki tanıdık yer işareti belirleyin (tepe, kule, bina)',
      'Bu yer işaretlerinin haritadaki konumlarını bilin',
      'Her yer işaretine göre yönünüzü belirleyin',
      'İki yönün kesiştiği nokta sizin konumunuzdur',
      'Harita üzerinde mesafeyi ölçün',
    ],
    tips: [
      'Üçüncü bir yer işareti doğruluğu artırır',
      'Pusula varsa daha hassas sonuç alırsınız',
      'Belirsiz yer işaretleri kullanmayın',
      'Çok yakın veya çok uzak yer işaretleri doğruluğu azaltır',
    ],
    accuracy: 'İyi yer işaretleri ile %60-75',
  },
  {
    id: 'sound-travel',
    name: 'Ses Yolculuğu',
    nameEn: 'Sound Travel Method',
    icon: <Volume2 className="h-7 w-7 text-cyan-400" />,
    description: 'Ses havada ~343 m/s (saniyede ~343 metre) hızla ilerler. Yıldırım-çakma arası mesafe = saniye / 3 = km.',
    howTo: [
      'Çakma ışığını gördüğünüzde saymaya başlayın',
      'Gök gürültüsünü duyuncaya kadar sayın',
      'Saniyeyi 3\'e bölün = km cinsinden mesafe',
      'Örnek: 9 saniye / 3 = 3 km uzaklıkta',
      'Her 3 saniye yaklaşık 1 km\'dir',
    ],
    formula: 'Mesafe (km) = Saniye / 3',
    tips: [
      'Rüzgar sesin yönünü ve hızını etkiler',
      'Sıcak hava sesi daha hızlı iletir',
      'Bu yöntem sadece yıldırım için değil, patlama gibi diğer sesler için de çalışır',
      'Eko (yankı) yanıltıcı olabilir',
    ],
    accuracy: '%85-95 (açık havada)',
  },
  {
    id: 'visible-horizon',
    name: 'Görünen Ufuk',
    nameEn: 'Visible Horizon',
    icon: <Target className="h-7 w-7 text-rose-400" />,
    description: 'Deniz seviyesinde görünen ufuk yaklaşık 5 km uzaklıktadır. Tepeden bakıldıkça yükselişe göre artar.',
    howTo: [
      'Deniz seviyesinde duruyorsanız: ufuk ~5 km',
      'Yükseklik arttıkça ufuk uzaklaşır:',
      '  - 1.5m boy (ayakta): ~4.4 km',
      '  - 10m yükseklik: ~11.3 km',
      '  - 50m yükseklik: ~25 km',
      '  - 100m yükseklik: ~35.7 km',
      '  - 500m yükseklik: ~80 km',
    ],
    formula: 'Ufuk mesafesi (km) = 3.57 x yükseklik (metre)',
    tips: [
      'Atmosferik koşullar görünürlüğü etkiler',
      'Sis, yağmur veya toz görünürlüğü azaltır',
      'Çok net günlerde ufuk daha uzak görünür',
      'Dağlık bölgelerde bu yöntem daha az işe yarar',
    ],
    accuracy: '%70-80 (hava koşullarına bağlı)',
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
          Yazdır
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
                        Hesaplayıcı / Calculator
                      </h4>

                      {selectedMethod === 'step-counting' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-nomad-slate mb-1 block">Adım Sayısı</label>
                              <input
                                type="number"
                                value={stepCount}
                                onChange={(e) => setStepCount(e.target.value)}
                                placeholder="1000"
                                className="w-full h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-nomad-slate mb-1 block">Adım Uzunluğu (m)</label>
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
                                <option value="flat">Düz yol (5 km/s)</option>
                                <option value="uphill">Yukarı yokuş (3 km/s)</option>
                                <option value="downhill">Aşağı yokuş (6 km/s)</option>
                                <option value="loaded">Ağır yüklü (3 km/s)</option>
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
                            <label className="text-xs text-nomad-slate mb-1 block">Saniye (çakma-gök gürültüsü)</label>
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
                            <label className="text-xs text-nomad-slate mb-1 block">Yükseklik (metre)</label>
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
                      Nasıl Yapılır / How To
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
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">Formül / Formula</h4>
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
                    <h4 className="text-sm font-semibold mb-3">İpuçları / Tips</h4>
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
                    <h4 className="text-sm font-semibold text-amber-300 mb-1">Doğruluk / Accuracy</h4>
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
          <CardTitle>Referans Kartı / Reference Card</CardTitle>
          <CardDescription>Hızlı başvuru için -- yazdırıp yanınızda taşıyabilirsiniz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-nomad-green mb-1">Adım Sayma</h4>
              <p className="text-xs text-nomad-slate">Adım x 0.75m = metre</p>
              <p className="text-xs text-nomad-slate">1000 adım ≈ 750m</p>
            </div>
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-blue-400 mb-1">Zaman Bazlı</h4>
              <p className="text-xs text-nomad-slate">Düz: 83m/dk | Yukarı: 50m/dk | Aşağı: 100m/dk</p>
            </div>
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-cyan-400 mb-1">Ses Yolculuğu</h4>
              <p className="text-xs text-nomad-slate">Saniye / 3 = km</p>
              <p className="text-xs text-nomad-slate">3 saniye ≈ 1 km</p>
            </div>
            <div className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
              <h4 className="font-medium text-rose-400 mb-1">Görünen Ufuk</h4>
              <p className="text-xs text-nomad-slate">3.57 x √yükseklik(m) = km</p>
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
            <h4 className="text-sm font-medium">Neden Önemli / Why It's Important</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            GPS olmadan mesafe tahmin edebilmek, acil durumlarda hayati öneme sahiptir. Yürüyüş rotası planlama,
            yardım mesafesini belirleme ve güvenli bölgeye ulaşma gibi durumlarda bu yöntemler kullanışlı olacaktır.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
