'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AlertTriangle, Info, Shield, Eye, Home, Route, Users, Radio, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
  expanded: boolean;
}

const SECTIONS: GuideSection[] = [
  {
    id: 'awareness', title: 'Durumsal Farkindalik / Situational Awareness', titleEn: 'Situational Awareness',
    icon: Eye,
    expanded: false,
    content: [
      'ERKEN UYARI ISARETLERI (Early Warning Signs):',
      '  - Artan protesto ve gosteriler',
      '  - Sokaga cikma yasaklari duyurulmasi',
      '  - Guvenlik gucleri yiginagi',
      '  - Marketlerde stoklama panigi',
      '  - Sosyal medyada artan siddet icerigi',
      '  - resmi duyurular ve aciklamalar',
      '',
      'BILGI KAYNAKLARI (Information Sources):',
      '  - Resmi duyurular: AFAD, Valilik, Belediye',
      '  - Guvenilir haber kaynaklari (birden fazla)',
      '  - Topluluk raporlari: komsu bilgileri',
      '  - Radyo frekanslari: acil durum kanallari',
      '',
      'SOSYAL MEDYA DOGRULAMA (Social Media Verification):',
      '  - Bilgiyi en az 2 farkli kaynakta kontrol edin',
      '  - Resmi kaynaklari bekleyin -- sosyal medya DOGRU DEGILDIR',
      '  - Sahte haber ve goruntuler yaygindir',
      '  - Tarih ve konum bilgisi olmayan iceriklere inanmayin',
      '  - Gorsellerin ayni olaya ait olup olmadigini kontrol edin',
      '  - Paylasmadan once dogrulayin -- yanlis bilgi panik yaratir',
      '',
      'NE YAPMALI:',
      '  - Gunluk durum degerlendirmesi yapin',
      '  - Bolgenizdeki gelismeleri takip edin',
      '  - Guvenilir iletisim agi olusturun',
      '  - Bilgiyi dogrulayin -- yaymadan once dusunun',
      '',
      'Kaynak: AFAD, Red Cross Community Safety Guides',
    ],
  },
  {
    id: 'safe-room', title: 'Guvenli Oda / Safe Room Preparation', titleEn: 'Safe Room',
    icon: Home,
    expanded: false,
    content: [
      'GUVENLI ODА HAZIRLIGI:',
      '',
      'ODA SECIMI:',
      '  - Icsel oda -- penceresiz veya en az pencere',
      '  - Dis duvarlari olmayan oda tercih edilir',
      '  - Zemin kati veya bodrum daha guvenli',
      '  - Giris kapisina yakin olmamali',
      '',
      'ICINDE BULUNMASI GEREKENLER:',
      '  - Su (en az 3 litre kisi basi)',
      '  - Boholmayan gida (konserve, kraker)',
      '  - Ilkyardim cantasi',
      '  - El feneri ve yedek piller',
      '  - Pil radyosu (acil durum kanallari icin)',
      '  - Mobil telefon ve sarj aleti',
      '  - Onemli belgelerin kopyalari',
      '  - Nakit para (kucuk bozuk)',
      '  - Dusuk guclu el aletleri',
      '',
      'ILETISIM:',
      '  - Pil radyosu -- resmi kanallari dinleyin',
      '  - Telefon -- SMS gondermeyi deneyin (arama yogun olabilir)',
      '  - Isik veya ses sinyalleri komsularla iletisim icin',
      '',
      'CICIS ROTASI (Exit Route):',
      '  - En az 2 farkli cicis rotasi belirleyin',
      '  - Rotalari gun isiginda kontrol edin',
      '  - Alternatif rotalar da belirleyin',
      '  - Bulusma noktasi belirleyin (disarida)',
      '',
      'Kaynak: AFAD, Red Cross Safe Room Guidelines',
    ],
  },
  {
    id: 'shelter-evacuate', title: 'Sigınma vs Tahliye / Shelter vs Evacuate', titleEn: 'Shelter vs Evacuate',
    icon: Route,
    expanded: false,
    content: [
      'NE ZAMAN KALMALI (When to Stay):',
      '  - Siddet bolgesel ve size ulasmıyorsa',
      '  - Bolgeniz guvendeyse',
      '  - Yollar tehlikeliyse',
      '  - Gecici bir guvenli alan bilmiyorsanız',
      '  - Aile uyeleri hasta veya yasliysa',
      '',
      'NE ZAMAN TERK ETMELI (When to Leave):',
      '  - Siddet bolgenize yaklasiyorsa',
      '  - Esas hizmetler kesildiyse (su, elektrik, dogalgaz)',
      '  - Yetkililer tahliye oneriyorsa',
      '  - Gida ve su stoklariniz tukendiyse',
      '  - Binaniz guvenli degilse',
      '',
      'TAHLIYE ROTASI PLANLAMA (Evacuation Route Planning):',
      '  - Ana yollardan kacinin -- kalabalik ve hedef olabilir',
      '  - Alternatif rotalar belirleyin',
      '  - Rotalari onceden kesfedin (gunduz)',
      '  - Yaya rotalari da planlayin (araclar calismayabilir)',
      '  - Yakit durumunu kontrol edin',
      '  - Bulusma noktalarini aile ile paylasin',
      '',
      'TAHLIYE CANTASI (Evacuation Bag):',
      '  - Su ve arıtma tableti',
      '  - Boholmayan gida (3 gunluk)',
      '  - Ilkyardim cantasi',
      '  - Kiyafet (hava kosullarina uygun)',
      '  - Onemli belgeler (suya dayanikli poşette)',
      '  - Nakit para',
      '  - El feneri ve piller',
      '  - Cakı/cok amacli alet',
      '  - Dus (2 metre ip)',
      '  - Kisisel hijyen malzemeleri',
      '',
      'Kaynak: AFAD Tahliye Rehberi, FEMA Evacuation Guidelines',
    ],
  },
  {
    id: 'de-escalation', title: 'Gerginlik Azaltma / De-escalation Techniques', titleEn: 'De-escalation',
    icon: Shield,
    expanded: false,
    content: [
      'BEDEN DILI (Body Language):',
      '  - Tehditkar olmayan durus',
      '  - Eller gorunurde -- cepte degil',
      '  - Acik avuc iceri -- yumruk degil',
      '  - Goz temasi kurun ama dik dik bakmayın',
      '  - Mesafe koruyun (2 metre+)',
      '  - Ani hareketlerden kacinin',
      '',
      'SOZEL GERGİNLİK AZALTMA (Verbal De-escalation):',
      '  - Sakin ton kullanin',
      '  - Mumkunse karsı taraf katilin',
      '  - Catismadan kacinin',
      '  - "Anlıyorum", "Haklısınız" gibi ifadeler kullanın',
      '  - Bagırmayın -- ses tonunuzu dusuk tutun',
      '  - Tartışmayın -- olay yerinden uzaklasın',
      '  - Karsı tarafı suclamayin',
      '',
      'KALABALİKTA KALIRSANİZ (If Caught in a Crowd):',
      '  - Akıs ile hareket edin -- direnmeyin',
      '  - Kenar sokaklara yonelmeye calisin',
      '  - Dusmeyin -- dusmek cok tehlikeli',
      '  - Kollarınızı gogsunuzun onunde tutun (nefes almak icin)',
      '  - Duvar kenarina yonelmeye calisin',
      '  - Yukariya (merdiven, yuksek yer) cikmaya calisin',
      '  - Cıkıs noktasını her zaman goz onunde bulundurun',
      '',
      'Catisma durumunda:',
      '  - Esyalarinizi birakın -- hayatınızdan onemli degil',
      '  - Bagırmayin -- dikkat cekmeyin',
      '  - Sakin olun ve itaat edin',
      '  - Saldırganı gozlemleyin (sonra rapor icin)',
      '',
      'Kaynak: Red Cross Safety Guides, Civil Defense Guidance',
    ],
  },
  {
    id: 'community-safety', title: 'Topluluk Guvenligi / Community Safety', titleEn: 'Community Safety',
    icon: Users,
    expanded: false,
    content: [
      'MAHALLE BEKÇİ ORGANİZASYONU (Neighborhood Watch):',
      '  - Mahalle sakinleri ile tanisin',
      '  - Iletisim bilgilerini paylasin',
      '  - Nobet rotası olusturun',
      '  - Gunluk veya haftalik kontrol planı',
      '  - Sifre veya isaret sistemi',
      '',
      'ILETISIM ZİNCİRLERİ (Communication Chains):',
      '  - Her kisi 2-3 komsusundan sorumlu',
      '  - Bilgi zincir seklinde yayılır',
      '  - Telefon calısmıyorsa yaya mesajlasma',
      '  - Belirli saatlerde bulusma',
      '  - Isik veya bayrak sinyalleri',
      '',
      'PAYLASILAN KAYNAKLAR (Shared Resources):',
      '  - Ortak gida deposu',
      '  - Ortak su arıtma sistemi',
      '  - Ortak ilkyardim cantası',
      '  - Ortak iletisim cihazları (radyo)',
      '  - Beceri envanteri (doktor, hemşire, elektrikci)',
      '',
      'TOPLANTI NOKTALARI:',
      '  - Birincil bulusma: Mahalle merkez',
      '  - Ikincil bulusma: Alternatif guvenli alan',
      '  - Acil durum bulusma: En yakin toplanma alanı',
      '',
      'ORGANİZASYON YAPISI:',
      '  - Koordinator: Genel planlama',
      '  - Iletisim: Bilgi dagıtımı',
      '  - Saglik: Ilkyardim sorumlusu',
      '  - Guvenlik: Gozlem ve raporlama',
      '  - Lojistik: Kaynak yonetimi',
      '',
      'Kaynak: Red Cross Community Preparedness, Civil Defense Guides',
    ],
  },
];

export default function GuvenlikPlanlamaPage() {
  const [sections, setSections] = useState<GuideSection[]>(SECTIONS);

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
        <h1 className="text-2xl font-bold">Guvenlik Planlama / Civil Unrest Safety Guide</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Toplum olaylari ve guvenlik tehditlerine karsi hazirlik ve planlama
        </p>
      </div>

      {/* Warning */}
      <Card className="border-amber-700 bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-bold text-amber-400">ONLEYİCİ HAZIRLIK ON EMLİ</p>
              <p className="text-sm text-amber-300 mt-1">
                Kriz olmadan once hazirlik yapin. Olaylar hizli gelisir -- zamaninda harekete gecmek hayat kurtarir.
              </p>
              <p className="text-xs text-nomad-slate mt-2">
                Prepare before crisis. Events develop quickly -- timely action saves lives.
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
