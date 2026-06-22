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
    description: 'Elektromanyetik Darbe (EMP), elektronik cihazlara zarar veren güçlü bir elektromanyetik alandır.',
    steps: [
      'EMP (Electromagnetic Pulse) = Elektromanyetik Darbe',
      '',
      'DOĞAL NEDENLER (Natural Causes):',
      '  - Güneş fırtınası / Solar flare (Carrington Olayı 1859)',
      '  - Koronal Kütle Atımı / Coronal Mass Ejection (CME)',
      '  - 1859 Carrington Olayı: Telgraf sistemleri çalışmadı, kağıtlar tutuştu',
      '  - 1989 Quebec: Güneş fırtınası sonucu 9 saat elektrik kesintisi',
      '  - 2012: Güçlü CME Dünyayı ıskalattı -- tekrar olabilir',
      '',
      'YAPAY NEDENLER (Artificial Causes):',
      '  - Yüksek irtifa nükleer patlama (HEMP)',
      '  - 30-400 km yükseklikte nükleer patlama',
      '  - Tüm bölgedeki elektronik cihazlara zarar verir',
      '  - Elektromanyetik silahlar (E-bomb)',
      '',
      'Etki alanı: Yüzlerce kilometre çap',
    ],
    expanded: false,
  },
  {
    id: 'what-happens', title: 'Ne Olur? / What Happens?', titleEn: 'Effects',
    icon: AlertTriangle, timeframe: 'Etkiler / Effects',
    description: 'EMP sonucu elektronik cihazlar hasar görür veya tamamen yok olur.',
    steps: [
      'ELEKTRONİK HASARI (Electronics Damage):',
      '  - Tüm entegre devreler hasar görür',
      '  - Bilgisayarlar, telefonlar, tabletler çalışmaz',
      '  - Araçların elektronik sistemleri devre dışı kalır',
      '  - 1980 öncesi araçlar (karbüratörlü) çalışmaya devam edebilir',
      '',
      'ŞEBEKE ARIZASI (Grid Failure):',
      '  - Elektrik santralleri devre dışı kalır',
      '  - Transformatörler yanar (yedek bulmak aylar alır)',
      '  - Elektrik dağıtım sistemi çöker',
      '',
      'İLETİŞİM KAYBI (Communication Loss):',
      '  - Cep telefonu şebekesi çalışmaz',
      '  - İnternet erişimi yok',
      '  - Radyo/TV vericileri hasar görür',
      '  - El tipi radyolar (pil ile) çalışmaya devam edebilir',
      '',
      'ULAŞIM BOZULMASI (Transportation Disruption):',
      '  - Modern araçlar çalışmaz (ECU hasar)',
      '  - Trafik ışıkları çalışmaz',
      '  - Uçaklar iniş yapmaya zorlanır',
      '  - Bisiklet, yürüyüş, at arabası önemli hale gelir',
    ],
    expanded: false,
  },
  {
    id: 'first-hour', title: 'İlk Saat / First Hour', titleEn: 'First Hour',
    icon: AlertCircle, timeframe: '0-1 saat / 0-1 hour',
    description: 'İlk saatte yapılması gereken kritik adımlar.',
    steps: [
      '1. Hassas elektronik cihazların fişlerini çekin',
      '   (Unplug sensitive electronics)',
      '',
      '2. Kritik cihazları Faraday kafesine taşıyın:',
      '   - Metal çöp kovası (iç yalıtımlı)',
      '   - Alüminyum folyo sarımı (3-4 kat)',
      '   - Mikrodalga fırın (ÇALIŞMADIKÇA korur)',
      '   - Anti-statik torbalar',
      '',
      '3. Hasarı değerlendirin:',
      '   - Elektrik var mı?',
      '   - Telefon çalışıyor mu?',
      '   - Musluk suyu akıyor mu?',
      '   - Doğal gaz çalışıyor mu?',
      '',
      '4. Aile üyelerini kontrol edin',
      '5. Komşuları kontrol edin',
      '6. Pil radyosunu açın -- resmi duyuruları dinleyin',
    ],
    expanded: false,
  },
  {
    id: 'first-24h', title: 'İlk 24 Saat / First 24 Hours', titleEn: 'First 24 Hours',
    icon: Clock, timeframe: '1-24 saat / 1-24 hours',
    description: 'İlk 24 saatte yapılması gereken önemli hazırlıklar.',
    steps: [
      '1. SU KAYNAĞINI GÜVENCE ALTINA ALIN:',
      '   - Musluk suyu hâlâ akıyorsa -- tüm kapları doldurun',
      '   - Su ısıtıcı tankını kontrol edin (50-150L)',
      '   - Klozet tanklarını kontrol edin (içme suyu değil)',
      '',
      '2. GIDA ENVANTERİ YAPIN:',
      '   - Mevcut gıda stoklarınızı sayın',
      '   - Bozulmayan gıdaları önce tüketin',
      '   - Rasyon planı yapın (günde en az 2000 kalori)',
      '',
      '3. KOMŞULARI KONTROL EDİN:',
      '   - Yaşlılar ve engellilere yardım edin',
      '   - Topluluk organizasyonu başlatın',
      '   - Yetenekleri belirleyin (doktor, hemşire, vs.)',
      '',
      '4. RESMİ DUYURULARI DİNLEYİN:',
      '   - Pil radyosu ile haber takibi',
      '   - AFAD duyuruları için radyo frekanslarını dinleyin',
      '   - Bilgi yayılması için elçi sistemi kurun',
      '',
      '5. GÜVENLİK ÖNLEMLERİ:',
      '   - Kapı ve pencereleri güvenliğe alın',
      '   - Aydınlatma için mum/el feneri hazırlayın',
      '   - İlkyardım çantasını kontrol edin',
    ],
    expanded: false,
  },
  {
    id: 'long-term', title: 'Uzun Vadeli Uyum / Long-term Adaptation', titleEn: 'Long-term',
    icon: Lightbulb, timeframe: '1 haftadan fazla / 1+ weeks',
    description: 'Elektriksiz hayata uyum için uzun vadeli stratejiler.',
    steps: [
      'MANUEL ALTERNATİFLER (Manual Alternatives):',
      '  - El krankı radyo ve fener',
      '  - Manuel konserve açacağı',
      '  - El ile su pompası',
      '  - Manuel öğütücü (kahve/baharat)',
      '  - El dikiş makinesi',
      '',
      'MEKANİK SAAT vs DİJİTAL (Mechanical vs Digital):',
      '  - Mekanik saatler EMP den etkilenmez',
      '  - Dijital saatler çalışmaz',
      '  - Kurmalı veya otomatik saat edin',
      '  - Güneş saati yapabilirsiniz (basit)',
      '',
      'ELEKTRİKSİZ ULAŞIM (Non-electric Transport):',
      '  - Bisiklet -- en değerli ulaşım aracı',
      '  - Yürüyüş -- ayakkabı önemli',
      '  - At arabası (kırsal alanlar için)',
      '  - Kayak/kızak (kış için)',
      '',
      'ELEKTRİKSİZ GIDA ÜRETİMİ (Food Without Electricity):',
      '  - Bahçe üretimi (mevsime bağlı)',
      '  - Konserve (kavanozla)',
      '  - Kurutma (güneşle)',
      '  - Tuzlama ve fermentasyon',
      '  - Mangal/ateş üstü pişirme',
      '',
      'TELEFONSUZ/İNTERNETSİZ TOPLULUK (Community Without Phones):',
      '  - Mahalle organizasyonu',
      '  - Elçi sistemi (mesaj taşıyıcıları)',
      '  - Belirli buluşma noktaları ve saatleri',
      '  - Bayrak/ışık sinyalleri',
      '  - Duyuru panoları (fiziksel)',
    ],
    expanded: false,
  },
  {
    id: 'timeline', title: 'Gerçekçi Zaman Çizelgesi / Realistic Timeline', titleEn: 'Timeline',
    icon: Clock, timeframe: 'Haftalar-Aylar / Weeks-Months',
    description: 'Elektrik şebekesinin onarımı haftalar ila aylar alabilir.',
    steps: [
      'İLK 48 SAAT:',
      '  - Çoğu insan durumun farkında değil',
      '  - Marketler boşalmaya başlar',
      '  - Nakit para hâlâ geçerli (ATM çalışmıyor)',
      '',
      '1 HAFTA:',
      '  - Gıda ve su kıtlığı başlar',
      '  - Hükümet yardımı organize olmaya başlar',
      '  - Toplum paniği artabilir',
      '',
      '2-4 HAFTA:',
      '  - Bölgesel yardım ulaşmaya başlar',
      '  - Geçici elektrik (jeneratörler)',
      '  - Su ve gıda dağıtımı organize edilir',
      '',
      '1-3 AY:',
      '  - Temiz elektriği kademeli olarak döner',
      '  - Transformatör değişimleri devam eder',
      '  - Toplum organizasyonu güçlenir',
      '',
      '3-6 AY:',
      '  - Çoğu bölgede elektrik dönmüş olmalıdır',
      '  - Ekonomi toparlanmaya başlar',
      '  - Yeni önlemler alınmaya başlar',
      '',
      'Kaynak: FEMA, UK National Risk Register, AFAD enerji acil durum planları',
    ],
    expanded: false,
  },
  {
    id: 'faraday', title: 'Faraday Kafesi Yapımı / Faraday Cage', titleEn: 'Faraday Cage',
    icon: Shield, timeframe: 'Hazırlık / Preparation',
    description: 'Elektronik cihazları EMP den korumak için Faraday kafesi yapımı.',
    steps: [
      'METAL ÇÖP KOVASI YÖNTEMİ:',
      '  1. Metal (galvanizli) çöp kovası alın',
      '  2. İçini karton veya kumaşla kaplayın (yalıtım)',
      '  3. Cihazı küçük bir anti-statik torbaya koyun',
      '  4. Torbayı kovanın içine yerleştirin',
      '  5. Kapağı sıkıca kapatın',
      '  6. Kova ile metal yüzey temas etmemeli',
      '',
      'ALÜMİNYUM FOLYO YÖNTEMİ:',
      '  1. Cihazı önce kağıt veya kumaşa sarın',
      '  2. Üzerine alüminyum folyo sarın (3-4 kat)',
      '  3. Her kat arasında temas olmamalı',
      '  4. Folyo tamamen kaplamalı (delik olmamalı)',
      '',
      'TEST ETME:',
      '  - İçinde çalışan bir radyo ile test edin',
      '  - Sinyal kesilmeli (statik olmalı)',
      '  - Sinyal alıyorsanız kafes ÇALIŞMIYOR demektir',
      '',
      'ÖNEMLİ:',
      '  - Metal kutu İLE yalıtım arasında BOŞLUK olmalı',
      '  - Cihaz metal yüzeye DOĞRUDAN değmemeli',
      '  - Kapak tamamen kapanmalı',
    ],
    expanded: false,
  },
  {
    id: 'sources', title: 'Kaynaklar / Sources', titleEn: 'Sources',
    icon: BookOpen, timeframe: 'Referanslar / References',
    description: 'Bu rehberin hazırlanmasında kullanılan kaynaklar.',
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
        <h1 className="text-2xl font-bold">EMP / Şebeke Çöküşü Rehberi / EMP &amp; Grid Collapse Guide</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Elektromanyetik darbe ve elektrik şebekesi çöküşüne hazırlık
        </p>
      </div>

      {/* Critical Warning */}
      <Card className="border-red-700 bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-bold text-red-400">EMP GERÇEK BİR TEHDİT / EMP IS A REAL THREAT</p>
              <p className="text-sm text-red-300 mt-1">
                2012'de güçlü bir Güneş fırtınası (Carrington seviyesi) Dünya&apos;yı ıskalattı. Bir dahaki sefere hazırlıksız yakalanmayın.
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
