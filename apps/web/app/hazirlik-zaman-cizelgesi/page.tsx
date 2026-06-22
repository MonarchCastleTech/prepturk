'use client';

import { useState } from 'react';
import {
  Clock,
  Droplets,
  Utensils,
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Printer,
  Phone,
  Zap,
  Shield,
  Users,
  Leaf,
  Heart,
  BookOpen,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  textEn: string;
}

interface PhaseData {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  icon: typeof Clock;
  iconColor: string;
  items: {
    heading: string;
    headingEn: string;
    points: string[];
    pointsEn: string[];
    warnings?: string[];
    warningsEn?: string[];
    checklist: ChecklistItem[];
  }[];
}

const STORAGE_KEY = 'prepturk:timelineChecklist';

function loadChecklist(): Record<string, boolean> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveChecklist(data: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const PHASES: PhaseData[] = [
  {
    id: 'phase-1',
    title: 'Faz 1: Saat 0-24',
    titleEn: 'Phase 1: Hours 0-24',
    subtitle: 'ACİL / IMMEDIATE',
    subtitleEn: 'IMMEDIATE',
    icon: Zap,
    iconColor: 'text-red-400',
    items: [
      {
        heading: 'Güvenlik Kontrolleri / Safety Checks',
        headingEn: 'Safety Checks',
        points: [
          'Gaz ve elektrik vanalarını kontrol et ve gerekirse kapat',
          'Yapısal hasar olup olmadığını kontrol et',
          'Kırık cam ve dökülmüş eşyaları temizle',
          'Yangın çıkma riskine karşı evi kontrol et',
        ],
        pointsEn: [
          'Check gas and electric valves, shut off if needed',
          'Check for structural damage',
          'Clean broken glass and spilled items',
          'Check house for fire risk',
        ],
        warnings: ['Gaz kokusu alırsan hemen dışarı çık ve 112\'yi ara'],
        warningsEn: ['If you smell gas, leave immediately and call 112'],
        checklist: [
          { id: 'p1-gas', text: 'Gaz vanası kontrol edildi', textEn: 'Gas valve checked' },
          { id: 'p1-electric', text: 'Elektrik sigortası kontrol edildi', textEn: 'Electric breaker checked' },
          { id: 'p1-structural', text: 'Yapısal hasar kontrolü yapıldı', textEn: 'Structural damage checked' },
          { id: 'p1-fire', text: 'Yangın riski kontrol edildi', textEn: 'Fire risk checked' },
        ],
      },
      {
        heading: 'Su Toplama / Water Collection',
        headingEn: 'Water Collection',
        points: [
          'Banyo küvetini ve tüm kaplarını suyla doldur',
          'Şişe sularını kontrol et',
          'Su arıtma yöntemlerini hazırla (kaynatma, çamaşır suyu)',
          'Her kişi için en az 3 litre içme suyu ayır',
        ],
        pointsEn: [
          'Fill bathtub and all containers with water',
          'Check bottled water supply',
          'Prepare water purification methods (boiling, bleach)',
          'Set aside at least 3 liters drinking water per person',
        ],
        checklist: [
          { id: 'p1-bathtub', text: 'Küvet dolduruldu', textEn: 'Bathtub filled' },
          { id: 'p1-bottles', text: 'Şişe suları kontrol edildi', textEn: 'Bottled water checked' },
          { id: 'p1-purify', text: 'Arıtma malzemeleri hazır', textEn: 'Purification supplies ready' },
          { id: 'p1-drinking', text: '3L/kişi içme suyu ayrıldı', textEn: '3L/person drinking water set aside' },
        ],
      },
      {
        heading: 'İletişim / Communication',
        headingEn: 'Communication',
        points: [
          '112\'yi ara, durumu bildir',
          'Aile üyeleriyle iletişim kur',
          'Bölge toplama alanını belirle',
          'Komşularla iletişime geç',
        ],
        pointsEn: [
          'Call 112, report the situation',
          'Contact family members',
          'Determine local gathering point',
          'Reach out to neighbors',
        ],
        checklist: [
          { id: 'p1-112', text: '112 arandı', textEn: 'Called 112' },
          { id: 'p1-family', text: 'Aile ile iletişim kuruldu', textEn: 'Contacted family' },
          { id: 'p1-meetup', text: 'Toplaşma alanı belirlendi', textEn: 'Gathering point determined' },
          { id: 'p1-neighbors', text: 'Komşularla iletişim', textEn: 'Contacted neighbors' },
        ],
      },
      {
        heading: 'Acil Durum Çantası / Emergency Kit',
        headingEn: 'Emergency Kit',
        points: [
          'El feneri ve yedek pilleri hazırla',
          'İlk yardım çantasını kontrol et',
          'Önemli belgeleri (kimlik, sigorta) çantaya koy',
          'Nakit para hazırla (ATM çalışmayabilir)',
          'Acil durum çantasını al ve hazır tut',
        ],
        pointsEn: [
          'Prepare flashlight and spare batteries',
          'Check first aid kit',
          'Put important documents (ID, insurance) in bag',
          'Prepare cash (ATMs may not work)',
          'Take emergency bag and keep ready',
        ],
        checklist: [
          { id: 'p1-flashlight', text: 'El feneri ve piller hazır', textEn: 'Flashlight and batteries ready' },
          { id: 'p1-firstaid', text: 'İlk yardım çantası kontrol edildi', textEn: 'First aid kit checked' },
          { id: 'p1-docs', text: 'Önemli belgeler çantada', textEn: 'Important documents in bag' },
          { id: 'p1-cash', text: 'Nakit para hazır', textEn: 'Cash ready' },
          { id: 'p1-bag', text: 'Acil durum çantası hazır', textEn: 'Emergency bag ready' },
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Faz 2: Gün 2-3',
    titleEn: 'Phase 2: Days 2-3',
    subtitle: 'SU RASYONLAMASI / WATER RATIONING',
    subtitleEn: 'WATER RATIONING',
    icon: Droplets,
    iconColor: 'text-blue-400',
    items: [
      {
        heading: 'Su Yönetimi / Water Management',
        headingEn: 'Water Management',
        points: [
          'Su rasyonlaması başlat: kişi başı 3L içme + 2L temizlik',
          'Yağmur suyu toplamak için kaplar hazırla',
          'Elleri yıkamak için az su kullan (6 saniye kuralı)',
          'Tuvalete sifon çalışmazsa kova suyu kullan',
        ],
        pointsEn: [
          'Start water rationing: 3L drinking + 2L cleaning per person',
          'Prepare containers for rainwater collection',
          'Use minimal water for hand washing (6 second rule)',
          'Use bucket water for toilet if flush does not work',
        ],
        warnings: ['Kirli su içme, mutlaka kaynat veya arıt'],
        warningsEn: ['Do not drink dirty water, always boil or purify'],
        checklist: [
          { id: 'p2-ration', text: 'Su rasyonlaması başladı', textEn: 'Water rationing started' },
          { id: 'p2-rain', text: 'Yağmur suyu toplama hazır', textEn: 'Rainwater collection ready' },
          { id: 'p2-toilet', text: 'Tuvalet için kova hazır', textEn: 'Bucket ready for toilet' },
        ],
      },
      {
        heading: 'Gıda Yönetimi / Food Management',
        headingEn: 'Food Management',
        points: [
          'Yiyecek stoklarını kontrol et',
          'Bozulabilirleri önce tüket (et, süt ürünleri)',
          'Buzdolabını minimum aç',
          'Konserve ve kuru gıdaları koru',
        ],
        pointsEn: [
          'Check food supplies',
          'Consume perishables first (meat, dairy)',
          'Open refrigerator minimally',
          'Protect canned and dry foods',
        ],
        checklist: [
          { id: 'p2-food-inventory', text: 'Gıda stoku sayıldı', textEn: 'Food inventory counted' },
          { id: 'p2-perishables', text: 'Bozulabilirler önce tüketildi', textEn: 'Perishables consumed first' },
          { id: 'p2-fridge', text: 'Buzdolabı minimum açılıyor', textEn: 'Fridge opened minimally' },
        ],
      },
      {
        heading: 'Topluluk ve Finans / Community & Finance',
        headingEn: 'Community & Finance',
        points: [
          'Komşularla iletişim kur, durum paylaş',
          'Nakit parayı hazırla (ATM çalışmayabilir)',
          'Bölge muhtarıyla iletişime geç',
          'Takas için değerli eşyaları belirle',
        ],
        pointsEn: [
          'Contact neighbors, share situation',
          'Prepare cash (ATMs may not work)',
          'Contact local neighborhood head (muhtar)',
          'Identify valuable items for barter',
        ],
        checklist: [
          { id: 'p2-neighbors', text: 'Komşularla iletişim', textEn: 'Contacted neighbors' },
          { id: 'p2-cash', text: 'Nakit para hazır', textEn: 'Cash ready' },
          { id: 'p2-mukhtar', text: 'Muhtarla iletişim', textEn: 'Contacted muhtar' },
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Faz 3: Gün 4-7',
    titleEn: 'Phase 3: Days 4-7',
    subtitle: 'GIDA VE HİJYEN / FOOD & HYGIENE',
    subtitleEn: 'FOOD & HYGIENE',
    icon: Utensils,
    iconColor: 'text-amber-400',
    items: [
      {
        heading: 'Gıda Stratejisi / Food Strategy',
        headingEn: 'Food Strategy',
        points: [
          'Önce bozulabilirler, sonra konserve, sonra kuru gıda tüket',
          'Konserve açıldıktan sonra hemen tüket',
          'Kuru gıdaları (pirinç, makarna, bulgur) rasyonla',
          'Acı baharatları az kullan (su ihtiyacını artırır)',
        ],
        pointsEn: [
          'Consume perishables first, then canned, then dry food',
          'Consume canned food immediately after opening',
          'Ration dry foods (rice, pasta, bulgur)',
          'Use spicy spices sparingly (increases water need)',
        ],
        warnings: ['Şişmiş veya kokusuz gıda tüketme, botulizm riski'],
        warningsEn: ['Do not consume swollen or odorless food, botulism risk'],
        checklist: [
          { id: 'p3-food-order', text: 'Gıda tüketim sırası belirlendi', textEn: 'Food consumption order determined' },
          { id: 'p3-canned', text: 'Konserve yönetimi uygulaması', textEn: 'Canned food management applied' },
          { id: 'p3-dry', text: 'Kuru gıda rasyonu başladı', textEn: 'Dry food rationing started' },
        ],
      },
      {
        heading: 'Hijyen ve Sağlık / Hygiene & Health',
        headingEn: 'Hygiene & Health',
        points: [
          'El yıkama kritik, hastalık hızla yayılır',
          'Alkol bazlı el dezenfektanı kullan',
          'Çöpleri dışarıda sakla, hayvanlardan uzak tut',
          'Kişisel hijyene dikkat et',
        ],
        pointsEn: [
          'Hand washing is critical, disease spreads fast',
          'Use alcohol-based hand sanitizer',
          'Store garbage outside, away from animals',
          'Pay attention to personal hygiene',
        ],
        checklist: [
          { id: 'p3-hands', text: 'El yıkama düzeni kuruldu', textEn: 'Hand washing routine established' },
          { id: 'p3-sanitizer', text: 'Dezenfektan kullanımı', textEn: 'Sanitizer usage' },
          { id: 'p3-trash', text: 'Çöp yönetimi uygulaması', textEn: 'Trash management applied' },
        ],
      },
      {
        heading: 'Isınma ve Güvenlik / Heating & Security',
        headingEn: 'Heating & Security',
        points: [
          'Güvenli ısınma yöntemleri uygula',
          'CO zehirlenmesi riskine karşı havalandırma yap',
          'Kapıları kilitle, değerli eşyaları koru',
          'Gece nöbet sistemi kur (büyük topluluklarda)',
        ],
        pointsEn: [
          'Apply safe heating methods',
          'Ventilate against CO poisoning risk',
          'Lock doors, protect valuables',
          'Set up night watch system (in large groups)',
        ],
        warnings: ['Karbonmonoksit kokusuzdur! Baş ağrısı, bulantı, baş dönmesi belirtileri'],
        warningsEn: ['Carbon monoxide is odorless! Headache, nausea, dizziness are symptoms'],
        checklist: [
          { id: 'p3-heating', text: 'Güvenli ısınma sağlandı', textEn: 'Safe heating ensured' },
          { id: 'p3-ventilation', text: 'Havalandırma kontrolü', textEn: 'Ventilation checked' },
          { id: 'p3-security', text: 'Güvenlik önlemleri alındı', textEn: 'Security measures taken' },
        ],
      },
    ],
  },
  {
    id: 'phase-4',
    title: 'Faz 4: Hafta 2+',
    titleEn: 'Phase 4: Week 2+',
    subtitle: 'TOPLULUK VE HAYATTA KALMA / COMMUNITY & SURVIVAL',
    subtitleEn: 'COMMUNITY & SURVIVAL',
    icon: Users,
    iconColor: 'text-green-400',
    items: [
      {
        heading: 'Topluluk Organizasyonu / Community Organization',
        headingEn: 'Community Organization',
        points: [
          'Muhtar ve gönüllülerle organizasyon kur',
          'Görev dağılımı yap (güvenlik, gıda, su, sağlık)',
          'Düzenli toplantılar yap',
          'Bilgi paylaşım sistemi kur (pano, sözlü duyuru)',
        ],
        pointsEn: [
          'Organize with muhtar and volunteers',
          'Assign roles (security, food, water, health)',
          'Hold regular meetings',
          'Set up information sharing system (board, verbal announcements)',
        ],
        checklist: [
          { id: 'p4-org', text: 'Topluluk organizasyonu kuruldu', textEn: 'Community organization established' },
          { id: 'p4-roles', text: 'Görev dağılımı yapıldı', textEn: 'Role assignments made' },
          { id: 'p4-meetings', text: 'Düzenli toplantılar başladı', textEn: 'Regular meetings started' },
          { id: 'p4-info', text: 'Bilgi paylaşım sistemi aktif', textEn: 'Info sharing system active' },
        ],
      },
      {
        heading: 'Su Kaynakları / Water Sources',
        headingEn: 'Water Sources',
        points: [
          'Yağmur suyu toplama sistemleri kur',
          'Suyu her zaman kaynat veya arıt',
          'Doğal su kaynaklarını belirle (dere, göl)',
          'Çiy yoğuşturma yöntemini dene (acil durumda)',
        ],
        pointsEn: [
          'Set up rainwater collection systems',
          'Always boil or purify water',
          'Identify natural water sources (stream, lake)',
          'Try dew condensation method (in emergencies)',
        ],
        warnings: ['Doğal su kaynaklarını mutlaka arıt'],
        warningsEn: ['Always purify natural water sources'],
        checklist: [
          { id: 'p4-rain', text: 'Yağmur suyu sistemi kuruldu', textEn: 'Rainwater system set up' },
          { id: 'p4-purify', text: 'Su arıtma sürekli uygulanıyor', textEn: 'Water purification consistently applied' },
          { id: 'p4-sources', text: 'Doğal su kaynakları belirlendi', textEn: 'Natural water sources identified' },
        ],
      },
      {
        heading: 'Gıda ve Sağlık / Food & Health',
        headingEn: 'Food & Health',
        points: [
          'Yerel tarım ve bahçe aktivitelerine başla',
          'Temel ilk yardım bilgisini uygula',
          'İlaçların stok kontrolünü yap, rasyonla',
          'Radyo dinle, resmi duyuruları takip et',
        ],
        pointsEn: [
          'Start local farming and garden activities',
          'Apply basic first aid knowledge',
          'Check medicine stock, ration',
          'Listen to radio, follow official announcements',
        ],
        checklist: [
          { id: 'p4-garden', text: 'Bahçe aktiviteleri başladı', textEn: 'Garden activities started' },
          { id: 'p4-meds', text: 'İlaçların stok kontrolü', textEn: 'Medicine stock checked' },
          { id: 'p4-radio', text: 'Radyo takibi aktif', textEn: 'Radio monitoring active' },
        ],
      },
    ],
  },
  {
    id: 'phase-5',
    title: 'Faz 5: Hafta 3+',
    titleEn: 'Phase 5: Week 3+',
    subtitle: 'UZUN VADE / LONG TERM',
    subtitleEn: 'LONG TERM',
    icon: Leaf,
    iconColor: 'text-emerald-400',
    items: [
      {
        heading: 'Tarım ve Gıda / Agriculture & Food',
        headingEn: 'Agriculture & Food',
        points: [
          'Mevsime uygun ekim yap (ilkbahar: domates, biber; sonbahar: lahana, pancar)',
          'Hızlı büyüyen sebzeler: marul, turp, ıspanak (30-45 gün)',
          'Takas ekonomisi: adil değerler belirle',
          'Gıda koruma yöntemlerini uygula (kurutma, tuzlama, fermantasyon)',
        ],
        pointsEn: [
          'Plant according to season (spring: tomatoes, peppers; fall: cabbage, beets)',
          'Fast-growing vegetables: lettuce, radish, spinach (30-45 days)',
          'Barter economy: determine fair values',
          'Apply food preservation methods (drying, salting, fermentation)',
        ],
        checklist: [
          { id: 'p5-planting', text: 'Mevsime uygun ekim yapıldı', textEn: 'Season-appropriate planting done' },
          { id: 'p5-barter', text: 'Takas sistemi kuruldu', textEn: 'Barter system established' },
          { id: 'p5-preserve', text: 'Gıda koruma uygulanıyor', textEn: 'Food preservation being applied' },
        ],
      },
      {
        heading: 'Eğitim ve Psikolojik Sağlık / Education & Mental Health',
        headingEn: 'Education & Mental Health',
        points: [
          'Çocuklar için eğitim aktiviteleri düzenle',
          'Hikaye anlatma, şarkı söyleme, oyun oynama',
          'Morali yüksek tut, umutlu ol',
          'Topluluk aktiviteleri düzenle',
          'Stres yönetimi tekniklerini uygula',
        ],
        pointsEn: [
          'Organize educational activities for children',
          'Storytelling, singing, playing games',
          'Keep morale high, stay hopeful',
          'Organize community activities',
          'Apply stress management techniques',
        ],
        checklist: [
          { id: 'p5-kids', text: 'Çocuk aktiviteleri düzenlendi', textEn: 'Kids activities organized' },
          { id: 'p5-morale', text: 'Topluluk morali yüksek', textEn: 'Community morale is high' },
          { id: 'p5-activities', text: 'Topluluk aktiviteleri aktif', textEn: 'Community activities active' },
        ],
      },
      {
        heading: 'Devlet Yardımı / Government Aid',
        headingEn: 'Government Aid',
        points: [
          'AFAD duyurularını takip et',
          'Kızılay yardım dağıtım noktalarını öğren',
          'Valilik ve kaymakamlık duyurularını takip et',
          'Yardım başvurularını yap',
        ],
        pointsEn: [
          'Follow AFAD announcements',
          'Learn Red Crescent aid distribution points',
          'Follow governorate announcements',
          'Submit aid applications',
        ],
        checklist: [
          { id: 'p5-afad', text: 'AFAD duyuruları takip ediliyor', textEn: 'AFAD announcements being followed' },
          { id: 'p5-redcrescent', text: 'Kızılay noktası belirlendi', textEn: 'Red Crescent point identified' },
          { id: 'p5-application', text: 'Yardım başvurusu yapıldı', textEn: 'Aid application submitted' },
        ],
      },
    ],
  },
];

function PhaseCard({ phase }: { phase: PhaseData }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => loadChecklist());
  const Icon = phase.icon;

  const toggleItem = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleCheck = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    saveChecklist(updated);
  };

  const printPhase = () => {
    window.print();
  };

  const totalChecks = phase.items.reduce((sum, item) => sum + item.checklist.length, 0);
  const checkedCount = phase.items.reduce(
    (sum, item) => sum + item.checklist.filter((c) => checklist[c.id]).length,
    0
  );

  return (
    <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
      <div className="bg-nomad-surface p-5 border-b border-nomad-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Icon className={`h-7 w-7 ${phase.iconColor}`} />
            <div>
              <h2 className="text-xl font-bold text-white">{phase.title}</h2>
              <p className="text-nomad-slate text-sm">{phase.titleEn}</p>
              <p className="text-nomad-green text-sm font-medium">{phase.subtitle}</p>
              <p className="text-nomad-slate text-xs">{phase.subtitleEn}</p>
            </div>
          </div>
          <button onClick={printPhase} className="btn-secondary flex items-center gap-2 no-print">
            <Printer className="h-4 w-4" />
            Yazdır / Print
          </button>
        </div>
        {totalChecks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-nomad-slate mb-1">
              <span>İlerleme / Progress</span>
              <span>{checkedCount}/{totalChecks}</span>
            </div>
            <div className="w-full bg-nomad-border rounded-full h-2">
              <div
                className="bg-nomad-green h-2 rounded-full transition-all"
                style={{ width: `${(checkedCount / totalChecks) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        {phase.items.map((item, idx) => {
          const isExpanded = expanded[idx];
          const itemChecked = item.checklist.filter((c) => checklist[c.id]).length;
          return (
            <div key={idx} className="mb-4 last:mb-0">
              <button
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between p-3 bg-nomad-bg rounded-lg hover:bg-nomad-border transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-nomad-green" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-nomad-slate" />
                  )}
                  <span className="font-medium text-white text-sm md:text-base">
                    {item.heading}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-nomad-slate">
                    {itemChecked}/{item.checklist.length}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 bg-nomad-bg rounded-b-lg border border-t-0 border-nomad-border">
                  <ul className="space-y-2 mb-4">
                    {item.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-sm">
                        <CheckSquare className="h-4 w-4 text-nomad-green mt-0.5 shrink-0" />
                        <div>
                          <span className="text-foreground">{point}</span>
                          {item.pointsEn && (
                            <span className="block text-nomad-slate text-xs mt-0.5">
                              {item.pointsEn[pIdx]}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {item.warnings && item.warnings.length > 0 && (
                    <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          {item.warnings.map((w, wIdx) => (
                            <div key={wIdx}>
                              <p className="text-red-300 text-sm font-medium">{w}</p>
                              {item.warningsEn && (
                                <p className="text-red-400 text-xs mt-0.5">{item.warningsEn[wIdx]}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-nomad-slate">
                      Kontrol Listesi / Checklist
                    </p>
                    {item.checklist.map((check) => (
                      <label
                        key={check.id}
                        className="flex items-start gap-2 cursor-pointer hover:bg-nomad-surface rounded p-2"
                      >
                        <input
                          type="checkbox"
                          checked={!!checklist[check.id]}
                          onChange={() => toggleCheck(check.id)}
                          className="mt-1 h-4 w-4 rounded border-nomad-border text-nomad-green focus:ring-nomad-green focus:ring-offset-0 bg-nomad-surface"
                        />
                        <div>
                          <span className="text-sm text-foreground">{check.text}</span>
                          <span className="block text-nomad-slate text-xs">{check.textEn}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HazirlikZamanCizelgesiPage() {
  return (
    <div className="min-h-screen bg-nomad-bg p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-nomad-green mb-1">
            Hazırlık Zaman Çizelgesi
          </h1>
          <p className="text-nomad-slate text-sm">
            Extended Outage Timeline Planner -- what to expect and do during power outages
          </p>
        </header>

        <div className="mb-6 bg-amber-950/50 border border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium">
                Bu çizelge genel rehberlik içindir. Gerçek durumlarda koşullar değişebilir.
              </p>
              <p className="text-amber-400 text-xs mt-1">
                This timeline is for general guidance. Real conditions may vary.
              </p>
            </div>
          </div>
        </div>

        {PHASES.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
