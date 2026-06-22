'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Heart, AlertTriangle, AlertCircle, Info, Thermometer, Droplets, Wind,
  Activity, Zap, Phone, ChevronDown, ChevronUp, Printer, BookOpen
} from 'lucide-react';

interface ConditionData {
  id: string;
  nameTr: string;
  nameEn: string;
  icon: React.ReactNode;
  dailyManagement: string[];
  emergencySteps: string[];
  warningSigns: string[];
  whenToCall112: string[];
  sources: string[];
  hypoglycemia?: { symptoms: string[]; treatment: string[] };
  hyperglycemia?: { symptoms: string[]; action: string[] };
  insulinStorage?: string[];
  hypertensiveCrisis?: string[];
  naturalBPReduction?: string[];
  inhalerSteps?: string[];
  triggerAvoidance?: string[];
  steamBreathing?: string;
  heartAttackSigns?: string[];
  immediateAction?: string[];
  cprBasics?: string[];
  seizureProtection?: string[];
  afterSeizure?: string[];
  seizureEmergency?: string[];
  allergenAvoidance?: string[];
  anaphylaxisRecognition?: string[];
  emergencyPosition?: string[];
}

const conditions: ConditionData[] = [
  {
    id: 'diabetes',
    nameTr: 'Diyabet (Diabetes)',
    nameEn: 'Diabetes',
    icon: <Droplets className="h-6 w-6 text-blue-400" />,
    dailyManagement: [
      'Kan şekerinizi düzenli ölçün (mümkünse günde 4 kez)',
      'İnsulin ve ilaçlarınızı düzenli kullanın',
      'Karbonhidrat alımınızı kontrol altında tutun',
      'Bol su için (günde en az 2 litre)',
      'Ayaklarınızı her gün kontrol edin',
      'Düzenli öğün atlama',
    ],
    emergencySteps: [
      'İnsulin biterse: Karbonhidrat alımını önemli ölçüde azaltın',
      'Kan şekerinizi mümkün olduğunca sık ölçün',
      'Sıvı alımını artırın (şekersiz içecekler)',
      'Fiziksel aktiviteyi sınırlayın',
      'Yakınınızda biri varsa durumunuzu bildirin',
      'İlaç yardım çağrılarını takip edin',
    ],
    warningSigns: [
      'Titreme, terleme, kafanın karışması, acıkma hissi (Hipoglisemi)',
      'Aşırı susama, sık idrara çıkma, bulantı (Hiperglisemi)',
      'Görüş bulanıklığı',
      'Halsizlik ve yorgunluk',
      'Nefeste meyve kokusu',
    ],
    whenToCall112: [
      'Bilinç kaybı veya konuşamama',
      'Nöbet geçirme',
      'Şiddetli kusma ve sıvı alamama',
      'Kan şekeri 300 mg/dL üzeri ve düşmüyorsa',
      'Kan şekeri 70 mg/dL altı ve düzelmiyorsa',
    ],
    sources: ['Sağlık Bakanlığı', 'UZEM', 'WHO - Diabetes Guidelines'],
    hypoglycemia: {
      symptoms: ['Titreme', 'Terleme', 'Hızlı kalp atışı', 'Kafanın karışması', 'Acıkma hissi', 'Baş dönmesi', 'Halsizlik'],
      treatment: ['15g hızlı karbonhidrat verin (yarım bardak meyve suyu, 1 yemek kaşığı bal/şeker, 3-4 şekerleme)', '15 dakika bekleyin, tekrar ölçün', '70 mg/dL altındaysa tekrar edin', 'Düzelene kadar her 15 dakikada tekrarlayın'],
    },
    hyperglycemia: {
      symptoms: ['Aşırı susama', 'Sık idrara çıkma', 'Bulanık görüş', 'Baş ağrısı', 'Bulantı', 'Halsizlik'],
      action: ['Bol su için', 'İnsulin dozunu kontrol edin', 'Fiziksel aktivite yapın (kan şekeri çok yüksek değilse)', 'Doktora danışın'],
    },
    insulinStorage: [
      'Buzdolabı yoksa: Serin, karanlık yerde saklayın',
      'Maksimum 25C sıcaklık',
      'Açıldıktan sonra 28 gün kullanılabilir',
      'Direkt güneş ışığından uzak tutun',
      'Aşırı soğuktan da koruyun (donma olmamalı)',
    ],
  },
  {
    id: 'hypertension',
    nameTr: 'Hipertansiyon (Yüksek Tansiyon)',
    nameEn: 'High Blood Pressure',
    icon: <Activity className="h-6 w-6 text-red-400" />,
    dailyManagement: [
      'Tuz tüketimini azaltın (günde 5g altında)',
      'Stresi yönetin, rahatlamaya zaman ayırın',
      'Düzenli fiziksel aktivite yapın',
      'Tansiyonunuzu düzenli ölçün',
      'Alkol ve sigaradan uzak durun',
      'İlaçlarınızı düzenli kullanın',
    ],
    emergencySteps: [
      'İlaç kesilirse: Tuz alımını önemli ölçüde azaltın',
      'Stresten uzak durun',
      'Baş yüksek yatarak dinlenin',
      'Derin nefes egzersizleri yapın',
      'Kafein alımını kesin',
    ],
    warningSigns: [
      'Şiddetli baş ağrısı',
      'Göğüs ağrısı',
      'Görüş değişiklikleri',
      'Nefes darlığı',
      'Burun kanaması',
      'Baş dönmesi ve sersemlik',
    ],
    whenToCall112: [
      'Göğüs ağrısı ile birlikte şiddetli baş ağrısı',
      'Görüş kaybı veya ciddi görüş bulanıklığı',
      'Konuşma bozukluğu',
      'Kol/bacakta kuvvet kaybı',
      'Tansiyon 180/120 üzeri ve semptomlar varsa',
    ],
    sources: ['Sağlık Bakanlığı', 'UZEM', 'WHO - Hypertension Guidelines'],
    hypertensiveCrisis: [
      'Tansiyon 180/120 üzeri -- acil durum!',
      'Hemen 112 yi arayın',
      'Sakin olun, yatın, baş yüksekte olsun',
      'Mümkünse tansiyon ilacı alın',
      'Yalnız bırakılmayın',
    ],
    naturalBPReduction: [
      'Derin nefes: 4 saniye nefes alın, 6 saniye verin, 5 dakika tekrarlayın',
      'Dinlenme: Sessiz, karanlık odada yatın',
      'Ilık duş: Kan damarlarını genişletir',
      'Papatya çayı: Hafif sakinleştirici etki',
    ],
  },
  {
    id: 'asthma',
    nameTr: 'Astım (Asthma)',
    nameEn: 'Asthma',
    icon: <Wind className="h-6 w-6 text-cyan-400" />,
    dailyManagement: [
      'İnhaler\'inizi her zaman yanınızda taşıyın',
      'Tetikleyicilerden uzak durun (toz, duman, soğuk hava)',
      'Düzenli kontrol ilaçlarını kullanın',
      'Nefes egzersizleri yapın',
      'Alerjenlerden kaçının',
    ],
    emergencySteps: [
      'İnhaler biterse: Dik oturun, yavaş derin nefes alın',
      'Sakin kalmaya çalışın -- panik nefes darlığını artırır',
      'Tetikleyicilerden uzaklaşın',
      'Sigara dumanı, toz, keskin koku ve soğuk havadan kaçının',
      'Buharlı nefes alma: Ilık su buharı ile nefes yolunu açın',
      'Yakınınızdan yardım isteyin',
    ],
    warningSigns: [
      'Nefes almada zorluk artışı',
      'Hırıltı veya wheezing sesi',
      'Göğüs sıkışıklığı',
      'Öksürük nöbetleri',
      'Konuşurken nefesin kesilmesi',
    ],
    whenToCall112: [
      'Dudaklarda morarma',
      'Konuşamama (cümle kuramama)',
      'Göğüs iç çekilmeleri (kaburgalar arası çekilme)',
      'İnhaler etkisiz kalıyorsa',
      'Bilinç bulanıklığı',
    ],
    sources: ['Sağlık Bakanlığı', 'UZEM', 'GINA - Global Initiative for Asthma'],
    inhalerSteps: [
      'İnhaler\'i sallayın (5 saniye)',
      'Ağzınıza yerleştirin, dudaklarınızı sıkın',
      'Nefes verin (inhaler\'i ağzınıza koyduktan sonra)',
      'İnhaler\'e basın ve aynı anda derin nefes alın',
      '10 saniye nefesinizi tutun',
      'Gerekirse 1 dakika bekleyip tekrar edin',
    ],
    triggerAvoidance: [
      'Barınak içinde: Tozlu alanlardan uzak durun',
      'Duman, sigara, mangal dumanından kaçının',
      'Keskin kokulu temizlik ürünleri kullanmayın',
      'Soğuk havada ağzı ve burnu örtün',
      'Toz akarlarına karşı maske takın',
    ],
    steamBreathing: 'Bir kap ılık suya başınızı eğip, üzerine havlu alarak 10-15 dakika buhar soluyun. Bu, nefes yollarını açmaya yardımcı olur.',
  },
  {
    id: 'heart-disease',
    nameTr: 'Kalp Hastalığı (Heart Disease)',
    nameEn: 'Heart Disease',
    icon: <Heart className="h-6 w-6 text-rose-400" />,
    dailyManagement: [
      'İlaçlarınızı düzenli kullanın',
      'Düşük tuzlu diyet uygulayın',
      'Stresi azaltın',
      'Hafif fiziksel aktivite yapın (doktor onayı ile)',
      'Kilonuzu takip edin',
      'Sigara ve alkolden uzak durun',
    ],
    emergencySteps: [
      'İlaçlar mevcut değilse: Dinlenin, düşük tuzlu diyet yapın, stresi azaltın',
      'Her türlü fiziksel aktiviteyi bırakın',
      'Yarı oturur pozisyonda dinlenin',
      'Dar elbiseleri gevşetin',
      'Temiz hava alın',
    ],
    warningSigns: [
      'Göğüs baskısı veya ağrısı',
      'Kol ağrısı (özellikle sol)',
      'Çene, boyun veya sırt ağrısı',
      'Terleme',
      'Bulantı',
      'Nefes darlığı',
      'Baş dönmesi',
    ],
    whenToCall112: [
      'Göğüs ağrısı 5 dakikadan fazla sürüyorsa',
      'Nefes alamama',
      'Bilinç kaybı',
      'Nabız çok hızlı veya çok yavaş ise',
      'Ani, şiddetli halsizlik',
    ],
    sources: ['Sağlık Bakanlığı', 'UZEM', 'WHO - Cardiovascular Guidelines'],
    heartAttackSigns: [
      'Göğüste baskı, sıkışma veya ağrı (fil oturuyormuş gibi)',
      'Sol kola yayılan ağrı',
      'Çene, boyun veya sırt ağrısı',
      'Soğuk terleme',
      'Bulantı veya kusma',
      'Nefes darlığı',
      'Ani baş dönmesi',
    ],
    immediateAction: [
      'HEMEN 112\'yi arayın',
      'Mevcutsa aspirin çiğneyin (300mg)',
      'Yarı oturur pozisyonda dinlenin',
      'Dar giysileri gevşetin',
      'Yalnız bırakılmayın',
      'Kapıyı açık bırakın (sağlık ekibi için)',
    ],
    cprBasics: [
      'Hareketsiz ve nefes almıyorsa: Hemen 112\'yi arayın',
      'Ellerinizi göğüs ortasına yerleştirin',
      'Dakikada 100-120 kez, 5-6 cm derinlikte basın',
      'Her bası hızlı ve güçlü olsun',
      'Göğüs her bası arasında tam olarak genişlesin',
      '30 bası, 2 kurtarma nefesi (eğitimliyseniz)',
      'Sağlık ekibi gelene kadar devam edin',
    ],
  },
  {
    id: 'epilepsy',
    nameTr: 'Epilepsi (Epilepsy)',
    nameEn: 'Epilepsy',
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    dailyManagement: [
      'İlaçlarınızı düzenli kullanın -- hiçbir zaman atlamayın',
      'Düzenli uyku uyuyun (7-9 saat)',
      'Stresi yönetin',
      'Alkol ve uyuşturucudan uzak durun',
      'Tetikleyicilerinizi bilin ve kaçının',
    ],
    emergencySteps: [
      'Nöbet sırasında: Başı koruyun, çevrede güvenliği sağlayın',
      'HİÇBİR ZAMAN hastayı tutmayın veya kısıtlamayın',
      'Ağzına HİÇBİR şey koymayın',
      'Çevredeki tehlikeli nesneleri uzaklaştırın',
      'Nöbeti zamana alın',
      'Yastık veya yumuşak bir şey başının altına koyun',
    ],
    warningSigns: [
      'Ani bakakalma, dalma',
      'Kas kasılmaları veya titremeler',
      'Geçici konuşma bozukluğu',
      'Görüş değişiklikleri',
      'Garip koku veya tat hissi',
    ],
    whenToCall112: [
      'Nöbet 5 dakikadan uzun sürüyorsa',
      'Nöbet bitince hasta uyanıyorsa',
      'Arka arkaya nöbet geçiriyorsa',
      'Nöbet sırasında yaralanma olursa',
      'İlk kez nöbet geçiriyorsa',
      'Hamile bir kadın ise',
    ],
    sources: ['Sağlık Bakanlığı', 'UZEM', 'ILAE - International League Against Epilepsy'],
    seizureProtection: [
      'Başını korumak için yumuşak nesne koyun',
      'Çevredeki keskin veya sert nesneleri uzaklaştırın',
      'Gözlük, saat gibi eşyalarını çıkarın',
      'Yaka ve kravatı gevşetin',
      'Etrafında güvenli bir alan oluşturun',
    ],
    afterSeizure: [
      'Hastayı yan çevirin (recovery position)',
      'Hastayla birlikte kalın, konuşun',
      'Nöbetin ne kadar sürdüğünü kaydedin',
      'Yaralanma var mı kontrol edin',
      'Tamamen uyanana kadar yalnız bırakmayın',
      'Dinlenmesine izin verin',
    ],
    seizureEmergency: [
      'Nöbet 5 dakikayı geçtiyse: 112\'yi arayın',
      'Arka arkaya nöbet geliyorsa: 112',
      'Hasta uyanmıyorsa: 112',
      'Nefes almıyorsa: 112 + CPR',
    ],
  },
  {
    id: 'allergies',
    nameTr: 'Alerji (Şiddetli Alerjiler)',
    nameEn: 'Severe Allergies',
    icon: <AlertCircle className="h-6 w-6 text-orange-400" />,
    dailyManagement: [
      'Alerjenlerinizi bilin ve kaçının',
      'EpiPen\'inizi her zaman yanınızda taşıyın',
      'Alerji bilgilerinizi herkesin bilmesini sağlayın',
      'Antihistaminik ilaçlarınızı yanınızda bulundurun',
      'Gıda etiketlerini dikkatlice okuyun',
    ],
    emergencySteps: [
      'EpiPen mevcut değilse: Alerjeni uzaklaştırın',
      'Mevcutsa antihistaminik verin',
      'Hastayı yatırın, bacakları yukarı kaldırın',
      'Dar giysileri gevşetin',
      'Yakınınızdan yardım isteyin',
    ],
    warningSigns: [
      'Şişme (yüz, dudak, dil, boğaz)',
      'Nefes almada zorluk',
      'Kızarıklık ve kurdeşen (hives)',
      'Baş dönmesi',
      'Hızlı veya zayıf nabız',
      'Bulantı veya kusma',
    ],
    whenToCall112: [
      'Nefes almada zorluk',
      'Dil veya boğazda şişme',
      'Bilinç kaybı',
      'Hızlı nabız ve düşük tansiyon',
      'Anafilaksi şüphesi -- HER ZAMAN 112\'yi arayın',
    ],
    sources: ['Sağlık Bakanlığı', 'UZEM', 'WAO - World Allergy Organization'],
    allergenAvoidance: [
      'Barınak içinde: Yiyecekleri kapalı kaplarda saklayın',
      'Tozlu alanlardan uzak durun',
      'Böcek ve haşere ilaçlarını dikkatli kullanın',
      'Gıda yardımlarının içeriğini kontrol edin',
      'İlaç yardımlarında alerji kontrolü yapın',
    ],
    anaphylaxisRecognition: [
      'Deride: Kızarıklık, kurdeşen, kaşıntı, şişme',
      'Solunum: Nefes darlığı, hırıltı, boğazda şişme hissi',
      'Dolaşım: Hızlı nabız, düşük tansiyon, baş dönmesi',
      'Sindirim: Bulantı, kusma, ishal, karın ağrısı',
      'NOT: Birden fazla sistem etkileniyorsa ANAFİLAKSİ -- HEMEN 112',
    ],
    emergencyPosition: [
      'Hastayı düz yatırın',
      'Bacakları 30-45 derece yukarı kaldırın',
      'Baş yan çevrilmiş olsun (kusma varsa)',
      'Nefes almakta zorlanıyorsa yarı oturur pozisyonda tutun',
      'Hastayı hareket ettirmeyin (gerekmedikçe)',
    ],
  },
];

