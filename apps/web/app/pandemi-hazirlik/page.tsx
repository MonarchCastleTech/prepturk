'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AlertTriangle, Info, Shield, Heart, Activity, BookOpen, ChevronDown, ChevronUp, Package, Clock, Home } from 'lucide-react';

interface PandemicSection {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
  expanded: boolean;
}

const SECTIONS: PandemicSection[] = [
  {
    id: 'isolation', title: 'Ev Karantinası / Home Quarantine', titleEn: 'Home Quarantine',
    icon: Home,
    expanded: false,
    content: [
      'SAĞLIK BAKANLIĞI EV KARANTİNASI REHBERİ:',
      '',
      'AYRI ODA Düzenlemesi:',
      '  - Hasta için ayrı bir oda ayırın',
      '  - Mücbur kalınmadıkça hasta odasından çıkmamalı',
      '  - Ortak alan kullanımı minimuma indirilmeli',
      '  - Hasta oda kapısı kapalı tutulmalı',
      '',
      'HAVALANDIRMA (Ventilation):',
      '  - Pencereleri açın -- temiz hava akışı şart',
      '  - Hava akış yönünü belirleyin: Temiz oda -> Koridor -> Dışarı',
      '  - Kapı altı boşluğu hava akışını artırır',
      '  - Mümkünse oda içerisine HEPA filtre yerleştirin',
      '  - Ortak alanlarda havalandırma sürekli açık olmalı',
      '',
      'DEZENFEKSİYON (Disinfection):',
      '  - Çamaşır suyu çözeltisi: 1 ölçü çamaşır suyu + 49 ölçü su (1:50 oran)',
      '  - Yüzeyleri günlük olarak silin',
      '  - Kapı kolları, ışık anahtarları, musluklar öncelikli',
      '  - Hasta odasını ayrı bir bezle temizleyin',
      '  - El hijyeni: 20 saniye sabunla yıkayın',
      '',
      'ATIK YÖNETİMİ (Waste Management):',
      '  - Hasta odasında ayrı çöp torbası bulundurun',
      '  - Kullanılmış maskeler, mendiller çift torbaya konulmalı',
      '  - Torbalar ağızları bağlanarak atılmalı',
      '  - Atıklar ayrı olarak toplanmalı',
      '  - Eldiven kullanarak atıkları taşıyın',
      '',
      'GIDA TESLİMATI (Food Delivery):',
      '  - Temassız teslimat: Kapı önüne bırakın',
      '  - Teslimatçı ile mesafe koruyun (2 metre)',
      '  - Gıda ambalajlarını dezenfekte edin',
      '  - Ellerinizi yıkayın -- gıda hazırlayın',
      '',
      'Kaynak: Sağlık Bakanlığı Ev Karantina Rehberi, WHO Home Care Guidelines',
    ],
  },
  {
    id: 'duration', title: 'Süre Kuralları / Duration Guidelines', titleEn: 'Duration',
    icon: Clock,
    expanded: false,
    content: [
      'KARANTİNA SÜRELERİ (Quarantine Durations):',
      '',
      'Standart karantina: 14 gün',
      '  - Kuluçka dönemi maksimum 14 gün olarak kabul edilir',
      '  - Belirti yoksa 14. gün karantina sona erer',
      '',
      'Hasta kişiler için:',
      '  - Belirtiler başladıktan sonra en az 10 gün izolasyon',
      '  - Son 24 saatte ateş düşmüş olmalı (ateş düşürücü olmadan)',
      '  - Belirtilerde belirgin iyileşme olmalı',
      '',
      'Ne zaman hastaneye başvurmalı:',
      '  - Nefes almada zorluk',
      '  - Göğüs ağrısı veya baskı',
      '  - Dudaklarda veya yüzde morarma',
      '  - Bilinç kaybı veya konfüzyon',
      '  - 3 gün boyunca yüksek ateş (39C üzeri)',
      '',
      'Acil durum: 112 yi arayın',
      '  - Nefes darlığı acil durumdur',
      '  - Ambulans çağırmaktan çekinmeyin',
      '',
      'Kaynak: Sağlık Bakanlığı, WHO, CDC',
    ],
  },
  {
    id: 'supplies', title: 'Malzeme Hazırlığı / Supply Preparation', titleEn: 'Supplies',
    icon: Package,
    expanded: false,
    content: [
      '2 HAFTALIK STOK MİNİMUM (2-Week Supply Minimum):',
      '',
      'SAĞLIK MALZEMELERİ:',
      '  - Maske (cerrahi maske, N95/FFP2 mümkünse)',
      '  - Eldiven (tek kullanımlık)',
      '  - Dezenfektan (en az %60 alkollü)',
      '  - Çamaşır suyu (yüzey temizliği için)',
      '  - Ateş düşürücü (parasetamol/ibuprofen)',
      '  - Dijital termometre',
      '  - Reçeteli ilaçlar (en az 1 aylık stok)',
      '',
      'GIDA (Soğutucu Gerektirmeyen):',
      '  - Konserve gıdalar (et, sebze, meyve)',
      '  - Kuru baklagiller (mercimek, nohut, fasulye)',
      '  - Pirinç, bulgur, makarna',
      '  - Konserve çorbalar',
      '  - Kraker, bisküvi',
      '  - Kuruyemişler (ceviz, fındık, badem)',
      '  - Bal, reçel',
      '  - İçecekler (su, çay, meyve suyu)',
      '',
      'TEMİZLİK:',
      '  - Sabun (el ve vücut için)',
      '  - Çamaşır deterjanı',
      '  - Bulaşık deterjanı',
      '  - Çamaşır suyu',
      '  - Çöp torbaları (büyük boy)',
      '  - Kağıt havlu, tuvalet kağıdı',
      '',
      'ÖNEMLİ: Buzdolabı çalışmıyorsa, soğutucu gerektiren gıdalar 2 saatten fazla güvenli değildir.',
    ],
  },
  {
    id: 'mental-health', title: 'Ruhsal Sağlık / Mental Health', titleEn: 'Mental Health',
    icon: Heart,
    expanded: false,
    content: [
      'İZOLASYON SIRASINDA RUHSAL SAĞLIK:',
      '',
      'RUTİN KORUMA (Routine Maintenance):',
      '  - Her gün aynı saatte kalkın ve aynı saatte yatın',
      '  - Kahvaltı, öğlen, akşam yemeği saatlerini koruyun',
      '  - Günlük plan yapın (aktiviteler, dinlenme)',
      '  - Hafta sonu da dahil rutini koruyun',
      '',
      'KAPALI ALANDA EGZERSİZ (Exercise in Confined Space):',
      '  - Sabah 15 dakika esneme',
      '  - Gün ortası 20 dakika yürüyüş (odada)',
      '  - Akşam 10 dakika nefes egzersizleri',
      '  - Yoga veya pilates (internet olmadan da mümkün)',
      '  - Merdiven varsa iniş-çıkış (varsa)',
      '',
      'SOSYAL BAĞLANTI (Social Connection):',
      '  - Telefonla görüşün (çevrimdışı SMS/arama)',
      '  - İnternet varsa: görüntülü görüşme',
      '  - Kapı önünden komşularla mesafeli konuşun',
      '  - Yalnız değilsiniz -- topluluk hissi önemli',
      '',
      'İZOLASYON SIKINTISI BELİRTİLERİ (Signs of Isolation Distress):',
      '  - Aşırı uyku veya uykusuzluk',
      '  - İştah kaybı veya aşırı yeme',
      '  - Odaklanma zorluğu',
      '  - Sinirlilik veya öfkelilik',
      '  - Umutsuzluk hissi',
      '  - Panik atak',
      '',
      'Ne Yapmalı:',
      '  - Duygularınızı kabul edin -- normal bir tepki',
      '  - Birileriyle konuşun -- yalnız kalmayın',
      '  - Günlük yazın -- duygularınızı kaydedin',
      '  - Meditasyon veya derin nefes yapın',
      '  - Profesyonel yardım arayın (mümkünse)',
      '',
      'Çocuklar için:',
      '  - Yaşlarına uygun açıklama yapın',
      '  - Oyun ve aktivite düzenleyin',
      '  - Ekran süresini sınırlayın',
      '  - Güvenlik hissi verin',
      '',
      'Kaynak: WHO Mental Health Guidelines, Sağlık Bakanlığı Psikolojik Destek Rehberi',
    ],
  },
  {
    id: 'supply-chain', title: 'Tedarik Zinciri / Supply Chain', titleEn: 'Supply Chain',
    icon: Shield,
    expanded: false,
    content: [
      'TEDARİK ZİNCİRİ BOZULMASI HAZIRLIĞI:',
      '',
      'İLK 2 HAFTA:',
      '  - Market rafları boşalmaya başlar',
      '  - Temel gıda maddeleri öncelikli tükenir',
      '  - Sağlık malzemeleri (maske, dezenfektan) bulunamaz',
      '',
      '2-4 HAFTA:',
      '  - Tedarik zinciri kademeli olarak onarılmaya başlar',
      '  - Hükümet müdahalesi: fiyat kontrolü, stok yönetimi',
      '  - Online altyapı: eve teslimat sistemleri',
      '',
      '1-3 AY:',
      '  - Normalleşme süreci başlar',
      '  - Yerel üretim önemli hale gelir',
      '  - Topluluk desteği ağları güçlenir',
      '',
      'HAZIRLIK ÖNERİLERİ:',
      '  - Her zaman 2 haftalık stok bulundurun',
      '  - İlaç reçetelerinizi güncel tutun',
      '  - Alternatif tedarik kaynakları belirleyin',
      '  - Topluluk desteği ağına katılın',
      '',
      'TÜRKİYE DENEYİMİ:',
      '  - Pandemi döneminde Sağlık Bakanlığı online randevu sistemi',
      '  - 65 yaş üstü için market saatleri düzenlemesi',
      '  - Ulusal destek hattı: 182 (Sağlık)',
      '  - E-Devlet üzerinden sağlık raporları',
      '',
      'Kaynak: Sağlık Bakanlığı, WHO Pandemic Guidelines, CDC',
    ],
  },
  {
    id: 'history', title: 'Tarihsel Referanslar / Historical References', titleEn: 'Historical',
    icon: BookOpen,
    expanded: false,
    content: [
      'TÜRKİYE VE DÜNYA HALK SAĞLIĞI TARİHİNDEN:',
      '',
      '1918 İSPANYOL GRİBİ:',
      '  - Dünya çapında 50 milyon can kaybı',
      '  - Osmanlı İmparatorluğunda da etkili oldu',
      '  - Karantina ve sosyal mesafe önlemleri uygulandı',
      '',
      '1957 ASYA GRİBİ:',
      '  - Türkiye de etkili oldu',
      '  - İlk defa uluslararası işbirlikli mücadele',
      '',
      '2009 H1N1 DOMUZ GRİBİ:',
      '  - Türkiye de dahil 214 ülkeyi etkiledi',
      '  - Sağlık Bakanlığı ulusal pandemik planını devreye aldı',
      '  - Ücretsiz aşı programı uygulandı',
      '',
      '2020-2022 COVID-19:',
      '  - Türkiye de 60+ milyon vaka',
      '  - Sağlık Bakanlığı bilimsel kurul raporları',
      '  - Ulusal aşı programı',
      '  - Ev karantina uygulamaları',
      '',
      'ÖĞRENİLEN DERSLER:',
      '  - Erken müdahale hayat kurtarır',
      '  - Toplum uyumu önemli',
      '  - Sağlık çalışanları en değerli kaynak',
      '  - Bilimsel veriye dayalı kararlar en etkili',
      '  - Sosyal destek ağları kritik rol oynar',
      '',
      'Kaynak: Türk Halk Sağlığı Arşivleri, WHO Pandemic History, CDC Historical Records',
    ],
  },
];

export default function PandemiHazirlikPage() {
  const [sections, setSections] = useState<PandemicSection[]>(SECTIONS);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  const expandAll = () => {
    setSections(prev => prev.map(s => ({ ...s, expanded: true })));
  };

  const collapseAll = () => {
    setSections(prev => prev.map(s => ({ ...s, expanded: false })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pandemi Hazırlığı / Pandemic Preparedness</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Pandemi ve karantina yönetimi için kapsamlı rehber
        </p>
      </div>

      {/* Info */}
      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                Bu rehber Sağlık Bakanlığı, WHO ve CDC pandemik hazırlık rehberlerinden derlenmiştir.
              </p>
              <p className="text-xs text-nomad-slate mt-1">
                Compiled from Ministry of Health, WHO, and CDC pandemic preparedness guidelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>Hepsini Aç</Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>Hepsini Kapat</Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="border-nomad-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-nomad-bg">
                      <Icon className="h-5 w-5 text-nomad-green" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                  </div>
                  <button onClick={() => toggleSection(section.id)} className="p-1 hover:bg-nomad-bg rounded transition-colors">
                    {section.expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
              </CardHeader>

              {section.expanded && (
                <CardContent>
                  <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                      {section.content.join('\n')}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
