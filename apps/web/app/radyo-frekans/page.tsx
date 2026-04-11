'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface ProvinceFreq {
  city: string;
  cityEn: string;
  trtFM: string;
  trtRadyo1: string;
}

const PROVINCE_FREQS: ProvinceFreq[] = [
  { city: 'Istanbul', cityEn: 'Istanbul', trtFM: '95.2 MHz', trtRadyo1: '95.6 MHz' },
  { city: 'Ankara', cityEn: 'Ankara', trtFM: '97.4 MHz', trtRadyo1: '98.3 MHz' },
  { city: 'Izmir', cityEn: 'Izmir', trtFM: '93.4 MHz', trtRadyo1: '96.4 MHz' },
  { city: 'Antalya', cityEn: 'Antalya', trtFM: '96.0 MHz', trtRadyo1: '97.2 MHz' },
  { city: 'Bursa', cityEn: 'Bursa', trtFM: '96.8 MHz', trtRadyo1: '97.8 MHz' },
  { city: 'Adana', cityEn: 'Adana', trtFM: '99.6 MHz', trtRadyo1: '100.5 MHz' },
  { city: 'Konya', cityEn: 'Konya', trtFM: '93.8 MHz', trtRadyo1: '95.4 MHz' },
  { city: 'Gaziantep', cityEn: 'Gaziantep', trtFM: '96.4 MHz', trtRadyo1: '97.6 MHz' },
];

const AMATEUR_RADIO_INFO = {
  band2m: '145.000 - 145.800 MHz',
  callingFreq: '145.500 MHz FM Simplex',
  emergencyFreq: '145.500 MHz',
  repeaterInput: '145.000 - 145.500 MHz (input)',
  repeaterOutput: '145.600 - 145.800 MHz (output)',
  license: 'Telsiz Operatorluk Belgesi (TOB) gerekli',
  licenseEn: 'Radio Operator Certificate (TOB) required',
};

