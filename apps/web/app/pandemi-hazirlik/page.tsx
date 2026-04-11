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
    id: 'isolation', title: 'Ev Karantinasi / Home Quarantine', titleEn: 'Home Quarantine',
    icon: Home,
    expanded: false,
    content: [
      'SAGLIK BAKANLIGI EV KARANTINASI REHBERI:',
      '',
      'AYRI ODА Duzenlemesi:',
      '  - Hasta icin ayri bir oda ayirin',
      '  - Mucabur kalınmadıkça hasta odasından cikmamalı',
      '  - Ortak alan kullanımı minimuma indirilmeli',
      '  - Hasta oda kapısı kapalı tutulmalı',
      '',
      'HAVALANDIRMA (Ventilation):',
      '  - Pencereleri acin -- temiz hava akisi sart',
      '  - Hava akis yonunu belirleyin: Temiz oda -> Koridor -> Disari',
      '  - Kapı altı boslugu hava akisini artirir',
      '  - Mumkunse oda icerisine HEPA filtre yerlestirin',
      '  - Ortak alanlarda havalandirma surekli acik olmalı',
      '',
      'DEZENFEKSIYON (Disinfection):',
      '  - Camsuyu cozeltisi: 1 olcu camsuyu + 49 olcu su (1:50 oran)',
      '  - Yuzeyleri gunluk olarak silin',
      '  - Kapı kolları, ışık anahtarları, musluklar oncelikli',
      '  - Hasta odasini ayri bir bezle temizleyin',
      '  - El hijyeni: 20 saniye sabunla yikayin',
      '',
      'ATIK YONETIMI (Waste Management):',
      '  - Hasta odasinda ayri cop torbasi bulundurun',
      '  - Kullanılmıs maskeler, mendiller cift torbaya konulmalı',
      '  - Torbalar agizları baglanarak atılmalı',
      '  - Atıklar ayri olarak toplanmalı',
      '  - Eldiven kullanarak atıkları tasıyın',
      '',
      'GIDA TESLIMATI (Food Delivery):',
      '  - Temassiz teslimat: Kapı onune birakin',
      '  - Teslimatçı ile mesafe koruyun (2 metre)',
      '  - Gida ambalajlarını dezenfekte edin',
      '  - Ellerinizi yikayin -- gida hazırlayin',
      '',
      'Kaynak: Saglik Bakanligi Ev Karantina Rehberi, WHO Home Care Guidelines',
    ],
  },
  {
    id: 'duration', title: 'Sure Kurallari / Duration Guidelines', titleEn: 'Duration',
    icon: Clock,
    expanded: false,
    content: [
      'KARANTINA SURELERI (Quarantine Durations):',
      '',
      'Standart karantina: 14 gun',
      '  - Kuluca donemi maksimum 14 gun olarak kabul edilir',
      '  - Belirti yoksa 14. gun karantina sona erer',
      '',
      'Hasta kisiler icin:',
      '  - Belirtiler basladiktan sonra en az 10 gun izolasyon',
      '  - Son 24 saatte ates dusmus olmalı (ates dusurucu olmadan)',
      '  - Belirtilerde belirgin iyilesme olmalı',
      '',
      'Ne zaman hastaneye basvurmalı:',
      '  - Nefes almada zorluk',
      '  - Gogus agrisi veya baski',
      '  - Dudaklarda veya yuzde morarma',
      '  - Bilinc kaybi veya konfuzyon',
      '  - 3 gun boyunca yukselk ates (39C uzeri)',
      '',
      'Acil durum: 112 yi arayin',
      '  - Nefes darligi acil durumdur',
      '  - Ambulans cagirmaktan cekinmeyin',
      '',
      'Kaynak: Saglik Bakanligi, WHO, CDC',
    ],
  },
  {
    id: 'supplies', title: 'Malzeme Hazirliği / Supply Preparation', titleEn: 'Supplies',
    icon: Package,
    expanded: false,
    content: [
      '2 HAFTALIK STOK MINIMUM (2-Week Supply Minimum):',
      '',
      'SAGLIK MALZEMELERI:',
      '  - Maske (cerrahi maske, N95/FFP2 mumkunse)',
      '  - Eldiven (tek kullanimlik)',
      '  - Dezenfektan (en az %60 alkollu)',
      '  - Camsuyu (yuzey temizligi icin)',
      '  - Ates dusurucu (parasetamol/ibuprofen)',
      '  - Duzelme termometre',
      '  - Receptli ilaclar (en az 1 aylik stok)',
      '',
      'GIDA (Sogutucu Gerektirmeyen):',
      '  - Konserve gıdalar (et, sebze, meyve)',
      '  - Kuru baklagiller (mercimek, nohut, fasulye)',
      '  - Pirinc, bulgur, makarna',
      '  - Konserve corbalar',
      '  - Kraker, biskuvi',
      '  - Kuruyemisler (ceviz, findik, badem)',
      '  - Bal, recel',
      '  - Icecekler (su, cay, meyve suyu)',
      '',
      'TEMIZLIK:',
      '  - Sabun (el ve vucut icin)',
      '  - Camasir deterjanı',
      '  - Bulasik deterjanı',
      '  - Camsuyu',
      '  - Cop torbalari (buyuk boy)',
      '  - Kagit havlu, tuvalet kagidi',
      '',
      'ONEM LI: Buzdolabi calismiyorsa, sogutucu gerektiren gidalar 2 saatten fazla guvenli degildir.',
    ],
  },
  {
    id: 'mental-health', title: 'Ruhsal Saglık / Mental Health', titleEn: 'Mental Health',
    icon: Heart,
    expanded: false,
    content: [
      'IZOLASYON SIRASINDA RUHSAL SAGLIK:',
      '',
      'RUTIN KORUMA (Routine Maintenance):',
      '  - Her gun ayni saatte kalkin ve ayni saatte yatın',
      '  - Kahvaltı, oglen, aksam yemegi saatlerini koruyun',
      '  - Gunluk plan yapin (aktiviteler, dinlenme)',
      '  - Hafta sonu da dahil rutini koruyun',
      '',
      'KAPALI ALANDA EGZERSIZ (Exercise in Confined Space):',
      '  - Sabah 15 dakika esneme',
      '  - Gun ortası 20 dakika yuruyus (odada)',
      '  - Aksam 10 dakika nefes egzersizleri',
      '  - Yoga veya pilates (internet olmadan da mumkun)',
      '  - Merdiven varsa inis-cikis (varsa)',
      '',
      'SOSYAL BAGLANTI (Social Connection):',
      '  - Telefonla gorusun (cevrimdisi SMS/arama)',
      '  - Internet varsa: goruntulu gorusme',
      '  - Kapi onunden komsularla mesafeli konusun',
      '  - Yalnız deǵilsiniz -- topluluk hissi onemli',
      '',
      'IZOLASYON SIKINTISI BELIRILERI (Signs of Isolation Distress):',
      '  - Asiri uyku veya uykusuzluk',
      '  - Iştah kaybi veya asiri yeme',
      '  - Odaklanma zorlugu',
      '  - Sinirlilik veya okeykilik',
      '  - Umutsuzluk hissi',
      '  - Panik atak',
      '',
      'Ne Yapmali:',
      '  - Duygularinizi kabul edin -- normal bir tepki',
      '  - Birileriyle konusun -- yalniz kalmayın',
      '  - Gunluk yazın -- duygularinizi kaydedin',
      '  - Meditasyon veya derin nefes yapın',
      '  - Profesyonel yardım arayin (mumkunse)',
      '',
      'Cocuklar icin:',
      '  - Yaslarina uygun aciklama yapın',
      '  - Oyun ve aktivite duzenleyin',
      '  - Ekran suresini sinirlayin',
      '  - Guvenlik hissi verin',
      '',
      'Kaynak: WHO Mental Health Guidelines, Saglik Bakanligi Psikolojik Destek Rehberi',
    ],
  },
  {
    id: 'supply-chain', title: 'Tedarik Zinciri / Supply Chain', titleEn: 'Supply Chain',
    icon: Shield,
    expanded: false,
    content: [
      'TEDARIK ZINCIRI BOZULMASI HAZIRLIGI:',
      '',
      'ILK 2 HAFTA:',
      '  - Market rafları bosalmaya baslar',
      '  - Temel gida maddeleri oncelikli tukenir',
      '  - Saglik malzemeleri (maske, dezenfektan) bulunamaz',
      '',
      '2-4 HAFTA:',
      '  - Tedarik zinciri kademeli olarak onarilmaya baslar',
      '  - Hukumet mudahalesi: fiyat kontrolu, stok yonetimi',
      '  - Online altyapi: eve teslimat sistemleri',
      '',
      '1-3 AY:',
      '  - Normallesme sureci baslar',
      '  - Yerel uretim onemli hale gelir',
      '  - Topluluk destegi aglari guclenir',
      '',
      'HAZIRLIK ONERILERI:',
      '  - Her zaman 2 haftalik stok bulundurun',
      '  - Ilac recetelerinizi gunluk tutun',
      '  - Alternatif tedarik kaynaklari belirleyin',
      '  - Topluluk destegi agina katilin',
      '',
      'TURKIYE DENECIMI:',
      '  - Pandemi doneminde Saglik Bakanligi online randevu sistemi',
      '  - 65 yas ustu icin market saatleri duzenlemesi',
      '  - Ulusal destek hattı: 182 (Saglik)',
      '  - E-Devlet uzerinden saglik raporlari',
      '',
      'Kaynak: Saglik Bakanligi, WHO Pandemic Guidelines, CDC',
    ],
  },
  {
    id: 'history', title: 'Tarihsel Referanslar / Historical References', titleEn: 'Historical',
    icon: BookOpen,
    expanded: false,
    content: [
      'TURKIYE VE DUNYA HALK SAGLIGI TARIHINDEN:',
      '',
      '1918 ISPANYOL GRIBI:',
      '  - Dunya capinda 50 milyon can kaybı',
      '  - Osmanlı Imparatorlugunda da etkili oldu',
      '  - Karantina ve sosyal mesafe onlemleri uygulandı',
      '',
      '1957 ASYA GRIBI:',
      '  - Turkiye de etkili oldu',
      '  - Ilk defa uluslararası isbirlikli mucadele',
      '',
      '2009 H1N1 DOMUZ GRIBI:',
      '  - Turkiye de dahil 214 ulkeyi etkiledi',
      '  - Saglik Bakanligi ulusal pandemik planini devreye aldı',
      '  - Ucretsiz asi programı uygulandı',
      '',
      '2020-2022 COVID-19:',
      '  - Turkiye de 60+ milyon vaka',
      '  - Saglik Bakanligi bilimsel kurul raporlari',
      '  - Ulusal asi programı',
      '  - Ev karantina uygulamalari',
      '',
      'OGRELENEN DERSLER:',
      '  - Erken mudahale hayat kurtarir',
      '  - Toplum uyumu onemli',
      '  - Saglik calisanlari en degerli kaynak',
      '  - Bilimsel veriye dayalı kararlar en etkili',
      '  - Sosyal desteki aglari kritik rol oynar',
      '',
      'Kaynak: Turk Halk Sagligi Arsivleri, WHO Pandemic History, CDC Historical Records',
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
        <h1 className="text-2xl font-bold">Pandemi Hazirliği / Pandemic Preparedness</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Pandemi ve karantina yonetimi icin kapsamli rehber
        </p>
      </div>

      {/* Info */}
      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                Bu rehber Saglik Bakanligi, WHO ve CDC pandemik hazirlik rehberlerinden derlenmistir.
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
        <Button variant="outline" size="sm" onClick={expandAll}>Hepsini Ac</Button>
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
