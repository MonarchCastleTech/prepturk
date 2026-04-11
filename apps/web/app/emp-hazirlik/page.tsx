'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Zap, AlertTriangle, Radio, Clock, BookOpen, Shield, Battery, Lightbulb, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  timeframe: string;
  description: string;
  steps: string[];
  expanded: boolean;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'what-is', title: 'EMP Nedir? / What is EMP?', titleEn: 'What is EMP',
    icon: Zap, timeframe: 'Bilgi / Information',
    description: 'Elektromanyetik Darbe (EMP), elektronik cihazlara zarar veren guclu bir elektromanyetik alandir.',
    steps: [
      'EMP (Electromagnetic Pulse) = Elektromanyetik Darbe',
      '',
      'DOGAL NEDENLER (Natural Causes):',
      '  - Gunes firtinasi / Solar flare (Carrington Olayi 1859)',
      '  - Koronal Kutle Atimi / Coronal Mass Ejection (CME)',
      '  - 1859 Carrington Olayi: Telgraf sistemleri calismadi, kagitlar tutustu',
      '  - 1989 Quebec: Gunes firtinasi sonucu 9 saat elektrik kesintisi',
      '  - 2012: Guclu CME Dunyayi iskalatti -- tekrar olabilir',
      '',
      'YAPAY NEDENLER (Artificial Causes):',
      '  - Yuksek irtifa nukleer patlama (HEMP)',
      '  - 30-400 km yukseklikte nukleer patlama',
      '  - Tum bolgedeki elektronik cihazlara zarar verir',
      '  - Elektromanyetik silahlar (E-bomb)',
      '',
      'Etki alani: Yuzlerce kilometre cap',
    ],
    expanded: false,
  },
  {
    id: 'what-happens', title: 'Ne Olur? / What Happens?', titleEn: 'Effects',
    icon: AlertTriangle, timeframe: 'Etkiler / Effects',
    description: 'EMP sonucu elektronik cihazlar hasar gorur veya tamamen yok olur.',
    steps: [
      'ELEKTRONIK HASARI (Electronics Damage):',
      '  - Tum entegre devreler hasar gorur',
      '  - Bilgisayarlar, telefonlar, tabletler calismaz',
      '  - Araclarin elektronik sistemleri devre disi kalir',
      '  - 1980 oncesi araclar (karburatorlu) calismaya devam edebilir',
      '',
      'SEBEKE ARIZASI (Grid Failure):',
      '  - Elektrik santralleri devre disi kalir',
      '  - Transformatorler yanar (yedek bulmak aylar alir)',
      '  - Elektrik dagitim sistemi cokur',
      '',
      'ILETISIM KAYBI (Communication Loss):',
      '  - Cep telefonu sebekesi calismaz',
      '  - Internet erisimi yok',
      '  - Radyo/TV vericileri hasar gorur',
      '  - El tipi radyolar (pil ile) calismaya devam edebilir',
      '',
      'ULASIM BOZULMASI (Transportation Disruption):',
      '  - Modern araclar calismaz (ECU hasar)',
      '  - Trafik isiklari calismaz',
      '  - Ucaklar ini yapmaya zorlanir',
      '  - Bisiklet, yuruyus, at arabasi onemli hale gelir',
    ],
    expanded: false,
  },
  {
    id: 'first-hour', title: 'Ilk Saat / First Hour', titleEn: 'First Hour',
    icon: AlertCircle, timeframe: '0-1 saat / 0-1 hour',
    description: 'Ilk saatte yapilmasi gereken kritik adimlar.',
    steps: [
      '1. Hassas elektronik cihazlarin fislerini cekin',
      '   (Unplug sensitive electronics)',
      '',
      '2. Kritik cihazlari Faraday kafesine tasiyin:',
      '   - Metal cop kovasi (ic yalitimli)',
      '   - Alumin folyo sarimi (3-4 kat)',
      '   - Mikrodalga firin (CALISMADIKCA korur)',
      '   - Anti-statik torbalar',
      '',
      '3. Hasari degerlendirin:',
      '   - Elektrik var mi?',
      '   - Telefon calisiyor mu?',
      '   - Musluk suyu akiyor mu?',
      '   - Dogal gaz calisiyor mu?',
      '',
      '4. Aile uyelerini kontrol edin',
      '5. Komsulari kontrol edin',
      '6. Pil radyosunu acin -- resmi duyurulari dinleyin',
    ],
    expanded: false,
  },
  {
    id: 'first-24h', title: 'Ilk 24 Saat / First 24 Hours', titleEn: 'First 24 Hours',
    icon: Clock, timeframe: '1-24 saat / 1-24 hours',
    description: 'Ilk 24 saatte yapilmasi gereken onemli hazirliklar.',
    steps: [
      '1. SU KAYNAGINI GUVENCE ALTINA ALIN:',
      '   - Musluk suyu hala akiyorsa -- tum kaplari doldurun',
      '   - Su isitici tankini kontrol edin (50-150L)',
      '   - Klozet tanklarini kontrol edin (icme suyu degil)',
      '',
      '2. GIDA ENVANTERI YAPIN:',
      '   - Mevcut gida stoklarinizi sayin',
      '   - Boholmayan gidalari once tuketin',
      '   - Rasyon plani yapin (gunde en az 2000 kalori)',
      '',
      '3. KOMSULARI KONTROL EDIN:',
      '   - Yaslilar ve engellilere yardim edin',
      '   - Topluluk organizasyonu baslatin',
      '   - Yetenekleri belirleyin (doktor, hemshire, vs.)',
      '',
      '4. RESMI DUYURULARI DINLEYIN:',
      '   - Pil radyosu ile haber takibi',
      '   - AFAD duyurulari icin radyo frekanslarini dinleyin',
      '   - Bilgi yayilmasi icin elci sistemi kurun',
      '',
      '5. GUVENLIK ONLEMLERI:',
      '   - Kapi ve pencereleri guvenlige alin',
      '   - Aydinlatma icin mum/el feneri hazirlayin',
      '   - Ilkyardim cantasini kontrol edin',
    ],
    expanded: false,
  },
  {
    id: 'long-term', title: 'Uzun Vadeli Uyum / Long-term Adaptation', titleEn: 'Long-term',
    icon: Lightbulb, timeframe: '1 haftadan fazla / 1+ weeks',
    description: 'Elektriksiz hayata uyum icin uzun vadeli stratejiler.',
    steps: [
      'MANUEL ALTERNATIFLER (Manual Alternatives):',
      '  - El crankli radyo ve fener',
      '  - Manuel konserve acacagi',
      '  - El ile su pompasi',
      '  - Manuel ogutucu (kahve/baharat)',
      '  - El diki makinesi',
      '',
      'MEKANIK SAAT vs DIJITAL (Mechanical vs Digital):',
      '  - Mekanik saatler EMP den etkilenmez',
      '  - Dijital saatler calismaz',
      '  - Kurmali veya otomatik saat edin',
      '  - Gunes saati yapabilirsiniz (basit)',
      '',
      'ELEKTRIKSIZ ULASIM (Non-electric Transport):',
      '  - Bisiklet -- en degerli ulasim araci',
      '  - Yuruyus -- ayakkabi onemli',
      '  - At arabasi (kirsal alanlar icin)',
      '  - Kayak/kizak (kis icin)',
      '',
      'ELEKTRIKSIZ GIDA URETIMI (Food Without Electricity):',
      '  - Bahce uretimi (mevsime bagli)',
      '  - Konserve (kavanozla)',
      '  - Kurutma (gunesle)',
      '  - Tuzlama ve fermentasyon',
      '  - Mangal/ates ustu pisirme',
      '',
      'TELEFONSIZ/INTERNETSIZ TOPLULUK (Community Without Phones):',
      '  - Mahalle organizasyonu',
      '  - Elci sistemi (mesaj tasiyicilari)',
      '  - Belirli bulusma noktalar ve saatleri',
      '  - Bayrak/isik sinyalleri',
      '  - Duyuru panolari (fiziksel)',
    ],
    expanded: false,
  },
  {
    id: 'timeline', title: 'Gerceci Zaman Cizelgesi / Realistic Timeline', titleEn: 'Timeline',
    icon: Clock, timeframe: 'Haftalar-Aylar / Weeks-Months',
    description: 'Elektrik sebekesinin onarimi haftalar ila aylar alabilir.',
    steps: [
      'ILK 48 SAAT:',
      '  - Cogu insan durumun farkinda degil',
      '  - Marketler bosalmaya baslar',
      '  - Nakit para hala gecerli (ATM calismiyor)',
      '',
      '1 HAFTA:',
      '  - Gida ve su kitligi baslar',
      '  - Hukumet yardimi organize olmaya baslar',
      '  - Toplum panigi artabilir',
      '',
      '2-4 HAFTA:',
      '  - Bolgesel yardim ulasmaya baslar',
      '  - Gecici elektrik (jeneratorler)',
      '  - Su ve gida dagitimi organize edilir',
      '',
      '1-3 AY:',
      '  - Temiz elektrigi kademeli olarak doner',
      '  - Transformator degisimleri devam eder',
      '  - Toplum organizasyonu guclenir',
      '',
      '3-6 AY:',
      '  - Cogu bolgede elektrik donmus olmalidir',
      '  - Ekonomi toparlanmaya baslar',
      '  - Yeni onlemler alinmaya baslar',
      '',
      'Kaynak: FEMA, UK National Risk Register, AFAD enerji acil durum planlari',
    ],
    expanded: false,
  },
  {
    id: 'faraday', title: 'Faraday Kafesi Yapimi / Faraday Cage', titleEn: 'Faraday Cage',
    icon: Shield, timeframe: 'Hazirlik / Preparation',
    description: 'Elektronik cihazlari EMP den korumak icin Faraday kafesi yapimi.',
    steps: [
      'METAL COP KOVASI YONTEMI:',
      '  1. Metal (galvanizli) cop kovasi alin',
      '  2. Icinini karton veya kumasla kaplayin (yalitim)',
      '  3. Cihazi kucuk bir anti-statik torbaya koyun',
      '  4. Torbayi kovanin icine yerlestirin',
      '  5. Kapakki sikica kapatin',
      '  6. Kova ile metal yuzey temas etmemeli',
      '',
      'ALUMIN FOLYO YONTEMI:',
      '  1. Cihazi once kagit veya kumasa sarin',
      '  2. Uzerine alumin folyo sarin (3-4 kat)',
      '  3. Her kat arasinda temas olmamali',
      '  4. Folyo tamamen kaplamali (delik olmamali)',
      '',
      'TEST ETME:',
      '  - Icinde calisan bir radyo ile test edin',
      '  - Sinyal kesilmeli (static olmali)',
      '  - Sinyal aliyorsaniz kafes CALISMIYOR demektir',
      '',
      'ONEMLI:',
      '  - Metal kutu ILE yalitim arasinda BOSLUK olmali',
      '  - Cihaz metal yuzeye DOGRUDAN degmemeli',
      '  - Kapak tamamen kapanmali',
    ],
    expanded: false,
  },
  {
    id: 'sources', title: 'Kaynaklar / Sources', titleEn: 'Sources',
    icon: BookOpen, timeframe: 'Referanslar / References',
    description: 'Bu rehberin hazirlanmasinda kullanilan kaynaklar.',
    steps: [
      'AFAD Enerji Acil Durum Planlari',
      '  (Turkish Disaster and Emergency Management Authority)',
      '',
      'FEMA -- EMP Commission Report',
      '  (Federal Emergency Management Agency, USA)',
      '',
      'UK National Risk Register',
      '  (Civil Contingencies Secretariat, UK)',
      '',
      'Congressional EMP Commission',
      '  (Report of the Commission to Assess the Threat',
      '   from High Altitude Electromagnetic Pulse Attack)',
      '',
      'Carrington Event Analysis',
      '  (NASA, NOAA solar storm research)',
      '',
      'Electric Power Research Institute (EPRI)',
      '  -- Grid resilience studies',
    ],
    expanded: false,
  },
];

