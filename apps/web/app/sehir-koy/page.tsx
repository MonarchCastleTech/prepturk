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
      'Musluk suyu: Şehir şebekesi genellikle güvenlidir ancak krizde kontamine olabilir',
      'Su ısıtıcı tankı: 50-150L su içerir -- drenaj valfinden boşaltın',
      'Klozet tankı (sifon değil): Temiz su içerir (içme suyu değil, yıkama için)',
      'Su boruları: Ana vanayı kapatın, borularda kalan suyu musluklardan alın',
      'Yağmur suyu: Balkon ve çatıdan toplama sistemi kurun',
      'Havuz/süs havuzu: Son çare içme suyu olarak (mutlaka arıtılmalı)',
      'Kentsel avantaj: Daha fazla çeşme, daha fazla su kaynağı',
      'Kentsel dezavantaj: Daha fazla kişi = daha fazla rekabet',
    ],
    rural: [
      'Kuyu suyu: Elektrik kesilirse manuel pompa veya kova sistemi kullanın',
      'Kuyu testi: Kriz öncesi su kalitesini test ettirin (bakteri, nitrat, ağır metal)',
      'Yağmur suyu toplama: Çatıdan varile toplama -- en temiz doğal kaynak',
      'Akarsu/nehir: Yakında olabilir ama MUTLAKA arıtılmalı',
      'Doğal kaynaklar: Dağ kaynakları genellikle temizdir ama kontrol şart',
      'Kırsal avantaj: Daha az kişi = daha az rekabet, daha fazla doğal kaynak',
      'Kırsal dezavantaj: Yardıma ulaşmak daha uzun sürer',
      'Alternatif: El pompası (maliyeti düşük, montajı kolay)',
    ],
  },
  {
    id: 'food', title: 'Gıda / Food', titleEn: 'Food',
    icon: Home,
    urban: [
      'Balkon bahçeciliği: Domates, biber, fesleğen yetiştirilebilir',
      'Çatı bahçesi: Büyük binalarda çatıda sera kurulabilir',
      'Topluluk bahçeleri: Mahalle bahçesi organizasyonu',
      'Avantaj: Daha fazla market -- kriz öncesi stok yapma şansı',
      'Dezavantaj: Kriz sonrasında stoklar hızla tükenir',
      'Mantar yetiştirme: Karanlık, nemli ortamlarda kolay (bodrum, dolap altı)',
      'Filiz yetiştirme: 3-5 günde hasat -- en hızlı gıda üretimi',
      'Dikey bahçecilik: Duvarlarda aşağıya sarkan sistemler',
    ],
    rural: [
      'Bahçe üretimi: Geniş alan -- meyve, sebze, baklagil',
      'Küçükbaş hayvan: Tavuk, keçi -- süt ve yumurta üretimi',
      'Yabani ot toplama: Isırgan, semizotu, hindiba (doğru tanıma şart!)',
      'UYARI: Zehirli bitki riski -- bilmediğiniz bitkiyi YEMEYİN',
      'Avantaj: Geniş tarım alanı, doğal kaynaklar',
      'Koruma: Mahsulünüzü hayvanlardan ve hırsızlardan koruyun',
      'Konserve: Meyve/sebze konserveleme (kavanozla saklama)',
      'Kurutma: Güneşle kurutma (domates, biber, erik, incir)',
    ],
  },
  {
    id: 'shelter', title: 'Barınak / Shelter', titleEn: 'Shelter',
    icon: Shield,
    urban: [
      'Yüksek kat tahliyesi: SADECE merdiven kullanın, asansör ÇALIŞMAZ',
      'Ne zaman kal/ne zaman git: Bina hasarlıysa DERHAL çık',
      'Güvenli kat: Orta katlar (yangın ve sel riski daha düşük)',
      'Apartman tehlikeleri: Doğal gaz hatları, yangın yayılması, yapısal çökme',
      'Yangın merdiveni: Önceden kontrol edin, engel olup olmadığına bakın',
      'Ne zaman kal: Binanız güvenliyse, dışarıda barınak yoksa',
      'Ne zaman git: Bina hasarlıysa, yangın riski varsa',
      'Alternatif: Garaj, depo, bodrum geçici barınak için',
    ],
    rural: [
      'Mevcut yapılar: Ev, ahır, samanlık barınak için kullanılabilir',
      'Çadır: Açık havada en yaygın geçici barınak',
      'Doğal barınak: Mağara, ağır kayalık altları (çökme riski kontrol!)',
      'Yalıtım: Kırsalda gece sıcaklık düşüşü şehirden fazla olabilir',
      'Avantaj: Daha fazla alan, daha az kişi = daha fazla gizlenme',
      'Isınma: Odun sobası en yaygın kırsal ısınma yöntemi',
      'Havalandırma: Kapalı alanlarda karbonmonoksit riski!',
      'Güvenlik: Hayvanlardan korunma (yılan, böcek, yırtıcı)',
    ],
  },
  {
    id: 'dangers', title: 'Tehlikeler / Dangers', titleEn: 'Dangers',
    icon: AlertTriangle,
    urban: [
      'Yapısal çökme: Deprem, patlama sonucu bina çökmesi',
      'Doğal gaz patlaması: Gaz kaçağı -- kibrit ÇEKMEYİN, havalandırın',
      'Yangın yayılması: Şehirlerde yangın hızla yayılır (binalar yakın)',
      'Yağmacılık: Kalabalık alanlarda güvenlik riski artar',
      'Tıkanık yollar: Tahliye zorlaşır, ambulans ulaşamaz',
      'Kimyasal risk: Fabrikalar, benzin istasyonları tehlike kaynağı',
      'Elektrik çarpması: Düşen elektrik hatları -- YAKLAŞMAYIN',
      'Su baskını: Şehirlerde drenaj sistemi çalışmayabilir',
    ],
    rural: [
      'Tarımsal kimyasal: Pestisit, gübre -- su kaynaklarını kirletebilir',
      'Hayvan tehlikeleri: Yırtıcılar, yılanlar, böcekler',
      'Yangın: Orman yangınları kırsalda büyük risk',
      'İzolasyon: Yardıma ulaşmak saatler/günler alabilir',
      'Hava koşulları: Şehirlerden daha sert (rüzgar, dolu, kar)',
      'Zemin: Çukur, dere, engebeli arazi düşme/yaralanma riski',
      'Su kaynakları: Tarım ilaçları ile kirlenmiş olabilir',
      'Erişim: Uzak bölümlere ulaşmak zor olabilir',
    ],
  },
  {
    id: 'resources', title: 'Kaynaklar / Resources', titleEn: 'Resources',
    icon: Zap,
    urban: [
      'Avantaj: Daha fazla hastane ve sağlık merkezi',
      'Avantaj: Daha fazla hükümet yardımı',
      'Avantaj: Daha fazla topluluk kaynağı',
      'Avantaj: Daha fazla eğitim kurumu',
      'Avantaj: Daha fazla market ve depo',
      'Dezavantaj: Daha fazla insan = daha fazla rekabet',
      'Dezavantaj: Daha az yerel gıda üretimi',
      'Dezavantaj: Altyapı bağımlılığı yüksek (elektrik, su, gaz)',
    ],
    rural: [
      'Avantaj: Daha fazla alan ve mesafe',
      'Avantaj: Daha fazla doğal kaynak',
      'Avantaj: Daha az rekabet',
      'Avantaj: Kendi kendine yeterlilik mümkün',
      'Dezavantaj: Daha az sağlık kurumu',
      'Dezavantaj: Daha az hükümet yardımı',
      'Dezavantaj: Daha uzun yardım ulaşma süresi',
      'Dezavantaj: Ulaşım zorlukları',
    ],
  },
];

