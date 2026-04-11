'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Building2, Trees, AlertTriangle, Info, Droplets, Home, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  urban: string[];
  rural: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: 'water', title: 'Su / Water', titleEn: 'Water',
    icon: Droplets,
    urban: [
      'Musluk suyu: Sehir sebekesi genellikle guvenlidir ancak krizde kontamine olabilir',
      'Su isitici tanki: 50-150L su icerir -- drenaj valfinden bosaltin',
      'Klozet tanki (sifon degil): Temiz su icerir (icme suyu degil, yikama icin)',
      'Su borulari: Ana vanayi kapatin, borularda kalan suyu musluklardan alin',
      'Yagmur suyu: Balkon ve cataktan toplama sistemi kurun',
      'Havuz/sus havuzu: Son care icme suyu olarak (mutlaka aritilmali)',
      'Kentsel avantaj: Daha fazla cesme, daha fazla su kaynagi',
      'Kentsel dezavantaj: Daha fazla kisi = daha fazla rekabet',
    ],
    rural: [
      'Kuyu suyu: Elektrik kesilirse manuel pompa veya kova sistemi kullanin',
      'Kuyu testi: Kriz oncesi su kalitesini test ettirin (bakteri, nitrat, agri metal)',
      'Yagmur suyu toplama: Cataktan varile toplama -- en temiz dogal kaynak',
      'Akarsu/nehir: Yakinda olabilir ama MUTLAKA aritilmali',
      'Dogal kaynaklar: Dag kaynaklari genellikle temizdir ama kontrol sart',
      'Kirsal avantaj: Daha az kisi = daha az rekabet, daha fazla dogal kaynak',
      'Kirsal dezavantaj: Yardima ulasmak daha uzun surer',
      'Alternatif: El pompasi (maliyeti dusuk, montaji kolay)',
    ],
  },
  {
    id: 'food', title: 'Gida / Food', titleEn: 'Food',
    icon: Home,
    urban: [
      'Balkon bahceciligi: Domates, biber, feslegen yetistirilebilir',
      'Cat bahcesi: Buyuk binalarda catida sera kurulabilir',
      'Topluluk bahceleri: Mahalle bahcesi organizasyonu',
      'Avantaj: Daha fazla market -- kriz oncesi stok yapma sansi',
      'Dezavantaj: Kriz sonrasinda stoklar hizla tukenir',
      'Mantar yetistirme: Karanlik, nemli ortamlarda kolay (bodrum, dolap alti)',
      'Filiz yetistirme: 3-5 gunde hasat -- en hizli gida uretimi',
      'Dikey bahcecilik: Duvarlarda asagiya sarkan sistemler',
    ],
    rural: [
      'Bahce uretimi: Genis alan -- meyve, sebze, baklagil',
      'Kucukbas hayvan: Tavuk, keci -- sut ve yumurta uretimi',
      'Yabani ot toplama: Isirgan, semizotruk, hindiba (dogru tanima sart!)',
      'UYARI: Zehirli bitki riski -- bilmediginiz bitkiyi YEMEYIN',
      'Avantaj: Genis tarim alani, dogal kaynaklar',
      'Koruma: Mahsulunuzu hayvanlardan ve hirsizlardan koruyun',
      'Konserve: Meyve/sebze konserveleme (kavanozla saklama)',
      'Kuruma: Gunesle kurutma (domates, biber, erik, incir)',
    ],
  },
  {
    id: 'shelter', title: 'Barinak / Shelter', titleEn: 'Shelter',
    icon: Shield,
    urban: [
      'Yuksek kat tahliyesi: SADECE merdiven kullanin, asansor CALISMAZ',
      'Ne zaman kal/ne zaman git: Bina hasarliysa DERHAL cik',
      'Guvenli kat: Orta katlar (yangin ve sel riski daha dusuk)',
      'Apartman tehlikeleri: Dogal gaz hatlari, yangin yayilmasi, yapisal cokme',
      'Yangin merdiveni: Onceden kontrol edin, engel olup olmadigina bakin',
      'Ne zaman kal: Binaniz guvenliyse, disarida barinak yoksa',
      'Ne zaman git: Bina hasarliysa, yangin riski varsa',
      'Alternatif: Garaj, depo, bodrum gecici barinak icin',
    ],
    rural: [
      'Mevcut yapilar: Ev, ahir, samanlik barinak icin kullanilabilir',
      'Cadir: Acik havada en yaygin gecici barinak',
      'Dogal barinak: Magara, agir kayalik altlari (cokme riski kontrol!)',
      'Yalitim: Kirsalda gece sicaklik dususu sehrden fazla olabilir',
      'Avantaj: Daha fazla alan, daha az kisi = daha fazla gizlenme',
      'Isinma: Odun sobasi en yaygin kirsal isinma yontemi',
      'Havalandirma: Kapali alanlarda karbonmonoksit riski!',
      'Guvenlik: Hayvanlardan korunma (yilan, bocek, yirtici)',
    ],
  },
  {
    id: 'dangers', title: 'Tehlikeler / Dangers', titleEn: 'Dangers',
    icon: AlertTriangle,
    urban: [
      'Yapisal cokme: Deprem, patlama sonucu bina cokmesi',
      'Dogal gaz patlamasi: Gaz kacagi -- kibrit CEKMEYIN, havalandirin',
      'Yangin yayilmasi: Sehrilerde yangin hizla yayilir (binalar yakin)',
      'Yagmacilik: Kalabalik alanlarda guvenlik riski artar',
      'Tikanik yollar: Tahliye zorlasir, ambulans ulasamaz',
      'Kimyasal risk: Fabrikalar, benzin istasyonlari tehlike kaynagi',
      'Elektrik carpmasi: Dusen elektrik hatlari -- YAKLASMAYIN',
      'Su baskini: Sehrilerde drenaj sistemi calismayabilir',
    ],
    rural: [
      'Tarimsal kimyasal: Pestisit, gubre -- su kaynaklarini kirletebilir',
      'Hayvan tehlikeleri: Yirticilar, yilanlar, bocekler',
      'Yangin: Orman yanginlari kirsalda buyuk risk',
      'Izolasyon: Yardima ulasmak saatler/gunler alabilir',
      'Hava kosullari: Sehrilerden daha sert (ruzgar, dolu, kar)',
      'Zemin: Cukur, dere, eskin arazi dusme/yaralanma riski',
      'Su kaynaklari: Tarim ilaclari ile kirlenmis olabilir',
      'Erisme: Uzak bolumlere ulasmak zor olabilir',
    ],
  },
  {
    id: 'resources', title: 'Kaynaklar / Resources', titleEn: 'Resources',
    icon: Zap,
    urban: [
      'Avantaj: Daha fazla hastane ve saglik merkezi',
      'Avantaj: Daha fazla hukumet yardimi',
      'Avantaj: Daha fazla topluluk kaynagi',
      'Avantaj: Daha fazla egitim kurumu',
      'Avantaj: Daha fazla market ve depo',
      'Dezavantaj: Daha fazla insan = daha fazla rekabet',
      'Dezavantaj: Daha az yerel gida uretimi',
      'Dezavantaj: Altyapi bagimliligi yuksek (elektrik, su, gaz)',
    ],
    rural: [
      'Avantaj: Daha fazla alan ve mesafe',
      'Avantaj: Daha fazla dogal kaynak',
      'Avantaj: Daha az rekabet',
      'Avantaj: Kendi kendine yeterlilik mumkun',
      'Dezavantaj: Daha az saglik kurumu',
      'Dezavantaj: Daha az hukumet yardimi',
      'Dezavantaj: Daha uzun yardim ulasma suresi',
      'Dezavantaj: Ulasim zorluklari',
    ],
  },
];

