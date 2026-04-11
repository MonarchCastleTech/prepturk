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
      'Kan sekerinizi duzenli olcun (mumkunse gunde 4 kez)',
      'Insulin ve ilaclarinizi duzenli kullanin',
      'Karbonhidrat aliminizi kontrol altinda tutun',
      'Bol su icin (gunde en az 2 litre)',
      'Ayaklarinizi her gun kontrol edin',
      'Duzenli ogun atlama',
    ],
    emergencySteps: [
      'Insulin bitirse: Karbonhidrat alimini onemli olcude azaltin',
      'Kan sekerinizi mumkun oldugunca sik olcun',
      'Sivi alimini artirin (sekersiz icecekler)',
      'Fiziksel aktiviteyi sinirlayin',
      'Yakininzda biri varsa durumunuzu bildirin',
      'Ilac yardim cagrilarini takip edin',
    ],
    warningSigns: [
      'Titreme, terleme, kafanin karismasi, acikma hissi (Hipoglisemi)',
      'Asiri susama, sik idrara cikma, bulanti (Hiperglisemi)',
      'Gorus bulanikligi',
      'Halsizlik ve yorgunluk',
      'Nefeste meyve kokusu',
    ],
    whenToCall112: [
      'Bilinc kaybi veya konusamama',
      'Nobet gecirme',
      'Siddetli kusma ve sivi alamama',
      'Kan sekeri 300 mg/dL uzeri ve dusmuyorsa',
      'Kan sekeri 70 mg/dL alti ve duzelmiyorsa',
    ],
    sources: ['Saglik Bakanligi', 'UZEM', 'WHO - Diabetes Guidelines'],
    hypoglycemia: {
      symptoms: ['Titreme', 'Terleme', 'Hizli kalp atisi', 'Kafanin karismasi', 'Acikma hissi', 'Bas donmesi', 'Halsizlik'],
      treatment: ['15g hizli karbonhidrat verin (yarim bardak meyve suyu, 1 yemek kasigi bal/seker, 3-4 sekerleme)', '15 dakika bekleyin, tekrar olcun', '70 mg/dL altindaysa tekrar edin', 'Duzele kadar her 15 dakikada tekrarlayin'],
    },
    hyperglycemia: {
      symptoms: ['Asiri susama', 'Sik idrara cikma', 'Bulanik gorus', 'Bas agrisi', 'Bulantı', 'Halsizlik'],
      action: ['Bol su icin', 'Insulin dozunu kontrol edin', 'Fiziksel aktivite yapin (kan sekeri cok yuksek degilse)', 'Doktora danisin'],
    },
    insulinStorage: [
      'Buzdolabi yoksa: Serin, karanlik yerde saklayin',
      'Maksimum 25C sicaklik',
      'Acildiktan sonra 28 gun kullanilabilir',
      'Direkt gunes isigindan uzak tutun',
      'Asiri soguktan da koruyun (donme olmamali)',
    ],
  },
  {
    id: 'hypertension',
    nameTr: 'Hipertansiyon (Yuksek Tansiyon)',
    nameEn: 'High Blood Pressure',
    icon: <Activity className="h-6 w-6 text-red-400" />,
    dailyManagement: [
      'Tuz tuketimini azaltin (gunde 5g altinda)',
      'Stresi yonetin, rahatlamaya zaman ayirin',
      'Duzenli fiziksel aktivite yapin',
      'Tansiyonunuzu duzenli olcun',
      'Alkol ve sigaradan uzak durun',
      'Ilaclarinizi duzenli kullanin',
    ],
    emergencySteps: [
      'Ilac kesilirse: Tuz alimini onemli olcude azaltin',
      'Stresten uzak durun',
      'Bas yuksek yatarak dinlenin',
      'Derin nefes egzersizleri yapin',
      'Kafein alimini kesin',
    ],
    warningSigns: [
      'Siddetli bas agrisi',
      'Gogus agrisi',
      'Gorus degisiklikleri',
      'Nefes darligi',
      'Burun kanamasi',
      'Bas donmesi ve sersemlik',
    ],
    whenToCall112: [
      'Gogus agrisi ile birlikte siddetli bas agrisi',
      'Gorus kaybi veya ciddi gorus bulanikligi',
      'Konusma bozuklugu',
      'Kol/bacakta kuvvet kaybi',
      'Tansiyon 180/120 uzeri ve semptomlar varsa',
    ],
    sources: ['Saglik Bakanligi', 'UZEM', 'WHO - Hypertension Guidelines'],
    hypertensiveCrisis: [
      'Tansiyon 180/120 uzeri -- acil durum!',
      'Hemen 112 yi arayin',
      'Sakin olun, yatin, bas yuksekte olsun',
      'Mumkunse tansiyon ilaci alin',
      'Yalniz birakilmayin',
    ],
    naturalBPReduction: [
      'Derin nefes: 4 saniye nefes alin, 6 saniye verin, 5 dakika tekrarlayin',
      'Dinlenme: Sessiz, karanlik odada yatin',
      'Ilık duş: Kan damarlarini genisletir',
      'Papatya cayi: Hafif sakinlastirici etki',
    ],
  },
  {
    id: 'asthma',
    nameTr: 'Astım (Asthma)',
    nameEn: 'Asthma',
    icon: <Wind className="h-6 w-6 text-cyan-400" />,
    dailyManagement: [
      'Inhaler\'inizi her zaman yaninizda tasıyın',
      'Tetikleyicilerden uzak durun (toz, duman, soguk hava)',
      'Duzenli kontrol ilaclarini kullanin',
      'Nefes egzersizleri yapin',
      'Alerjenlerden kacinin',
    ],
    emergencySteps: [
      'Inhaler bitirse: Dik oturun, yavas derin nefes alin',
      'Sakin kalmaya calisin -- panik nefes darligini artirir',
      'Tetikleyicilerden uzaklasin',
      'Sigara dumanı, toz, keskin koku ve soguk havadan kacinin',
      'Buharlı nefes alma: Ilık su buhari ile nefes yolunu acin',
      'Yakininizdan yardim isteyin',
    ],
    warningSigns: [
      'Nefes almada zorluk artisi',
      'Hirilti veya wheezing sesi',
      'Gogus sikisikligi',
      'Oksuruk nobetleri',
      'Konusurken nefesin kesilmesi',
    ],
    whenToCall112: [
      'Dudaklarda morarma',
      'Konusamama (cumle kuramama)',
      'Gogus ic cekilmeleri (kaburgalar arasi cekilme)',
      'Inhaler etkisiz kaliyorsa',
      'Bilinc bulanikligi',
    ],
    sources: ['Saglik Bakanligi', 'UZEM', 'GINA - Global Initiative for Asthma'],
    inhalerSteps: [
      'Inhaler\'i sallayin (5 saniye)',
      'Agziniza yerlestirin, dudaklarinizi sikin',
      'Nefes verin (inhaler\'i agziniza koyduktan sonra)',
      'Inhaler\'e basin ve ayni anda derin nefes alin',
      '10 saniye nefesinizi tutun',
      'Gerekirse 1 dakika bekleyip tekrar edin',
    ],
    triggerAvoidance: [
      'Barinak icinde: Tozlu alanlardan uzak durun',
      'Duman, sigara, mangal dumanindan kacinin',
      'Keskin kokulu temizlik urunleri kullanmayin',
      'Soguk havada agzi ve burnu ortun',
      'Toz akarlarina karsi maske takin',
    ],
    steamBreathing: 'Bir kap ilık suya basinizi egip, uzerine havlu alarak 10-15 dakika buhar soluyun. Bu, nefes yollarini acmaya yardimci olur.',
  },
  {
    id: 'heart-disease',
    nameTr: 'Kalp Hastaligi (Heart Disease)',
    nameEn: 'Heart Disease',
    icon: <Heart className="h-6 w-6 text-rose-400" />,
    dailyManagement: [
      'Ilaclarinizi duzenli kullanin',
      'Dusuk tuzlu diyet uygulayin',
      'Stresi azaltin',
      'Hafif fiziksel aktivite yapin (doktor onayi ile)',
      'Kilonuzu takip edin',
      'Sigara ve alkolden uzak durun',
    ],
    emergencySteps: [
      'Ilaclar mevcut degilse: Dinlenin, dusuk tuzlu diyet yapin, stresi azaltin',
      'Her turlu fiziksel aktiviteyi birakin',
      'Yari oturur pozisyonda dinlenin',
      'Dar elbiseleri gevsetin',
      'Temiz hava alin',
    ],
    warningSigns: [
      'Gogus baskisi veya agrisi',
      'Kol agrisi (ozellikle sol)',
      'Cene, boyun veya sirt agrisi',
      'Terleme',
      'Bulantı',
      'Nefes darligi',
      'Bas donmesi',
    ],
    whenToCall112: [
      'Gogus agrisi 5 dakikadan fazla suruyorsa',
      'Nefes alamama',
      'Bilinc kaybi',
      'Nabiz cok hizli veya cok yavas ise',
      'Ani, siddetli halsizlik',
    ],
    sources: ['Saglik Bakanligi', 'UZEM', 'WHO - Cardiovascular Guidelines'],
    heartAttackSigns: [
      'Goguste baski, sikisma veya agri (fil oturuyormus gibi)',
      'Sol kola yayilan agri',
      'Cene, boyun veya sirt agrisi',
      'Soguk terleme',
      'Bulantı veya kusma',
      'Nefes darligi',
      'Ani bas donmesi',
    ],
    immediateAction: [
      'HEMEN 112\'yi arayin',
      'Mevcutsa aspirin cigneyin (300mg)',
      'Yari oturur pozisyonda dinlenin',
      'Dar giysileri gevsetin',
      'Yalniz birakilmayin',
      'Kapıyı acik birakin (saglik ekibi icin)',
    ],
    cprBasics: [
      'Hareketsiz ve nefes almıyorsa: Hemen 112\'yi arayin',
      'Ellerinizi gogus ortasina yerlestirin',
      'Dakikada 100-120 kez, 5-6 cm derinlikte basin',
      'Her basin hizli ve guclu olsun',
      'Gogus her basin arasinda tam olarak genislesin',
      '30 basin, 2 kurtarma nefesi (egitimliyseniz)',
      'Saglik ekibi gelene kadar devam edin',
    ],
  },
  {
    id: 'epilepsy',
    nameTr: 'Epilepsi (Epilepsy)',
    nameEn: 'Epilepsy',
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    dailyManagement: [
      'Ilaclarinizi duzenli kullanin -- hicbir zaman atlamayin',
      'Duzenli uyku uyuyun (7-9 saat)',
      'Stresi yonetin',
      'Alkol ve uyusturucudan uzak durun',
      'Tetikleyicilerinizi bilin ve kacinin',
    ],
    emergencySteps: [
      'Nobet sirasinda: Bası koruyun, cevrede guvenligi saglayin',
      'HICBIR ZAMAN hastayi tutmayin veya kisitlamayin',
      'Agzina HICBIR sey koymayin',
      'Cevredeki tehlikeli nesneleri uzaklastirin',
      'Nobeti zamana alin',
      'Yastik veya yumusak bir sey basinin altina koyun',
    ],
    warningSigns: [
      'Ani bakakalma, dalma',
      'Kas kasilmalari veya titremeler',
      'Gecici konusma bozuklugu',
      'Gorus degisiklikleri',
      'Gari koku veya tat hissi',
    ],
    whenToCall112: [
      'Nobet 5 dakikadan uzun suruyorsa',
      'Nobet bitince hasta uyaniyorsa',
      'Arka arkaya nobet geciriyorsa',
      'Nobet sirasinda yaralanma olursa',
      'Ilk kez nobet geciriyorsa',
      'Hamil bir kadin ise',
    ],
    sources: ['Saglik Bakanligi', 'UZEM', 'ILAE - International League Against Epilepsy'],
    seizureProtection: [
      'Basini korumak icin yumusak nesne koyun',
      'Cevredeki keskin veya sert nesneleri uzaklastirin',
      'Gozluk, saat gibi esyalarini cikarin',
      'Yaka ve kravatı gevsetin',
      'Etrafinda guvenli bir alan olusturun',
    ],
    afterSeizure: [
      'Hastayi yan cevirin (recovery position)',
      'Hastayla birlikte kalın, konusun',
      'Nobetin ne kadar surdugunu kaydedin',
      'Yaralanma var mi kontrol edin',
      'Tamamen uyaniyana kadar yalniz birakmayin',
      'Dinlenmesine izin verin',
    ],
    seizureEmergency: [
      'Nobet 5 dakikayi gectiyse: 112\'yi arayin',
      'Arka arkaya nobet geliyorsa: 112',
      'Hasta uyanmiyorsa: 112',
      'Nefes almıyorsa: 112 + CPR',
    ],
  },
  {
    id: 'allergies',
    nameTr: 'Alerji (Siddetli Alerjiler)',
    nameEn: 'Severe Allergies',
    icon: <AlertCircle className="h-6 w-6 text-orange-400" />,
    dailyManagement: [
      'Alerjenlerinizi bilin ve kacinin',
      'EpiPen\'inizi her zaman yaninizda tasıyın',
      'Alerji bilgilerinizi herkesin bilmesini saglayın',
      'Antihistaminik ilaclarinizi yaninizda bulundurun',
      'Gida etiketlerini dikkatlice okuyun',
    ],
    emergencySteps: [
      'EpiPen mevcut degilse: Alerjeni uzaklastirin',
      'Mevcutsa antihistaminik verin',
      'Hastayi yatin, bacaklari yukari kaldirin',
      'Dar giysileri gevsetin',
      'Yakininizdan yardim isteyin',
    ],
    warningSigns: [
      'Sisme (yuz, dudak, dil, bogaz)',
      'Nefes almada zorluk',
      'Kizariklik ve kurdesen (hives)',
      'Bas donmesi',
      'Hizli veya zayif nabiz',
      'Bulantı veya kusma',
    ],
    whenToCall112: [
      'Nefes almada zorluk',
      'Dil veya bogazda sisme',
      'Bilinc kaybi',
      'Hizli nabiz ve dusuk tansiyon',
      'Anafilaksi suphesi -- HER ZAMAN 112\'yi arayin',
    ],
    sources: ['Saglik Bakanligi', 'UZEM', 'WAO - World Allergy Organization'],
    allergenAvoidance: [
      'Barinak icinde: Yiyecekleri kapalı kaplarda saklayın',
      'Tozlu alanlardan uzak durun',
      'Bocek ve haşere ilaclarini dikkatli kullanın',
      'Gida yardimlarinin icerigini kontrol edin',
      'Ilac yardimlarinda alerji kontrolu yapin',
    ],
    anaphylaxisRecognition: [
      'Deride: Kizariklik, kurdesen, kasinti, sisme',
      'Solum: Nefes darligi, hirlti, bogazda sisme hissi',
      'Dolasim: Hizli nabiz, dusuk tansiyon, bas donmesi',
      'Sindirim: Bulantı, kusma, ishal, karin agrisi',
      'NOT: Birden fazla sistem etkileniyorsa ANAFILAKSI -- HEMEN 112',
    ],
    emergencyPosition: [
      'Hastayi duz yatin',
      'Bacaklari 30-45 derece yukari kaldirin',
      'Bas yan cevrilmis olsun (kusma varsa)',
      'Nefes almakta zorlaniyorsa yari oturur pozisyonda tutun',
      'Hastayi hareket ettirmeyin (gerekmedikce)',
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
            Kronik Hastalik Acil Durum Planlari
          </h1>
          <p className="text-nomad-slate text-sm">Chronic Condition Emergency Plans</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />
          Yazdir / Print
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
                Bu bilgiler acil durum icindir -- doktor tavsiyesi degildir.
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
            Tum bilgiler Saglik Bakanligi, UZEM ve WHO kilavuzlarina dayanmaktadir.
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
                      { id: 'warning', label: 'Uyari Isaretleri' },
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
                            <h5 className="font-semibold text-blue-300 text-sm mb-2">Insulin Saklama / Insulin Storage</h5>
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
                            <h5 className="font-semibold text-amber-300 text-sm mb-2">Hipoglisemi (Dusuk Kan Sekeri) / Hypoglycemia</h5>
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
                            <h5 className="font-semibold text-red-300 text-sm mb-2">Hiperglisemi (Yuksek Kan Sekeri) / Hyperglycemia</h5>
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
                            <h5 className="font-semibold text-green-300 text-sm mb-2">Dogal Tansiyon Düsürme / Natural BP Reduction</h5>
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
                            <h5 className="font-semibold text-cyan-300 text-sm mb-2">Buharli Nefes / Steam Breathing</h5>
                            <p className="text-sm text-cyan-200">{condition.steamBreathing}</p>
                          </div>
                        )}

                        {condition.inhalerSteps && (
                          <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-800 rounded-lg">
                            <h5 className="font-semibold text-cyan-300 text-sm mb-2">Inhaler Kullanim / Inhaler Usage Steps</h5>
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
                          Acil Durum Adimlari / Emergency Steps
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
                            <h5 className="font-semibold text-yellow-300 text-sm mb-2">Nobet Sirasinda Koruma / During Seizure Protection</h5>
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
                            <h5 className="font-semibold text-green-300 text-sm mb-2">Nobet Sonrasi / After Seizure</h5>
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
                              Nobet Acil Durumlari / Seizure Emergencies
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
                            <h5 className="font-semibold text-orange-300 text-sm mb-2">Aninda Aksiyon / Immediate Action</h5>
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
                            <h5 className="font-semibold text-red-300 text-sm mb-2">Anafilaksi Tanimlama / Anaphylaxis Recognition</h5>
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
                            <h5 className="font-semibold text-gray-300 text-sm mb-2">Tetikleyicilerden Kacinma / Trigger Avoidance</h5>
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
                            <h5 className="font-semibold text-gray-300 text-sm mb-2">Alerjenden Kacinma / Allergen Avoidance</h5>
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
                          Uyari Isaretleri / Warning Signs
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
                          112 Ne Zaman Aranmali / When to Call 112
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
            Bu bilgiler resmi tibbi rehberlerden derlenmistir. Acil durumlarda her zaman once 112'yi arayin.
          </p>
          <p className="text-xs text-nomad-slate mt-1">
            Information compiled from official medical guidelines. In emergencies, always call 112 first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
