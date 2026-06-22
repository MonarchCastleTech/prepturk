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
    id: 'awareness', title: 'Durumsal Farkındalık / Situational Awareness', titleEn: 'Situational Awareness',
    icon: Eye,
    expanded: false,
    content: [
      'ERKEN UYARI İŞARETLERİ (Early Warning Signs):',
      '  - Artan protesto ve gösteriler',
      '  - Sokağa çıkma yasakları duyurulması',
      '  - Güvenlik güçleri yığınağı',
      '  - Marketlerde stoklama paniği',
      '  - Sosyal medyada artan şiddet içeriği',
      '  - Resmi duyurular ve açıklamalar',
      '',
      'BİLGİ KAYNAKLARI (Information Sources):',
      '  - Resmi duyurular: AFAD, Valilik, Belediye',
      '  - Güvenilir haber kaynakları (birden fazla)',
      '  - Topluluk raporları: komşu bilgileri',
      '  - Radyo frekansları: acil durum kanalları',
      '',
      'SOSYAL MEDYA DOĞRULAMA (Social Media Verification):',
      '  - Bilgiyi en az 2 farklı kaynakta kontrol edin',
      '  - Resmi kaynakları bekleyin -- sosyal medya DOĞRU DEĞİLDİR',
      '  - Sahte haber ve görüntüler yaygındır',
      '  - Tarih ve konum bilgisi olmayan içeriklere inanmayın',
      '  - Görsellerin aynı olaya ait olup olmadığını kontrol edin',
      '  - Paylaşmadan önce doğrulayın -- yanlış bilgi panik yaratır',
      '',
      'NE YAPMALI:',
      '  - Günlük durum değerlendirmesi yapın',
      '  - Bölgenizdeki gelişmeleri takip edin',
      '  - Güvenilir iletişim ağı oluşturun',
      '  - Bilgiyi doğrulayın -- yaymadan önce düşünün',
      '',
      'Kaynak: AFAD, Red Cross Community Safety Guides',
    ],
  },
  {
    id: 'safe-room', title: 'Güvenli Oda / Safe Room Preparation', titleEn: 'Safe Room',
    icon: Home,
    expanded: false,
    content: [
      'GÜVENLİ ODA HAZIRLIĞI:',
      '',
      'ODA SEÇİMİ:',
      '  - İçsel oda -- penceresiz veya en az pencere',
      '  - Dış duvarları olmayan oda tercih edilir',
      '  - Zemin katı veya bodrum daha güvenli',
      '  - Giriş kapısına yakın olmamalı',
      '',
      'İÇİNDE BULUNMASI GEREKENLER:',
      '  - Su (en az 3 litre kişi başı)',
      '  - Bozulmayan gıda (konserve, kraker)',
      '  - İlkyardım çantası',
      '  - El feneri ve yedek piller',
      '  - Pil radyosu (acil durum kanalları için)',
      '  - Mobil telefon ve şarj aleti',
      '  - Önemli belgelerin kopyaları',
      '  - Nakit para (küçük bozuk)',
      '  - Düşük güçlü el aletleri',
      '',
      'İLETİŞİM:',
      '  - Pil radyosu -- resmi kanalları dinleyin',
      '  - Telefon -- SMS göndermeyi deneyin (arama yoğun olabilir)',
      '  - Işık veya ses sinyalleri komşularla iletişim için',
      '',
      'ÇIKIŞ ROTASI (Exit Route):',
      '  - En az 2 farklı çıkış rotası belirleyin',
      '  - Rotaları gün ışığında kontrol edin',
      '  - Alternatif rotalar da belirleyin',
      '  - Buluşma noktası belirleyin (dışarıda)',
      '',
      'Kaynak: AFAD, Red Cross Safe Room Guidelines',
    ],
  },
  {
    id: 'shelter-evacuate', title: 'Sığınma vs Tahliye / Shelter vs Evacuate', titleEn: 'Shelter vs Evacuate',
    icon: Route,
    expanded: false,
    content: [
      'NE ZAMAN KALMALI (When to Stay):',
      '  - Şiddet bölgesel ve size ulaşmıyorsa',
      '  - Bölgeniz güvendeyse',
      '  - Yollar tehlikeliyse',
      '  - Geçici bir güvenli alan bilmiyorsanız',
      '  - Aile üyeleri hasta veya yaşlıysa',
      '',
      'NE ZAMAN TERK ETMELİ (When to Leave):',
      '  - Şiddet bölgenize yaklaşıyorsa',
      '  - Esas hizmetler kesildiyse (su, elektrik, doğalgaz)',
      '  - Yetkililer tahliye öneriyorsa',
      '  - Gıda ve su stoklarınız tükendiyse',
      '  - Binanız güvenli değilse',
      '',
      'TAHLİYE ROTASI PLANLAMA (Evacuation Route Planning):',
      '  - Ana yollardan kaçının -- kalabalık ve hedef olabilir',
      '  - Alternatif rotalar belirleyin',
      '  - Rotaları önceden keşfedin (gündüz)',
      '  - Yaya rotaları da planlayın (araçlar çalışmayabilir)',
      '  - Yakıt durumunu kontrol edin',
      '  - Buluşma noktalarını aile ile paylaşın',
      '',
      'TAHLİYE ÇANTASI (Evacuation Bag):',
      '  - Su ve arıtma tableti',
      '  - Bozulmayan gıda (3 günlük)',
      '  - İlkyardım çantası',
      '  - Kıyafet (hava koşullarına uygun)',
      '  - Önemli belgeler (suya dayanıklı poşette)',
      '  - Nakit para',
      '  - El feneri ve piller',
      '  - Çakı/çok amaçlı alet',
      '  - Düş (2 metre ip)',
      '  - Kişisel hijyen malzemeleri',
      '',
      'Kaynak: AFAD Tahliye Rehberi, FEMA Evacuation Guidelines',
    ],
  },
  {
    id: 'de-escalation', title: 'Gerginlik Azaltma / De-escalation Techniques', titleEn: 'De-escalation',
    icon: Shield,
    expanded: false,
    content: [
      'BEDEN DİLİ (Body Language):',
      '  - Tehditkar olmayan duruş',
      '  - Eller görünürde -- cepte değil',
      '  - Açık avuç içeri -- yumruk değil',
      '  - Göz teması kurun ama dik dik bakmayın',
      '  - Mesafe koruyun (2 metre+)',
      '  - Ani hareketlerden kaçının',
      '',
      'SÖZEL GERGİNLİK AZALTMA (Verbal De-escalation):',
      '  - Sakin ton kullanın',
      '  - Mümkünse karşı taraf katılın',
      '  - Çatışmadan kaçının',
      '  - "Anlıyorum", "Haklısınız" gibi ifadeler kullanın',
      '  - Bağırmayın -- ses tonunuzu düşük tutun',
      '  - Tartışmayın -- olay yerinden uzaklaşın',
      '  - Karşı tarafı suçlamayın',
      '',
      'KALABALIKTA KALIRSANIZ (If Caught in a Crowd):',
      '  - Akış ile hareket edin -- direnmeyin',
      '  - Kenar sokaklara yönelmeye çalışın',
      '  - Düşmeyin -- düşmek çok tehlikeli',
      '  - Kollarınızı göğsünüzün önünde tutun (nefes almak için)',
      '  - Duvar kenarına yönelmeye çalışın',
      '  - Yukarıya (merdiven, yüksek yer) çıkmaya çalışın',
      '  - Çıkış noktasını her zaman göz önünde bulundurun',
      '',
      'Çatışma durumunda:',
      '  - Eşyalarınızı bırakın -- hayatınızdan önemli değil',
      '  - Bağırmayın -- dikkat çekmeyin',
      '  - Sakin olun ve itaat edin',
      '  - Saldırganı gözlemleyin (sonra rapor için)',
      '',
      'Kaynak: Red Cross Safety Guides, Civil Defense Guidance',
    ],
  },
  {
    id: 'community-safety', title: 'Topluluk Güvenliği / Community Safety', titleEn: 'Community Safety',
    icon: Users,
    expanded: false,
    content: [
      'MAHALLE BEKÇİ ORGANİZASYONU (Neighborhood Watch):',
      '  - Mahalle sakinleri ile tanışın',
      '  - İletişim bilgilerini paylaşın',
      '  - Nöbet rotası oluşturun',
      '  - Günlük veya haftalık kontrol planı',
      '  - Şifre veya işaret sistemi',
      '',
      'İLETİŞİM ZİNCİRLERİ (Communication Chains):',
      '  - Her kişi 2-3 komşusundan sorumlu',
      '  - Bilgi zincir şeklinde yayılır',
      '  - Telefon çalışmıyorsa yaya mesajlaşma',
      '  - Belirli saatlerde buluşma',
      '  - Işık veya bayrak sinyalleri',
      '',
      'PAYLAŞILAN KAYNAKLAR (Shared Resources):',
      '  - Ortak gıda deposu',
      '  - Ortak su arıtma sistemi',
      '  - Ortak ilkyardım çantası',
      '  - Ortak iletişim cihazları (radyo)',
      '  - Beceri envanteri (doktor, hemşire, elektrikçi)',
      '',
      'TOPLANTI NOKTALARI:',
      '  - Birincil buluşma: Mahalle merkez',
      '  - İkincil buluşma: Alternatif güvenli alan',
      '  - Acil durum buluşma: En yakın toplanma alanı',
      '',
      'ORGANİZASYON YAPISI:',
      '  - Koordinatör: Genel planlama',
      '  - İletişim: Bilgi dağıtımı',
      '  - Sağlık: İlkyardım sorumlusu',
      '  - Güvenlik: Gözlem ve raporlama',
      '  - Lojistik: Kaynak yönetimi',
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
        <h1 className="text-2xl font-bold">Güvenlik Planlama / Civil Unrest Safety Guide</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Toplum olayları ve güvenlik tehditlerine karşı hazırlık ve planlama
        </p>
      </div>

      {/* Warning */}
      <Card className="border-amber-700 bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-bold text-amber-400">ÖNLEYİCİ HAZIRLIK ÖNEMLİ</p>
              <p className="text-sm text-amber-300 mt-1">
                Kriz olmadan önce hazırlık yapın. Olaylar hızlı gelişir -- zamanında harekete geçmek hayat kurtarır.
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