const AFAD_INFO = {
  announcementProtocol: [
    'Afet aninda TRT FM uzerinden AFAD duyurulari yapilir',
    'Duzenli saatlerde bilgi guncellemesi (genellikle her 2 saatte)',
    'Toplanma alanlari, yardim dagitimi, guvenlik bilgileri',
    'Tahliye duyurulari ve guzergah bilgileri',
  ],
  announcementProtocolEn: [
    'AFAD announcements broadcast on TRT FM during disasters',
    'Regular hourly updates (usually every 2 hours)',
    'Gathering areas, aid distribution, safety information',
    'Evacuation announcements and route information',
  ],
};

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

  const printPage = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-nomad-bg p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-nomad-green mb-1">
              Radyo Frekans Rehberi
            </h1>
            <p className="text-nomad-slate text-sm">
              Radio Frequency Reference -- Turkey (Offline Access)
            </p>
          </div>
          <button onClick={printPage} className="btn-secondary flex items-center gap-2 no-print">
            <Printer className="h-4 w-4" />
            Yazdir / Print
          </button>
        </header>

        <div className="mb-6 bg-nomad-surface rounded-xl border border-nomad-border p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-nomad-green mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground text-sm">
                Internet kesildiginde radyo en guvenilir bilgi kaynagidir. Tum frekanslar cevrimdisi
                erisim icin bu sayfada saklanir.
              </p>
              <p className="text-nomad-slate text-xs mt-1">
                When internet is down, radio is the most reliable information source. All frequencies
                are stored on this page for offline access.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: AFAD Emergency Broadcast */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('afad')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Radio className="h-6 w-6 text-red-400" />
              <div>
                <h2 className="text-xl font-bold text-white">AFAD Acil Durum Yayini</h2>
                <p className="text-nomad-slate text-sm">AFAD Emergency Broadcast</p>
              </div>
            </div>
            {expanded.afad ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.afad && (
            <div className="px-5 pb-5">
              <div className="bg-red-950/30 border border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-red-300 font-medium text-sm">
                      Afet durumunda TRT FM dinle -- resmi duyurular bu kanaldan yapilir.
                    </p>
                    <p className="text-red-400 text-xs mt-1">
                      During disaster, listen to TRT FM -- official announcements are made on this channel.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-white mb-3">
                AFAD Duyuru Protokolu / Announcement Protocol
              </h3>
              <ul className="space-y-2">
                {AFAD_INFO.announcementProtocol.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nomad-green/20 text-nomad-green text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm text-foreground">{item}</p>
                      <p className="text-xs text-nomad-slate">{AFAD_INFO.announcementProtocolEn[idx]}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 bg-nomad-bg rounded-lg p-3 border border-nomad-border">
                <p className="text-sm text-nomad-slate">
                  <strong className="text-foreground">Ne dinlemeli / What to listen for:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  <li>- Toplanma alani duyurulari / Gathering area announcements</li>
                  <li>- Yardim dagitim noktalar / Aid distribution points</li>
                  <li>- Guvenlik uyarilari / Safety warnings</li>
                  <li>- Hava durumu ve artci sarsinti bilgileri / Weather and aftershock info</li>
                  <li>- Tahliye emirleri / Evacuation orders</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: TRT Radio Frequencies */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('trt')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Signal className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">TRT Radyo Frekanslari</h2>
                <p className="text-nomad-slate text-sm">TRT Radio Frequencies</p>
              </div>
            </div>
            {expanded.trt ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.trt && (
            <div className="px-5 pb-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-nomad-border">
                      <th className="text-left py-2 px-3 text-nomad-slate font-medium">Sehir / City</th>
                      <th className="text-left py-2 px-3 text-nomad-green font-medium">TRT FM</th>
                      <th className="text-left py-2 px-3 text-nomad-green font-medium">TRT Radyo 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROVINCE_FREQS.map((prov, idx) => (
                      <tr key={idx} className="border-b border-nomad-border/50">
                        <td className="py-2 px-3 text-foreground">
                          {prov.city}
                          <span className="block text-nomad-slate text-xs">{prov.cityEn}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-mono text-nomad-green">{prov.trtFM}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-mono text-nomad-green">{prov.trtRadyo1}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-nomad-bg rounded-lg p-3 border border-nomad-border">
                <p className="text-sm text-nomad-slate flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <strong className="text-foreground">Frekans Araliklari / Frequency Ranges:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  <li>- TRT FM: 93.4 - 104.4 MHz (bolgeye gore degisir / varies by region)</li>
                  <li>- TRT Radyo 1: 95.6 - 103.5 MHz (bolgeye gore degisir / varies by region)</li>
                </ul>
                <p className="text-xs text-nomad-slate mt-2">
                  Not: Frekanslar yere gore degisebilir. Radyoyu tarayarak en guclu sinyali bul.
                </p>
                <p className="text-xs text-nomad-slate">
                  Note: Frequencies may vary by location. Scan radio to find strongest signal.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Amateur Radio */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('amateur')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Amator Telsiz (Amateur Radio)</h2>
                <p className="text-nomad-slate text-sm">Amateur Radio Frequencies</p>
              </div>
            </div>
            {expanded.amateur ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.amateur && (
            <div className="px-5 pb-5 space-y-4">
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-3">2m Band Frekanslari / 2m Band Frequencies</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Band Araligi / Band Range</span>
                    <span className="font-mono text-nomad-green">{AMATEUR_RADIO_INFO.band2m}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Cagri Frekansi / Calling Freq</span>
                    <span className="font-mono text-nomad-green font-bold">{AMATEUR_RADIO_INFO.callingFreq}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Acil Durum / Emergency</span>
                    <span className="font-mono text-red-400 font-bold">{AMATEUR_RADIO_INFO.emergencyFreq}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Repeater Input</span>
                    <span className="font-mono text-nomad-green">{AMATEUR_RADIO_INFO.repeaterInput}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Repeater Output</span>
                    <span className="font-mono text-nomad-green">{AMATEUR_RADIO_INFO.repeaterOutput}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-amber-300 text-sm font-medium">
                      Telsiz kullanimi icin {AMATEUR_RADIO_INFO.license}
                    </p>
                    <p className="text-amber-400 text-xs mt-1">
                      {AMATEUR_RADIO_INFO.licenseEn}
                    </p>
                    <p className="text-amber-300 text-sm mt-2">
                      Acil durumlarda lisanssiz telsiz kullanilabilir (PMR446: 446.000-446.100 MHz).
                    </p>
                    <p className="text-amber-400 text-xs">
                      In emergencies, unlicensed radios can be used (PMR446: 446.000-446.100 MHz).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-2">
                  Telsiz Iletisim Kurallari / Radio Communication Rules
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- Kisaca konus, gereksiz yayin yapma / Speak briefly, no unnecessary broadcasts</li>
                  <li>- Cagri ismini kullan (varsa) / Use your call sign (if any)</li>
                  <li>- Acil durumda &quot;ACIL DURUM&quot; de, frekansini belirt / In emergency say &quot;EMERGENCY&quot;, state frequency</li>
                  <li>- Dinlemeden transmit etme / Listen before transmitting</li>
                  <li>- Pil tasarrufu icin planli transmit et / Transmit on schedule to conserve battery</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Simple Antenna Guide */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('antenna')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Antenna className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Basit Anten Yapimi</h2>
                <p className="text-nomad-slate text-sm">Simple Antenna Guide</p>
              </div>
            </div>
            {expanded.antenna ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.antenna && (
            <div className="px-5 pb-5 space-y-4">
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-3">Dipol Anten Yapimi / Dipole Antenna Build</h3>
                <p className="text-sm text-foreground mb-3">
                  Ev esyalariyla basit bir dipol anten yapabilirsin. Iki esit uzunlukta tel, ortadan bagla.
                </p>
                <p className="text-xs text-nomad-slate mb-3">
                  You can build a simple dipole antenna with household items. Two equal length wires, connected in the middle.
                </p>

                <div className="bg-nomad-surface rounded-lg p-3 border border-nomad-border mb-3">
                  <h4 className="font-medium text-nomad-green text-sm mb-2">
                    Tel Uzunlugu Hesabi / Wire Length Calculation
                  </h4>
                  <div className="bg-nomad-bg rounded p-2 font-mono text-sm text-center">
                    Uzunluk (metre) = 143 / Frekans (MHz)
                  </div>
                  <p className="text-xs text-nomad-slate text-center mt-1">
                    Length (meters) = 143 / Frequency (MHz)
                  </p>
                </div>

                <h4 className="font-medium text-white mb-2">Ornek: FM Anten (95 MHz icin)</h4>
                <p className="text-xs text-nomad-slate mb-2">Example: FM Antenna (for 95 MHz)</p>
                <div className="bg-nomad-bg rounded-lg p-3 border border-nomad-border">
                  <ul className="space-y-2 text-sm text-foreground">
                    <li>- <strong>Toplam uzunluk:</strong> 143 / 95 = 1.5 metre</li>
                    <li>- <strong>Her kol:</strong> 1.5 / 2 = 75 cm (2 x 75cm tel)</li>
                    <li>- <strong>Malzeme:</strong> Bakir tel, alumin folyo, veya uydu kablosu</li>
                    <li>- <strong>Connection:</strong> Iki teli ortadan bagla, radyo antenine temas ettir</li>
                  </ul>
                  <ul className="space-y-1 text-xs text-nomad-slate mt-2">
                    <li>- <strong>Total length:</strong> 143 / 95 = 1.5 meters</li>
                    <li>- <strong>Each arm:</strong> 1.5 / 2 = 75 cm (2 x 75cm wire)</li>
                    <li>- <strong>Material:</strong> Copper wire, aluminum foil, or satellite cable</li>
                    <li>- <strong>Connection:</strong> Connect two wires in center, touch to radio antenna</li>
                  </ul>
                </div>
              </div>

              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-3">
                  Anten Yerlesimi / Antenna Positioning
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- <strong>Pencere yani:</strong> En iyi sinyal icin pencere yakinina yerlestir</li>
                  <li>- <strong>Yukarida:</strong> Ne kadar yukarida, o kadar iyi sinyal</li>
                  <li>- <strong>Acik alan:</strong> Metal esyalardan uzak tut</li>
                  <li>- <strong>Dikey/Dikey:</strong> FM icin dikey (V) polarizasyon kullan</li>
                </ul>
                <ul className="space-y-1 text-xs text-nomad-slate mt-2">
                  <li>- <strong>Near window:</strong> Place near window for best signal</li>
                  <li>- <strong>Higher up:</strong> The higher, the better signal</li>
                  <li>- <strong>Open area:</strong> Keep away from metal objects</li>
                  <li>- <strong>Vertical:</strong> Use vertical (V) polarization for FM</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Emergency Signal Protocol */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
          <button
            onClick={() => toggle('signal')}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <Flashlight className="h-6 w-6 text-orange-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Acil Durum Sinyal Protokolu</h2>
                <p className="text-nomad-slate text-sm">Emergency Signal Protocol</p>
              </div>
            </div>
            {expanded.signal ? (
              <ChevronDown className="h-5 w-5 text-nomad-green" />
            ) : (
              <ChevronRight className="h-5 w-5 text-nomad-slate" />
            )}
          </button>

          {expanded.signal && (
            <div className="px-5 pb-5 space-y-4">
              {/* SOS Morse */}
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-3">
                  SOS Morse Kodu / SOS Morse Code
                </h3>
                <div className="text-center py-4 bg-nomad-surface rounded-lg border border-nomad-border">
                  <p className="text-3xl font-mono text-nomad-green tracking-widest">
                    ... --- ...
                  </p>
                  <p className="text-sm text-nomad-slate mt-2">
                    3 kisa, 3 uzun, 3 kisa / 3 short, 3 long, 3 short
                  </p>
                </div>
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  <p><strong>Kisa (.):</strong> 1 birim sure (yaklasik 0.1 saniye)</p>
                  <p><strong>Uzun (-):</strong> 3 birim sure (yaklasik 0.3 saniye)</p>
                  <p><strong>Aralar:</strong> Harf arasi 3 birim, kelime arasi 7 birim</p>
                </div>
                <div className="mt-2 space-y-1 text-xs text-nomad-slate">
                  <p><strong>Short (.):</strong> 1 unit (~0.1 second)</p>
                  <p><strong>Long (-):</strong> 3 units (~0.3 second)</p>
                  <p><strong>Gaps:</strong> 3 units between letters, 7 units between words</p>
                </div>
              </div>

              {/* Flashlight Signaling */}
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-3">
                  El Feneri ile Sinyal / Flashlight Signaling
                </h3>
                <ol className="space-y-2 text-sm text-foreground">
                  <li>1. El fenerini ac/kapat ile Morse SOS yap</li>
                  <li>2. Gece 1-3 km mesafeden gorulebilir</li>
                  <li>3. Gunduz ayna veya parlak yuzey kullan</li>
                  <li>4. Duzenli araliklarla tekrarla (her 5 dakikada)</li>
                </ol>
                <ol className="space-y-1 text-xs text-nomad-slate mt-2">
                  <li>1. Flash on/off for Morse SOS</li>
                  <li>2. Visible from 1-3 km at night</li>
                  <li>3. Use mirror or reflective surface during day</li>
                  <li>4. Repeat at regular intervals (every 5 minutes)</li>
                </ol>
              </div>

              {/* International Distress Signals */}
              <div className="bg-nomad-bg rounded-lg p-4 border border-nomad-border">
                <h3 className="font-medium text-white mb-3">
                  Uluslararasi Distres Sinyalleri / International Distress Signals
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>- <strong>3 kez tekrar:</strong> 3 ates, 3 islare, 3 ses (evrensel yardim cagrisi)</li>
                  <li>- <strong>SOS:</strong> Herhangi bir ortamda (... --- ...)</li>
                  <li>- <strong>Mayday:</strong> Telsiz uzerinde sozlu acil durum cagrisi</li>
                  <li>- <strong>Portakal rengi duman:</strong> Gunduz sinyal isareti</li>
                  <li>- <strong>Kare icinde daire:</strong> Havada gorulebilir isaret (yardim lazim)</li>
                </ul>
                <ul className="space-y-1 text-xs text-nomad-slate mt-2">
                  <li>- <strong>3 repetitions:</strong> 3 fires, 3 whistles, 3 sounds (universal distress)</li>
                  <li>- <strong>SOS:</strong> In any medium (... --- ...)</li>
                  <li>- <strong>Mayday:</strong> Voice emergency call on radio</li>
                  <li>- <strong>Orange smoke:</strong> Daytime signal marker</li>
                  <li>- <strong>Circle in square:</strong> Visible from air (need help)</li>
                </ul>
              </div>

              {/* Battery Conservation */}
              <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-amber-300 font-medium text-sm">
                      Pil Tasarrufu / Battery Conservation
                    </h4>
                    <ul className="text-amber-400 text-xs mt-2 space-y-1">
                      <li>- Telsiz/radyo pilini korumak icin planli dinle</li>
                      <li>- Her saat basi 5 dakika dinle, sonra kapat</li>
                      <li>- Transmit kisalt, gereksiz konusma yapma</li>
                      <li>- Listen on schedule to conserve radio/battery</li>
                      <li>- Listen 5 minutes every hour, then turn off</li>
                      <li>- Keep transmissions short, no unnecessary talk</li>
                    </ul>
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