const TURKEY_URBAN_CENTERS = [
  { name: 'Istanbul', pop: '16M', notes: 'En buyuk sehr -- deprem riski yuksek. 2 kitalar arasi ulasim kritik.' },
  { name: 'Ankara', pop: '5.7M', notes: 'Baskent -- hukumet merkezleri. Altyapi daha guclu.' },
  { name: 'Izmir', pop: '4.4M', notes: 'Ege bolgesi -- deprem bolgesi. Liman sehri.' },
  { name: 'Antalya', pop: '2.6M', notes: 'Turizm bolgesi -- turistik altyapi var. Sicak iklim.' },
  { name: 'Bursa', pop: '3.1M', notes: 'Sanayi sehri -- fabrikalar risk. Uludag su kayanagi.' },
];

const TURKEY_RURAL_REGIONS = [
  { name: 'Karadeniz (kirsal)', notes: 'Yagisli -- tarim bolgesi. Cay, findik, misir. Sel riski.' },
  { name: 'Ic Anadolu (kirsal)', notes: 'Kuru iklim -- tahvil bolgesi. Bugday, arpa. Su kirli olabilir.' },
  { name: 'Dogu Anadolu (kirsal)', notes: 'Sert iklim -- kis zorlu. Hayvancilik onemli. Deprem bolgesi.' },
  { name: 'Ege (kirsal)', notes: 'Verimli toprak -- zeytin, incir, uzum. Deprem riski.' },
  { name: 'Akdeniz (kirsal)', notes: 'Sicak iklim -- narenciye, pamuk. Orman yangini riski.' },
];