const TURKEY_URBAN_CENTERS = [
  { name: 'İstanbul', pop: '16M', notes: 'En büyük şehir -- deprem riski yüksek. 2 kıta arası ulaşım kritik.' },
  { name: 'Ankara', pop: '5.7M', notes: 'Başkent -- hükümet merkezleri. Altyapı daha güçlü.' },
  { name: 'İzmir', pop: '4.4M', notes: 'Ege bölgesi -- deprem bölgesi. Liman şehri.' },
  { name: 'Antalya', pop: '2.6M', notes: 'Turizm bölgesi -- turistik altyapı var. Sıcak iklim.' },
  { name: 'Bursa', pop: '3.1M', notes: 'Sanayi şehri -- fabrikalar risk. Uludağ su kaynağı.' },
];

const TURKEY_RURAL_REGIONS = [
  { name: 'Karadeniz (kırsal)', notes: 'Yağışlı -- tarım bölgesi. Çay, fındık, mısır. Sel riski.' },
  { name: 'İç Anadolu (kırsal)', notes: 'Kuru iklim -- tahıl bölgesi. Buğday, arpa. Su kirli olabilir.' },
  { name: 'Doğu Anadolu (kırsal)', notes: 'Sert iklim -- kış zorlu. Hayvancılık önemli. Deprem bölgesi.' },
  { name: 'Ege (kırsal)', notes: 'Verimli toprak -- zeytin, incir, üzüm. Deprem riski.' },
  { name: 'Akdeniz (kırsal)', notes: 'Sıcak iklim -- narenciye, pamuk. Orman yangını riski.' },
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
        <h1 className="text-2xl font-bold">Şehir vs Köy / Urban vs Rural Survival</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Şehir ve kırsal alanlar için farklı hayatta kalma stratejileri
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'comparison' as const, label: 'Karşılaştırma' },
          { id: 'urban' as const, label: 'Şehir (Urban)' },
          { id: 'rural' as const, label: 'Köy (Rural)' },
          { id: 'turkey' as const, label: 'Türkiye Notları' },
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
            <CardTitle>Yan Yana Karşılaştırma / Side-by-Side Comparison</CardTitle>
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
                          Şehir / Urban
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
                          Köy / Rural
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
                Şehir Hayatta Kalma Rehberi / Urban Survival Guide
              </CardTitle>
              <CardDescription>Yüksek yoğunluklu alanlar için stratejiler</CardDescription>
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
                Kırsal Hayatta Kalma Rehberi / Rural Survival Guide
              </CardTitle>
              <CardDescription>Düşük yoğunluklu alanlar için stratejiler</CardDescription>
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
                Türkiye Şehir Merkezleri / Urban Centers
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
                Türkiye Kırsal Bölgeler / Rural Regions
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
                    Türkiye deprem bölgesinde bulunmaktadır. Marmara, Ege ve Doğu Anadolu birinci derece deprem bölgeleridir.
                    Her bölge için deprem hazırlıkları yapılmalıdır.
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