export default function ChronicConditionPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('daily');

  useEffect(() => {
    if (typeof window !== 'undefined' && !expandedId) {
      const saved = localStorage.getItem('prepturk:chronicExpanded');
      if (saved) setExpandedId(saved);
    }
  }, []);

  const toggleCondition = (id: string) => {
    const newId = expandedId === id ? null : id;
    setExpandedId(newId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepturk:chronicExpanded', newId || '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-7 w-7 text-red-400" />
            Kronik Hastalık Acil Durum Planları
          </h1>
          <p className="text-nomad-slate text-sm">Chronic Condition Emergency Plans</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />
          Yazdır / Print
        </Button>
      </div>

      {/* Critical Disclaimer */}
      <Card className="border-red-700 bg-red-950/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300 text-lg">UYARI / WARNING</p>
              <p className="text-red-200 mt-1">
                Bu bilgiler acil durum içindir -- doktor tavsiyesi değildir.
              </p>
              <p className="text-red-200/70 text-sm">
                (This information is for emergency situations only -- it is not medical advice. Always consult a healthcare professional.)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-3 flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-nomad-green flex-shrink-0" />
          <span className="text-nomad-slate">
            Tüm bilgiler Sağlık Bakanlığı, UZEM ve WHO kılavuzlarına dayanmaktadır.
          </span>
        </CardContent>
      </Card>

      {/* Condition Cards */}
      <div className="space-y-3">
        {conditions.map((condition) => {
          const isExpanded = expandedId === condition.id;
          return (
            <Card key={condition.id} className="border-nomad-border overflow-hidden">
              <button
                onClick={() => toggleCondition(condition.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-nomad-border/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {condition.icon}
                  <div>
                    <h3 className="font-semibold text-foreground">{condition.nameTr}</h3>
                    <p className="text-xs text-nomad-slate">{condition.nameEn}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-nomad-slate" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-nomad-slate" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-nomad-border">
                  {/* Section Tabs */}
                  <div className="flex flex-wrap gap-1 p-3 bg-nomad-bg">
                    {[
                      { id: 'daily', label: 'Günlük Yönetim' },
                      { id: 'emergency', label: 'Acil Durum' },
                      { id: 'warning', label: 'Uyarı İşaretleri' },
                      { id: 'call112', label: '112 Ne Zaman' },
                    ].map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          activeSection === section.id
                            ? 'bg-nomad-green text-white'
                            : 'bg-nomad-surface text-nomad-slate hover:text-foreground'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {/* Daily Management */}
                    {activeSection === 'daily' && (
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                          <BookOpen className="h-4 w-4 text-nomad-green" />
                          Günlük Yönetim / Daily Management
                        </h4>
                        <ul className="space-y-2">
                          {condition.dailyManagement.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        {condition.insulinStorage && (
                          <div className="mt-4 p-3 bg-blue-950/30 border border-blue-800 rounded-lg">
                            <h5 className="font-semibold text-blue-300 text-sm mb-2">İnsulin Saklama / Insulin Storage</h5>
                            <ul className="space-y-1">
                              {condition.insulinStorage.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-blue-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.hypoglycemia && (
                          <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800 rounded-lg">
                            <h5 className="font-semibold text-amber-300 text-sm mb-2">Hipoglisemi (Düşük Kan Şekeri) / Hypoglycemia</h5>
                            <p className="text-xs text-amber-200 mb-1 font-medium">Belirtiler:</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {condition.hypoglycemia.symptoms.map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-amber-900/30 border-amber-700 text-amber-200">{s}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-amber-200 mb-1 font-medium">Tedavi:</p>
                            <ul className="space-y-1">
                              {condition.hypoglycemia.treatment.map((item, i) => (
                                <li key={i} className="text-sm text-amber-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.hyperglycemia && (
                          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                            <h5 className="font-semibold text-red-300 text-sm mb-2">Hiperglisemi (Yüksek Kan Şekeri) / Hyperglycemia</h5>
                            <p className="text-xs text-red-200 mb-1 font-medium">Belirtiler:</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {condition.hyperglycemia.symptoms.map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-red-900/30 border-red-700 text-red-200">{s}</Badge>
                              ))}
                            </div>
                            <ul className="space-y-1">
                              {condition.hyperglycemia.action.map((item, i) => (
                                <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.hypertensiveCrisis && (
                          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                            <h5 className="font-semibold text-red-300 text-sm mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Hipertansif Kriz / Hypertensive Crisis
                            </h5>
                            <ul className="space-y-1">
                              {condition.hypertensiveCrisis.map((item, i) => (
                                <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.naturalBPReduction && (
                          <div className="mt-4 p-3 bg-green-950/30 border border-green-800 rounded-lg">
                            <h5 className="font-semibold text-green-300 text-sm mb-2">Doğal Tansiyon Düşürme / Natural BP Reduction</h5>
                            <ul className="space-y-1">
                              {condition.naturalBPReduction.map((item, i) => (
                                <li key={i} className="text-sm text-green-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.steamBreathing && (
                          <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-800 rounded-lg">
                            <h5 className="font-semibold text-cyan-300 text-sm mb-2">Buharlı Nefes / Steam Breathing</h5>
                            <p className="text-sm text-cyan-200">{condition.steamBreathing}</p>
                          </div>
                        )}

                        {condition.inhalerSteps && (
                          <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-800 rounded-lg">
                            <h5 className="font-semibold text-cyan-300 text-sm mb-2">İnhaler Kullanım / Inhaler Usage Steps</h5>
                            <ol className="space-y-1">
                              {condition.inhalerSteps.map((item, i) => (
                                <li key={i} className="text-sm text-cyan-200 flex items-start gap-2">
                                  <span className="h-5 w-5 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {condition.cprBasics && (
                          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                            <h5 className="font-semibold text-red-300 text-sm mb-2">CPR Temelleri / CPR Basics</h5>
                            <ol className="space-y-1">
                              {condition.cprBasics.map((item, i) => (
                                <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                  <span className="h-5 w-5 rounded-full bg-red-900 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Emergency Steps */}
                    {activeSection === 'emergency' && (
                      <div>
                        <h4 className="font-semibold text-red-300 flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          Acil Durum Adımları / Emergency Steps
                        </h4>
                        <ol className="space-y-2">
                          {condition.emergencySteps.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <span className="h-6 w-6 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ol>

                        {condition.seizureProtection && (
                          <div className="mt-4 p-3 bg-yellow-950/30 border border-yellow-800 rounded-lg">
                            <h5 className="font-semibold text-yellow-300 text-sm mb-2">Nöbet Sırasında Koruma / During Seizure Protection</h5>
                            <ul className="space-y-1">
                              {condition.seizureProtection.map((item, i) => (
                                <li key={i} className="text-sm text-yellow-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.afterSeizure && (
                          <div className="mt-4 p-3 bg-green-950/30 border border-green-800 rounded-lg">
                            <h5 className="font-semibold text-green-300 text-sm mb-2">Nöbet Sonrası / After Seizure</h5>
                            <ul className="space-y-1">
                              {condition.afterSeizure.map((item, i) => (
                                <li key={i} className="text-sm text-green-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.seizureEmergency && (
                          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                            <h5 className="font-semibold text-red-300 text-sm mb-2 flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Nöbet Acil Durumları / Seizure Emergencies
                            </h5>
                            <ul className="space-y-1">
                              {condition.seizureEmergency.map((item, i) => (
                                <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.heartAttackSigns && (
                          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                            <h5 className="font-semibold text-red-300 text-sm mb-2">Kalp Krizi Belirtileri / Heart Attack Signs</h5>
                            <ul className="space-y-1">
                              {condition.heartAttackSigns.map((item, i) => (
                                <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.immediateAction && (
                          <div className="mt-4 p-3 bg-orange-950/30 border border-orange-800 rounded-lg">
                            <h5 className="font-semibold text-orange-300 text-sm mb-2">Anında Aksiyon / Immediate Action</h5>
                            <ol className="space-y-1">
                              {condition.immediateAction.map((item, i) => (
                                <li key={i} className="text-sm text-orange-200 flex items-start gap-2">
                                  <span className="h-5 w-5 rounded-full bg-orange-900 text-orange-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {condition.anaphylaxisRecognition && (
                          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                            <h5 className="font-semibold text-red-300 text-sm mb-2">Anafilaksi Tanımlama / Anaphylaxis Recognition</h5>
                            <ul className="space-y-1">
                              {condition.anaphylaxisRecognition.map((item, i) => (
                                <li key={i} className="text-sm text-red-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.emergencyPosition && (
                          <div className="mt-4 p-3 bg-green-950/30 border border-green-800 rounded-lg">
                            <h5 className="font-semibold text-green-300 text-sm mb-2">Acil Durum Pozisyonu / Emergency Position</h5>
                            <ol className="space-y-1">
                              {condition.emergencyPosition.map((item, i) => (
                                <li key={i} className="text-sm text-green-200 flex items-start gap-2">
                                  <span className="h-5 w-5 rounded-full bg-green-900 text-green-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {condition.triggerAvoidance && (
                          <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <h5 className="font-semibold text-gray-300 text-sm mb-2">Tetikleyicilerden Kaçınma / Trigger Avoidance</h5>
                            <ul className="space-y-1">
                              {condition.triggerAvoidance.map((item, i) => (
                                <li key={i} className="text-sm text-gray-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {condition.allergenAvoidance && (
                          <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <h5 className="font-semibold text-gray-300 text-sm mb-2">Alerjenden Kaçınma / Allergen Avoidance</h5>
                            <ul className="space-y-1">
                              {condition.allergenAvoidance.map((item, i) => (
                                <li key={i} className="text-sm text-gray-200 flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Warning Signs */}
                    {activeSection === 'warning' && (
                      <div>
                        <h4 className="font-semibold text-amber-300 flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4" />
                          Uyarı İşaretleri / Warning Signs
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {condition.warningSigns.map((sign, i) => (
                            <Badge key={i} className="bg-amber-900/40 text-amber-200 border-amber-700 text-sm py-1.5 px-3">
                              {sign}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* When to Call 112 */}
                    {activeSection === 'call112' && (
                      <div>
                        <h4 className="font-semibold text-red-300 flex items-center gap-2 mb-3">
                          <Phone className="h-4 w-4" />
                          112 Ne Zaman Aranmalı / When to Call 112
                        </h4>
                        <div className="p-4 bg-red-950/40 border border-red-700 rounded-lg">
                          <p className="text-2xl font-bold text-red-300 text-center mb-4">112</p>
                          <ul className="space-y-2">
                            {condition.whenToCall112.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    <div className="pt-2 border-t border-nomad-border">
                      <p className="text-xs text-nomad-slate flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        Kaynaklar: {condition.sources.join(', ')}
                      </p>
                    </div>
                  </CardContent>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom Disclaimer */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-nomad-slate">
            Bu bilgiler resmi tıbbi rehberlerden derlenmiştir. Acil durumlarda her zaman önce 112'yi arayın.
          </p>
          <p className="text-xs text-nomad-slate mt-1">
            Information compiled from official medical guidelines. In emergencies, always call 112 first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
