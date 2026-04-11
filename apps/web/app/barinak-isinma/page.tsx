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
    name: 'Istanbul / Marmara',
    nameEn: 'Istanbul / Marmara',
    tempRange: '0°C ila 10°C',
    tempRangeEn: '0°C to 10°C',
    description: 'Nemli soguk, ruzgar hissi artirir. Yagmur ve kar arisik.',
    descriptionEn: 'Humid cold, wind chill increases effect. Mixed rain and snow.',
    tips: [
      { tr: 'Ruzgar gecirmez katman giy', en: 'Wear windproof layers' },
      { tr: 'Nem yalitim azaltir, kuru tut', en: 'Humidity reduces insulation, keep dry' },
      { tr: 'Pencerelere plastik film yapistir', en: 'Apply plastic film to windows' },
    ],
    icon: Wind,
  },
  {
    name: 'Ege',
    nameEn: 'Aegean',
    tempRange: '5°C ila 15°C',
    tempRangeEn: '5°C to 15°C',
    description: 'Iliman, daha az sert. gece donlari olabilir.',
    descriptionEn: 'Milder, less severe. Night frosts possible.',
    tips: [
      { tr: 'Gece sicaklik dususu icin hazirlikli ol', en: 'Be prepared for night temperature drops' },
      { tr: 'Katli giyinme yeterli olabilir', en: 'Layered clothing may be sufficient' },
    ],
    icon: Wind,
  },
  {
    name: 'Akdeniz',
    nameEn: 'Mediterranean',
    tempRange: '5°C ila 15°C',
    tempRangeEn: '5°C to 15°C',
    description: 'En iliman bolge. Nadiren don.',
    descriptionEn: 'Mildest region. Rarely freezing.',
    tips: [
      { tr: 'Hafif isinma yeterli', en: 'Light heating is sufficient' },
      { tr: 'Yagisli gunler icin hazirlikli ol', en: 'Be prepared for rainy days' },
    ],
    icon: Sun,
  },
  {
    name: 'Iceri Anadolu (Ankara)',
    nameEn: 'Central Anatolia (Ankara)',
    tempRange: '-15°C ila 5°C',
    tempRangeEn: '-15°C to 5°C',
    description: 'Sert ve kuru soguk. Buyuk sicaklik farklari.',
    descriptionEn: 'Harsh, dry cold. Large temperature differences.',
    tips: [
      { tr: 'Agir isinma sart, birden fazla yontem kullan', en: 'Heavy heating essential, use multiple methods' },
      { tr: 'Su borularini donmaya karsi yalit', en: 'Insulate water pipes against freezing' },
      { tr: 'Kapi ve pencereleri cift katman yalit', en: 'Double-layer insulate doors and windows' },
    ],
    icon: Snowflake,
  },
  {
    name: 'Dogu Anadolu (Erzurum, Van)',
    nameEn: 'Eastern Anatolia (Erzurum, Van)',
    tempRange: '-30°C ila -5°C',
    tempRangeEn: '-30°C to -5°C',
    description: 'Asiri soguk. Hayati tehlike. Hazirlik sart.',
    descriptionEn: 'Extreme cold. Life-threatening. Preparation essential.',
    tips: [
      { tr: 'Mumkunse tek bir odada toplan, isit', en: 'If possible, gather in one room, heat it' },
      { tr: 'Katli battaniye, uyku tulumu kullan', en: 'Use layered blankets, sleeping bags' },
      { tr: 'Sicak icecekler icin su hazirla', en: 'Prepare water for hot drinks' },
      { tr: 'Hipotermi belirtilerini tanimayi ogren', en: 'Learn to recognize hypothermia symptoms' },
    ],
    icon: Snowflake,
  },
  {
    name: 'Karadeniz',
    nameEn: 'Black Sea',
    tempRange: '0°C ila 10°C',
    tempRangeEn: '0°C to 10°C',
    description: 'Cok nemli, hissedilen sicaklik daha dusuk.',
    descriptionEn: 'Very humid, feels colder than actual temperature.',
    tips: [
      { tr: 'Nem yalitim azaltir, ekstra katman kullan', en: 'Humidity reduces insulation, use extra layers' },
      { tr: 'Kuf onleyici havalandirma yap', en: 'Ventilate to prevent mold' },
      { tr: 'Nem alici kullan (tuz, kirec)', en: 'Use dehumidifiers (salt, lime)' },
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
              Barinak ve Isinma Rehberi
            </h1>
            <p className="text-nomad-slate text-sm">
              Shelter & Warmth Guide -- Turkey Climate Zones
            </p>
          </div>
          <button onClick={printPage} className="btn-secondary flex items-center gap-2 no-print">
            <Printer className="h-4 w-4" />
            Yazdir / Print
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
                <h2 className="text-xl font-bold text-white">Dogaçlama Isinma</h2>
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
                  Guvenli Yontemler / Safe Methods
                </h3>
                <div className="space-y-4">
                  <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <h4 className="font-medium text-white mb-2">Mum ve Tencere Yontemi / Candle Heater</h4>
                    <p className="text-sm text-foreground mb-2">
                      Tercova cicek cogu icine ters cevrilmis, mum ustune yerlestirilir.
                      Teracotta isiyi emer ve yayar. Kucuk alanda 1-2°C art saglar.
                    </p>
                    <p className="text-xs text-nomad-slate">
                      Terracotta pot inverted over candle. Terracotta absorbs and radiates heat.
                      Provides 1-2°C increase in small area.
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-foreground">
                      <li>1. Buyuk mum (7-10 saatlik) yak</li>
                      <li>2. Uzerine kucuk teracotta cogu yerlestir (delik acik)</li>
                      <li>3. Uzerine buyuk teracotta cogu ters cevir</li>
                      <li>4. Metal civata ile ust uste tut</li>
                    </ol>
                    <div className="mt-3 bg-red-950/50 border border-red-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-red-300 text-sm font-medium">
                            CO UYARISI: Kapali alanda mum yakmak karbonmonoks uretir.
                          </p>
                          <p className="text-red-400 text-xs">
                            CO WARNING: Burning candles in enclosed space produces carbon monoxide.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <h4 className="font-medium text-white mb-2">Sicak Su Torbasi / Hot Water Bottle</h4>
                    <p className="text-sm text-foreground mb-2">
                      Sicak su ile doldurulan sise veya torba, yatak/icinde isinma icin kullanilir.
                      4-6 saat sicaklik verir.
                    </p>
                    <p className="text-xs text-nomad-slate">
                      Bottle or bag filled with hot water, used for bed/person heating.
                      Provides 4-6 hours of warmth.
                    </p>
                    <ol className="mt-2 space-y-1 text-sm text-foreground">
                      <li>1. Cam siseyi sicak (kaynar degil) su ile doldur</li>
                      <li>2. Bez veya havluya sar (yanik onlemek icin)</li>
                      <li>3. Yatak ayak ucuna veya karina yerlestir</li>
                    </ol>
                  </div>

                  <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                    <h4 className="font-medium text-white mb-2">Katli Battaniye / Layered Blankets</h4>
                    <p className="text-sm text-foreground mb-2">
                      Vucut isisini haps icin kat kat battaniye kullan.
                      Alti katman: battaniye, yorgan, elbise, vs.
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
                  TEHLIKELI Yontemler -- ASLA YAPMA / DANGEROUS -- DO NOT USE
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-red-300 font-medium">Firinda isinma / Using oven for heating</p>
                        <p className="text-red-400 text-xs mt-1">
                          Gaz firinlari CO uretir, yangin riski vardir. ASLA kullanma.
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
                        <p className="text-red-300 font-medium">Icerde komur yakma / Burning charcoal indoors</p>
                        <p className="text-red-400 text-xs mt-1">
                          Komur kapali alanda olumcul CO uretir. Her yil olumler oluyor.
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
                        <p className="text-red-300 font-medium">Havasiz dogalgaz sobasi / Unvented gas heater</p>
                        <p className="text-red-400 text-xs mt-1">
                          Havalandirma olmadan dogalgaz sobalari CO zehirlenmesine yol acar.
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
                      KARBONMONOKS UYARISI
                    </h4>
                    <h5 className="text-sm font-medium text-red-400 mb-3">
                      CARBON MONOXIDE WARNING
                    </h5>
                    <p className="text-red-300 text-sm mb-2">
                      Karbonmonoks kokusuzdur, renksizdir. Zehirlenme belirtileri:
                    </p>
                    <p className="text-red-400 text-xs mb-3">
                      Carbon monoxide is odorless, colorless. Poisoning symptoms:
                    </p>
                    <ul className="space-y-1 text-red-300 text-sm">
                      <li>- Bas agrisi / Headache</li>
                      <li>- Bulanti / Nausea</li>
                      <li>- Bas donmesi / Dizziness</li>
                      <li>- Halsizlik / Weakness</li>
                      <li>- Bilinc kaybi / Loss of consciousness</li>
                    </ul>
                    <p className="text-red-300 text-sm font-medium mt-3">
                      Suphelenirsen: HEMEN disari cik, 112&apos;yi ara.
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
                <h2 className="text-xl font-bold text-white">Yalitma Teknikleri</h2>
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
                  Pencere Yalitim / Window Insulation
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Plastik film: Pencere cercevesine bantla yapistir (cift cam etkisi)</li>
                  <li>- Gazete: Camlara gazete yapistir (ucuz, etkili)</li>
                  <li>- Battaniye: Kalin battaniyeni pencereye as</li>
                  <li>- Plastic film: Tape to window frame (double-pane effect)</li>
                  <li>- Newspaper: Apply newspaper to glass (cheap, effective)</li>
                  <li>- Blanket: Hang thick blanket over window</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Kapi Yalitim / Door Draft Stopping
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Havlu rulo: Kapi altina havlu rulo yerlestir</li>
                  <li>- Fitil kaplama: Kapi cevre fitil kaplama</li>
                  <li>- Battaniye: Kapi arkasina battaniye as</li>
                  <li>- Towel roll: Place rolled towel under door</li>
                  <li>- Weather stripping: Apply weather stripping around door</li>
                  <li>- Blanket: Hang blanket behind door</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Zemin Yalitim / Floor Insulation
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Karton: Zemin karton kapla (yukari isi kaybi azalir)</li>
                  <li>- Hali: Ekstra hali veya kilim kullan</li>
                  <li>- Gazete: Kat kat gazete ser (gecici yontem)</li>
                  <li>- Cardboard: Cover floor with cardboard (reduces upward heat loss)</li>
                  <li>- Rug: Use extra rugs or carpets</li>
                  <li>- Newspaper: Lay layered newspaper (temporary method)</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Tavan Isi Tutma / Ceiling Heat Retention
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Battaniye: Tavaya battaniye as (isi yukari kacmaz)</li>
                  <li>- Alumin folyo: Tavana alumin folyo yapistir (isi yansitir)</li>
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
                <h2 className="text-xl font-bold text-white">Bolgesel Kis Hayatta Kalma</h2>
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
                <h2 className="text-xl font-bold text-white">Yazin Serinletme</h2>
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
                  Dogal Havalandirma / Natural Ventilation
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Sabah ve aksam erken saatlerde pencereleri ac (05:00-08:00, 20:00-23:00)</li>
                  <li>- Gunduz gunes alan pencereleri kapat (perde veya panjur)</li>
                  <li>- Capraz havalandirma: pencerelerin iki yanini ac (ruzgar akimi)</li>
                  <li>- Open windows in early morning and evening (05:00-08:00, 20:00-23:00)</li>
                  <li>- Close sun-facing windows during day (curtains or shutters)</li>
                  <li>- Cross ventilation: open windows on both sides (airflow)</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Buharlasma ile Serinletme / Evaporative Cooling
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Islak bez yontemi: Kapi/pencereye islatilmis bez as</li>
                  <li>- Zemin islatma: Zemin su ile islat (buharlasma ile sogutur)</li>
                  <li>- Kisisel: Bilek ve ense islak bez ile serinlet</li>
                  <li>- Wet cloth method: Hang wet cloth on door/window</li>
                  <li>- Floor wetting: Wet the floor with water (cools by evaporation)</li>
                  <li>- Personal: Cool wrists and neck with wet cloth</li>
                </ul>
              </div>
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Golge Yonetimi / Shade Management
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Dis mekanlarda golge alanlar olustur (brand, ortu)</li>
                  <li>- Pencerelere alumin folyo yapistir (gunes isigini yansitir)</li>
                  <li>- Agac yapraklari dogal golge saglar (mumkunse)</li>
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
                      Sicak Carpmasi Belirtileri / Heat Stroke Symptoms
                    </h4>
                    <ul className="text-red-400 text-xs mt-2 space-y-1">
                      <li>- Yuksek vucut sicakligi (40°C+) / High body temperature</li>
                      <li>- Kuru, kizari deri / Dry, flushed skin</li>
                      <li>- Hizli ve guclu nabiz / Rapid, strong pulse</li>
                      <li>- Bas donmesi, bulanti / Dizziness, nausea</li>
                      <li>- Bilinc karisikligi / Confusion</li>
                    </ul>
                    <p className="text-red-300 text-sm font-medium mt-2">
                      Ilk yardim: Golgeye al, susu ver, vucudu islak bez ile sogut, 112&apos;yi ara.
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
