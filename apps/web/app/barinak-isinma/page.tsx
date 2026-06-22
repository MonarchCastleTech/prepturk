'use client';

import { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Snowflake,
  Sun,
  Printer,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Wind,
  Droplets,
  Info,
  X,
  CheckSquare,
} from 'lucide-react';

interface RegionData {
  name: string;
  nameEn: string;
  tempRange: string;
  tempRangeEn: string;
  description: string;
  descriptionEn: string;
  tips: { tr: string; en: string }[];
  icon: typeof Snowflake;
}

const REGIONS: RegionData[] = [
  {
    name: 'İstanbul / Marmara',
    nameEn: 'Istanbul / Marmara',
    tempRange: '0°C ila 10°C',
    tempRangeEn: '0°C to 10°C',
    description: 'Nemli soğuk, rüzgar hissi artırır. Yağmur ve kar karışık.',
    descriptionEn: 'Humid cold, wind chill increases effect. Mixed rain and snow.',
    tips: [
      { tr: 'Rüzgar geçirmez katman giy', en: 'Wear windproof layers' },
      { tr: 'Nem yalıtımı azaltır, kuru tut', en: 'Humidity reduces insulation, keep dry' },
      { tr: 'Pencerelere plastik film yapıştır', en: 'Apply plastic film to windows' },
    ],
    icon: Wind,
  },
  {
    name: 'Ege',
    nameEn: 'Aegean',
    tempRange: '5°C ila 15°C',
    tempRangeEn: '5°C to 15°C',
    description: 'Ilıman, daha az sert. Gece donları olabilir.',
    descriptionEn: 'Milder, less severe. Night frosts possible.',
    tips: [
      { tr: 'Gece sıcaklık düşüşü için hazırlıklı ol', en: 'Be prepared for night temperature drops' },
      { tr: 'Katlı giyinme yeterli olabilir', en: 'Layered clothing may be sufficient' },
    ],
    icon: Wind,
  },
  {
    name: 'Akdeniz',
    nameEn: 'Mediterranean',
    tempRange: '5°C ila 15°C',
    tempRangeEn: '5°C to 15°C',
    description: 'En ilıman bölge. Nadiren don.',
    descriptionEn: 'Mildest region. Rarely freezing.',
    tips: [
      { tr: 'Hafif ısınma yeterli', en: 'Light heating is sufficient' },
      { tr: 'Yağışlı günler için hazırlıklı ol', en: 'Be prepared for rainy days' },
    ],
    icon: Sun,
  },
  {
    name: 'İç Anadolu (Ankara)',
    nameEn: 'Central Anatolia (Ankara)',
    tempRange: '-15°C ila 5°C',
    tempRangeEn: '-15°C to 5°C',
    description: 'Sert ve kuru soğuk. Büyük sıcaklık farkları.',
    descriptionEn: 'Harsh, dry cold. Large temperature differences.',
    tips: [
      { tr: 'Ağır ısınma şart, birden fazla yöntem kullan', en: 'Heavy heating essential, use multiple methods' },
      { tr: 'Su borularını donmaya karşı yalıt', en: 'Insulate water pipes against freezing' },
      { tr: 'Kapı ve pencereleri çift katman yalıt', en: 'Double-layer insulate doors and windows' },
    ],
    icon: Snowflake,
  },
  {
    name: 'Doğu Anadolu (Erzurum, Van)',
    nameEn: 'Eastern Anatolia (Erzurum, Van)',
    tempRange: '-30°C ila -5°C',
    tempRangeEn: '-30°C to -5°C',
    description: 'Aşırı soğuk. Hayati tehlike. Hazırlık şart.',
    descriptionEn: 'Extreme cold. Life-threatening. Preparation essential.',
    tips: [
      { tr: 'Mümkünse tek bir odada toplan, ısıt', en: 'If possible, gather in one room, heat it' },
      { tr: 'Katlı battaniye, uyku tulumu kullan', en: 'Use layered blankets, sleeping bags' },
      { tr: 'Sıcak içecekler için su hazırla', en: 'Prepare water for hot drinks' },
      { tr: 'Hipotermi belirtilerini tanımayı öğren', en: 'Learn to recognize hypothermia symptoms' },
    ],
    icon: Snowflake,
  },
  {
    name: 'Karadeniz',
    nameEn: 'Black Sea',
    tempRange: '0°C ila 10°C',
    tempRangeEn: '0°C to 10°C',
    description: 'Çok nemli, hissedilen sıcaklık daha düşük.',
    descriptionEn: 'Very humid, feels colder than actual temperature.',
    tips: [
      { tr: 'Nem yalıtımı azaltır, ekstra katman kullan', en: 'Humidity reduces insulation, use extra layers' },
      { tr: 'Küf önleyici havalandırma yap', en: 'Ventilate to prevent mold' },
      { tr: 'Nem alıcı kullan (tuz, kireç)', en: 'Use dehumidifiers (salt, lime)' },
    ],
    icon: Droplets,
  },
];