export default function EmpHazirlikPage() {
  const [steps, setSteps] = useState<GuideStep[]>(GUIDE_STEPS);

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">EMP / Sebeke Cokusu Rehberi / EMP &amp; Grid Collapse Guide</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Elektromanyetik darbe ve elektrik sebekesi cokusuna hazirlik
        </p>
      </div>

      {/* Critical Warning */}
      <Card className="border-red-700 bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-bold text-red-400">EMP GERCEK BIR TEHDIT / EMP IS A REAL THREAT</p>
              <p className="text-sm text-red-300 mt-1">
                2012'de guclu bir Gunes firtinasi (Carrington seviyesi) Dunya&apos;yi iskalatti. Bir dahaki sefere hazirliksiz yakalanmayin.
              </p>
              <p className="text-xs text-nomad-slate mt-2">
                A strong solar storm missed Earth in 2012. Don&apos;t be unprepared next time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Steps */}
      <div className="space-y-4">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <Card key={step.id} className="border-nomad-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-nomad-bg">
                      <Icon className="h-5 w-5 text-nomad-green" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription>{step.timeframe}</CardDescription>
                    </div>
                  </div>
                  <button onClick={() => toggleStep(step.id)} className="p-1 hover:bg-nomad-bg rounded transition-colors">
                    {step.expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                {!step.expanded && <p className="text-sm text-nomad-slate mt-1">{step.description}</p>}
              </CardHeader>

              {step.expanded && (
                <CardContent>
                  <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                      {step.steps.join('\n')}
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