export default function SehirKoyPage() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'urban' | 'rural' | 'turkey'>('comparison');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    water: true, food: true, shelter: true, dangers: true, resources: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sehir vs Koy / Urban vs Rural Survival</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Sehir ve kirsal alanlar icin farkli hayatta kalma stratejileri
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'comparison' as const, label: 'Karsilastirma' },
          { id: 'urban' as const, label: 'Sehir (Urban)' },
          { id: 'rural' as const, label: 'Koy (Rural)' },
          { id: 'turkey' as const, label: 'Turkiye Notlari' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-nomad-green text-white'
                : 'bg-nomad-surface border border-nomad-border text-nomad-slate hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      {activeTab === 'comparison' && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle>Yan Yana Karsilastirma / Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id];
              return (
                <div key={section.id} className="mb-6 last:mb-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    <Icon className="h-5 w-5 text-nomad-green" />
                    <h3 className="text-base font-bold">{section.title}</h3>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-950/20 border border-blue-800/30 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Sehir / Urban
                        </h4>
                        <ul className="space-y-2">
                          {section.urban.map((item, i) => (
                            <li key={i} className="text-sm text-blue-300 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">-</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-green-950/20 border border-green-800/30 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                          <Trees className="h-4 w-4" />
                          Koy / Rural
                        </h4>
                        <ul className="space-y-2">
                          {section.rural.map((item, i) => (
                            <li key={i} className="text-sm text-green-300 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">-</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Urban Detail */}
      {activeTab === 'urban' && (
        <div className="space-y-6">
          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Sehir Hayatta Kalma Rehberi / Urban Survival Guide
              </CardTitle>
              <CardDescription>Yuksek yogunluklu alanlar icin stratejiler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {SECTIONS.map(section => {
                const Icon = section.icon;
                return (
                  <div key={section.id}>
                    <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-nomad-green" />
                      {section.title}
                    </h3>
                    <div className="p-4 bg-blue-950/20 border border-blue-800/30 rounded-lg">
                      <ul className="space-y-2">
                        {section.urban.map((item, i) => (
                          <li key={i} className="text-sm text-blue-300 flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">-</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rural Detail */}
      {activeTab === 'rural' && (
        <div className="space-y-6">
          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="h-5 w-5 text-green-400" />
                Kirsal Hayatta Kalma Rehberi / Rural Survival Guide
              </CardTitle>
              <CardDescription>Dusuk yogunluklu alanlar icin stratejiler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {SECTIONS.map(section => {
                const Icon = section.icon;
                return (
                  <div key={section.id}>
                    <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-nomad-green" />
                      {section.title}
                    </h3>
                    <div className="p-4 bg-green-950/20 border border-green-800/30 rounded-lg">
                      <ul className="space-y-2">
                        {section.rural.map((item, i) => (
                          <li key={i} className="text-sm text-green-300 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">-</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Turkey Notes */}
      {activeTab === 'turkey' && (
        <div className="space-y-6">
          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Turkiye Sehir Merkezleri / Urban Centers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TURKEY_URBAN_CENTERS.map((city, i) => (
                  <div key={i} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <h4 className="font-bold">{city.name} <span className="text-nomad-slate font-normal text-sm">({city.pop})</span></h4>
                    <p className="text-sm text-nomad-slate mt-1">{city.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="h-5 w-5 text-green-400" />
                Turkiye Kirsal Bolgeler / Rural Regions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TURKEY_RURAL_REGIONS.map((region, i) => (
                  <div key={i} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <h4 className="font-bold">{region.name}</h4>
                    <p className="text-sm text-nomad-slate mt-1">{region.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-800/50 bg-amber-950/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-300">
                    Turkiye deprem bolgesinde bulunmaktadir. Marmara, Ege ve Dogu Anadolu birinci derece deprem bolgeleridir.
                    Her bolge icin deprem hazirliklari yapilmalidir.
                  </p>
                  <p className="text-xs text-nomad-slate mt-1">
                    Kaynak: AFAD, Turkish Disaster and Emergency Management Authority
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