export default function BarinakIsinmaPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    heating: true,
    insulation: false,
    regions: false,
    cooling: false,
  });

  const toggle = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-nomad-bg p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-nomad-green mb-1">
              Barınak ve Isınma Rehberi
            </h1>
            <p className="text-nomad-slate text-sm">
              Shelter & Warmth Guide -- Turkey Climate Zones
            </p>
          </div>
          <button onClick={printPage} className="btn-secondary flex items-center gap-2 no-print">
            <Printer className="h-4 w-4" />
            Yazdır / Print
          </button>
        </header>

        {/* Section 1: Improvised Heating */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('heating')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-orange-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Doğaçlama Isınma</h2>
                <p className="text-nomad-slate text-sm">Improvised Heating</p>
              </div>
            </div>
            {expanded.heating ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.heating && (
            <div className="px-5 pb-5 space-y-6">
              {/* Safe Methods */}
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Güvenli Yöntemler / Safe Methods
                </h3>
                <div className="space-y-4">
                  <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <h4 className="font-medium text-white mb-2">Mum ve Tencere Yöntemi / Candle Heater</h4>
                    <p className="text-sm text-foreground mb-2">
                      Terracotta çiçek saksısının içine ters çevrilmiş, mum üstüne yerleştirilir.
                      Terracotta ısıyı emer ve yayar. Küçük alanda 1-2°C artış sağlar.
                    </p>
                    <p className="text-xs text-nomad-slate">
                      Terracotta pot inverted over candle. Terracotta absorbs and radiates heat.
                      Provides 1-2°C increase in small area.
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-foreground">
                      <li>1. Büyük mum (7-10 saatlik) yak</li>
                      <li>2. Üzerine küçük terracotta saksı yerleştir (delik açık)</li>
                      <li>3. Üzerine büyük terracotta saksıyı ters çevir</li>
                      <li>4. Metal cıvata ile üst üste tut</li>
                    </ol>
                    <div className="mt-3 bg-red-950/50 border border-red-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-red-300 text-sm font-medium">
                            CO UYARISI: Kapalı alanda mum yakmak karbonmonoksit üretir.
                          </p>
                          <p className="text-red-400 text-xs">
                            CO WARNING: Burning candles in enclosed space produces carbon monoxide.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <h4 className="font-medium text-white mb-2">Sıcak Su Torbası / Hot Water Bottle</h4>
                    <p className="text-sm text-foreground mb-2">
                      Sıcak su ile doldurulan şişe veya torba, yatak/kişi ısıtma için kullanılır.
                      4-6 saat sıcaklık verir.
                    </p>
                    <p className="text-xs text-nomad-slate">
                      Bottle or bag filled with hot water, used for bed/person heating.
                      Provides 4-6 hours of warmth.
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-foreground">
                      <li>1. Cam şişeyi sıcak (kaynar değil) su ile doldur</li>
                      <li>2. Bez veya havluya sar (yanık önlemek için)</li>
                      <li>3. Yatak ayak ucuna veya karnına yerleştir</li>
                    </ol>
                  </div>

                  <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <h4 className="font-medium text-white mb-2">Katlı Battaniye / Layered Blankets</h4>
                    <p className="text-sm text-foreground mb-2">
                      Vücut ısısını hapsetmek için kat kat battaniye kullan.
                      Alt katmanlar: battaniye, yorgan, elbise, vs.
                    </p>
                    <p className="text-xs text-nomad-slate">
                      Use layered blankets to trap body heat.
                      Bottom layers: blanket, comforter, clothing, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dangerous Methods */}
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <X className="h-5 w-5" />
                  TEHLİKELİ Yöntemler -- ASLA YAPMA / DANGEROUS -- DO NOT USE
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-red-300 font-medium">Fırında ısınma / Using oven for heating</p>
                        <p className="text-red-400 text-xs mt-1">
                          Gaz fırınları CO üretir, yangın riski vardır. ASLA kullanma.
                        </p>
                        <p className="text-red-500 text-xs">
                          Gas ovens produce CO, fire risk. NEVER use.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-red-300 font-medium">İçerde kömür yakma / Burning charcoal indoors</p>
                        <p className="text-red-400 text-xs mt-1">
                          Kömür kapalı alanda ölümcül CO üretir. Her yıl ölümler oluyor.
                        </p>
                        <p className="text-red-500 text-xs">
                          Charcoal produces deadly CO indoors. Deaths occur every year.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-red-300 font-medium">Havasız doğalgaz sobası / Unvented gas heater</p>
                        <p className="text-red-400 text-xs mt-1">
                          Havalandırma olmadan doğalgaz sobaları CO zehirlenmesine yol açar.
                        </p>
                        <p className="text-red-500 text-xs">
                          Gas heaters without ventilation lead to CO poisoning.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CO Warning Box */}
              <div className="bg-red-950/70 border-2 border-red-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-400 shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-red-300 mb-2">
                      KARBONMONOKSİT UYARISI
                    </h4>
                    <h5 className="text-sm font-medium text-red-400 mb-3">
                      CARBON MONOXIDE WARNING
                    </h5>
                    <p className="text-red-300 text-sm mb-2">
                      Karbonmonoksit kokusuzdur, renksizdir. Zehirlenme belirtileri:
                    </p>
                    <p className="text-red-400 text-xs mb-3">
                      Carbon monoxide is odorless, colorless. Poisoning symptoms:
                    </p>
                    <ul className="space-y-1 text-red-300 text-sm">
                      <li>- Baş ağrısı / Headache</li>
                      <li>- Bulantı / Nausea</li>
                      <li>- Baş dönmesi / Dizziness</li>
                      <li>- Halsizlik / Weakness</li>
                      <li>- Bilinç kaybı / Loss of consciousness</li>
                    </ul>
                    <p className="text-red-300 text-sm font-medium mt-3">
                      Şüphelenirsen: HEMEN dışarı çık, 112&apos;yi ara.
                    </p>
                    <p className="text-red-400 text-xs">
                      If suspected: Leave IMMEDIATELY, call 112.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Insulation */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('insulation')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Thermometer className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Yalıtım Teknikleri</h2>
                <p className="text-nomad-slate text-sm">Insulation Techniques</p>
              </div>
            </div>
            {expanded.insulation ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.insulation && (
            <div className="px-5 pb-5 space-y-4">
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Pencere Yalıtımı / Window Insulation
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Plastik film: Pencere çerçevesine bantla yapıştır (çift cam etkisi)</li>
                  <li>- Gazete: Camlara gazete yapıştır (ucuz, etkili)</li>
                  <li>- Battaniye: Kalın battaniyeni pencereye as</li>
                  <li>- Plastic film: Tape to window frame (double-pane effect)</li>
                  <li>- Newspaper: Apply newspaper to glass (cheap, effective)</li>
                  <li>- Blanket: Hang thick blanket over window</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Kapı Yalıtımı / Door Draft Stopping
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Havlu rulo: Kapı altına havlu rulo yerleştir</li>
                  <li>- Fitil kaplama: Kapı çevresine fitil kaplama</li>
                  <li>- Battaniye: Kapı arkasına battaniye as</li>
                  <li>- Towel roll: Place rolled towel under door</li>
                  <li>- Weather stripping: Apply weather stripping around door</li>
                  <li>- Blanket: Hang blanket behind door</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Zemin Yalıtımı / Floor Insulation
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Karton: Zemini karton ile kapla (yukarı ısı kaybı azalır)</li>
                  <li>- Halı: Ekstra halı veya kilim kullan</li>
                  <li>- Gazete: Kat kat gazete ser (geçici yöntem)</li>
                  <li>- Cardboard: Cover floor with cardboard (reduces upward heat loss)</li>
                  <li>- Rug: Use extra rugs or carpets</li>
                  <li>- Newspaper: Lay layered newspaper (temporary method)</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Tavan Isı Tutma / Ceiling Heat Retention
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Battaniye: Tavana battaniye as (ısı yukarı kaçmaz)</li>
                  <li>- Alüminyum folyo: Tavana alüminyum folyo yapıştır (ısı yansıtır)</li>
                  <li>- Blanket: Hang blanket from ceiling (prevents heat rising)</li>
                  <li>- Aluminum foil: Apply foil to ceiling (reflects heat)</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Regional Winter */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('regions')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Snowflake className="h-6 w-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Bölgesel Kış Hayatta Kalma</h2>
                <p className="text-nomad-slate text-sm">Regional Winter Survival</p>
              </div>
            </div>
            {expanded.regions ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.regions && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {REGIONS.map((region, idx) => {
                const Icon = region.icon;
                return (
                  <div key={idx} className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-cyan-400" />
                      <div>
                        <h4 className="font-medium text-white">{region.name}</h4>
                        <p className="text-nomad-slate text-xs">{region.nameEn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-nomad-slate mb-2">
                      <Thermometer className="h-4 w-4" />
                      <span>{region.tempRange}</span>
                      <span className="text-nomad-slate ml-1">({region.tempRangeEn})</span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{region.description}</p>
                    <p className="text-xs text-nomad-slate mb-3">{region.descriptionEn}</p>
                    <ul className="space-y-1 text-sm text-foreground">
                      {region.tips.map((tip, tIdx) => (
                        <li key={tIdx}>
                          <span className="text-nomad-green">- </span>{tip.tr}
                          <span className="block text-nomad-slate text-xs ml-4">({tip.en})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 4: Summer Cooling */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('cooling')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Sun className="h-6 w-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Yazın Serinletme</h2>
                <p className="text-nomad-slate text-sm">Summer Cooling</p>
              </div>
            </div>
            {expanded.cooling ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.cooling && (
            <div className="px-5 pb-5 space-y-4">
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Doğal Havalandırma / Natural Ventilation
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Sabah ve akşam erken saatlerde pencereleri aç (05:00-08:00, 20:00-23:00)</li>
                  <li>- Gündüz güneş alan pencereleri kapat (perde veya panjur)</li>
                  <li>- Çapraz havalandırma: pencerelerin iki yanını aç (rüzgar akımı)</li>
                  <li>- Open windows in early morning and evening (05:00-08:00, 20:00-23:00)</li>
                  <li>- Close sun-facing windows during day (curtains or shutters)</li>
                  <li>- Cross ventilation: open windows on both sides (airflow)</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Buharlaşma ile Serinletme / Evaporative Cooling
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Islak bez yöntemi: Kapı/pencereye ıslatılmış bez as</li>
                  <li>- Zemin ıslatma: Zemini su ile ıslat (buharlaşma ile soğutur)</li>
                  <li>- Kişisel: Bilek ve enseyi ıslak bez ile serinlet</li>
                  <li>- Wet cloth method: Hang wet cloth on door/window</li>
                  <li>- Floor wetting: Wet the floor with water (cools by evaporation)</li>
                  <li>- Personal: Cool wrists and neck with wet cloth</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Gölge Yönetimi / Shade Management
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Dış mekanlarda gölge alanlar oluştur (tente, örtü)</li>
                  <li>- Pencerelere alüminyum folyo yapıştır (güneş ışığını yansıtır)</li>
                  <li>- Ağaç yaprakları doğal gölge sağlar (mümkünse)</li>
                  <li>- Create shaded areas outdoors (awning, cover)</li>
                  <li>- Apply aluminum foil to windows (reflects sunlight)</li>
                  <li>- Tree leaves provide natural shade (if possible)</li>
                </ul>
              </div>
              <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-red-300 font-medium text-sm">
                      Sıcak Çarpması Belirtileri / Heat Stroke Symptoms
                    </h4>
                    <ul className="text-red-400 text-xs mt-2 space-y-1">
                      <li>- Yüksek vücut sıcaklığı (40°C+) / High body temperature</li>
                      <li>- Kuru, kızarık deri / Dry, flushed skin</li>
                      <li>- Hızlı ve güçlü nabız / Rapid, strong pulse</li>
                      <li>- Baş dönmesi, bulantı / Dizziness, nausea</li>
                      <li>- Bilinç karışıklığı / Confusion</li>
                    </ul>
                    <p className="text-red-300 text-sm font-medium mt-2">
                      İlk yardım: Gölgeye al, su ver, vücudu ıslak bez ile soğut, 112&apos;yi ara.
                    </p>
                    <p className="text-red-400 text-xs">
                      First aid: Move to shade, give water, cool body with wet cloth, call 112.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
