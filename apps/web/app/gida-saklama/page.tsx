'use client';

import { useState } from 'react';
import {
  Sun,
  Droplets,
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Printer,
  Thermometer,
  Clock,
  MapPin,
  Info,
} from 'lucide-react';

interface PreservationMethod {
  id: string;
  title: string;
  titleEn: string;
  icon: typeof Sun;
  iconColor: string;
  shelfLife: string;
  shelfLifeEn: string;
  temperature: string;
  temperatureEn: string;
  steps: { tr: string; en: string }[];
  warnings: { tr: string; en: string }[];
  seasonalCalendar: { season: string; foods: string[]; seasonEn: string; foodsEn: string[] }[];
  provinceNotes: { region: string; note: string; regionEn: string; noteEn: string }[];
}

const METHODS: PreservationMethod[] = [
  {
    id: 'kurutma',
    title: 'Kurutma (Drying)',
    titleEn: 'Drying Method',
    icon: Sun,
    iconColor: 'text-amber-400',
    shelfLife: '6-12 ay',
    shelfLifeEn: '6-12 months',
    temperature: 'Güneş: 30-45°C / Fırın: 50-70°C',
    temperatureEn: 'Sun: 30-45°C / Oven: 50-70°C',
    steps: [
      { tr: 'Gıdaları eşit kalınlıkta dilimle (3-5mm)', en: 'Slice foods evenly (3-5mm thick)' },
      { tr: 'Güneş kurutma: Temiz bez üstünde, güneşli havada 2-5 gün', en: 'Sun drying: On clean cloth, in sunny weather 2-5 days' },
      { tr: 'Fırın kurutma: En düşük ayarda, kapı aralık 4-8 saat', en: 'Oven drying: Lowest setting, door ajar 4-8 hours' },
      { tr: 'Kuruduktan sonra nefes alabilen torbalarda sakla', en: 'Store in breathable bags after drying' },
      { tr: 'Serin, kuru ve karanlık yerde muhafaza et', en: 'Store in cool, dry, dark place' },
    ],
    warnings: [
      { tr: 'Nemli kurutulmuş gıda küf yapar, tamamen kuruduğundan emin ol', en: 'Moist dried food molds, ensure fully dried' },
      { tr: 'Et kurutma sadece düşük nemli, sıcak iklimde güvenlidir', en: 'Meat drying is only safe in low-humidity, hot climates' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Biber', 'Patlıcan', 'Domates', 'Kayısı', 'İncir', 'Üzüm'], seasonEn: 'Summer', foodsEn: ['Pepper', 'Eggplant', 'Tomato', 'Apricot', 'Fig', 'Grape'] },
      { season: 'Sonbahar', foods: ['Elma', 'Armut', 'Erik'], seasonEn: 'Fall', foodsEn: ['Apple', 'Pear', 'Plum'] },
      { season: 'İlkbahar', foods: ['Yabani ot kurutma (ısırgan, ebegümeci)',], seasonEn: 'Spring', foodsEn: ['Wild herb drying'] },
    ],
    provinceNotes: [
      { region: 'Ege', note: 'Sıcak ve kuru yazlar, ideal kurutma. Biber, incir, üzüm yaygın.', regionEn: 'Aegean', noteEn: 'Hot dry summers, ideal for drying. Pepper, fig, grape common.' },
      { region: 'Akdeniz', note: 'En uzun kurutma sezonu (Mayıs-Ekim). Patlıcan, biber kurutma yaygın.', regionEn: 'Mediterranean', noteEn: 'Longest drying season (May-Oct). Eggplant, pepper drying common.' },
      { region: 'Karadeniz', note: 'Yüksek nem, güneş kurutma zor. Fırın kurutma önerilir.', regionEn: 'Black Sea', noteEn: 'High humidity, sun drying difficult. Oven drying recommended.' },
    ],
  },
  {
    id: 'tuzlama',
    title: 'Tuzlama (Salting)',
    titleEn: 'Salting Method',
    icon: Droplets,
    iconColor: 'text-blue-400',
    shelfLife: '3-6 ay',
    shelfLifeEn: '3-6 months',
    temperature: 'Oda sıcaklığında (15-25°C), serin yerde',
    temperatureEn: 'Room temperature (15-25°C), cool place',
    steps: [
      { tr: 'Gıdaları yıka ve kurut', en: 'Wash and dry foods' },
      { tr: 'Tuz-gıda oranı: %20-25 (100g gıda için 20-25g tuz)', en: 'Salt-to-food ratio: 20-25% (20-25g salt per 100g food)' },
      { tr: 'Tuzu gıda ile iyice ovuştur', en: 'Rub salt thoroughly into food' },
      { tr: 'Cam kavanoza yerleştir, üzerine tuzlu su ekle', en: 'Place in glass jar, add brine on top' },
      { tr: 'Ağzını sıkıca kapat, serin yerde sakla', en: 'Seal tightly, store in cool place' },
    ],
    warnings: [
      { tr: 'Yemeden önce tuzunu almak için suda bekle', en: 'Soak in water before eating to reduce salt' },
      { tr: 'Yüksek tansiyon hastaları dikkatli tüketmeli', en: 'High blood pressure patients should consume carefully' },
      { tr: 'İyotlu tuz kullan, guatr önleyici', en: 'Use iodized salt, prevents goiter' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Biber turşusu', 'Salatalık', 'Lahana'], seasonEn: 'Summer', foodsEn: ['Pepper pickles', 'Cucumber', 'Cabbage'] },
      { season: 'Sonbahar', foods: ['Lahana turşusu', 'Havuç', 'Turp', 'Zeytin'], seasonEn: 'Fall', foodsEn: ['Cabbage pickles', 'Carrot', 'Radish', 'Olive'] },
      { season: 'Kış', foods: ['Balık tuzlama (hamsi)',], seasonEn: 'Winter', foodsEn: ['Fish salting (anchovy)'] },
    ],
    provinceNotes: [
      { region: 'Karadeniz', note: 'Hamsi tuzlama geleneksel yöntem. Tuzlanmış hamsi kuru saklanır.', regionEn: 'Black Sea', noteEn: 'Anchovy salting is traditional method. Salted anchovy stored dry.' },
      { region: 'Ege', note: 'Zeytin tuzlama yaygın. Çeşme, Ayvalık zeytinleri meşhur.', regionEn: 'Aegean', noteEn: 'Olive salting common. Cesme, Ayvalik olives famous.' },
    ],
  },
  {
    id: 'fermentasyon',
    title: 'Fermantasyon (Fermentation)',
    titleEn: 'Fermentation Method',
    icon: Droplets,
    iconColor: 'text-purple-400',
    shelfLife: '3-12 ay',
    shelfLifeEn: '3-12 months',
    temperature: '18-22°C (oda sıcaklığı)',
    temperatureEn: '18-22°C (room temperature)',
    steps: [
      { tr: 'Gıdaları temizle ve doğra', en: 'Clean and cut foods' },
      { tr: 'Tuzlu su hazırla (1 litre suya 2 yemek kaşığı tuz)', en: 'Prepare brine (2 tbsp salt per 1 liter water)' },
      { tr: 'Gıdaları kavanoza yerleştir, tuzlu su ekle', en: 'Place foods in jar, add brine' },
      { tr: 'Gıdaların suyun altında kalmasını sağla (temiz taş kullan)', en: 'Ensure foods stay under water (use clean stone)' },
      { tr: 'Ağzını hafif açık bırak (gaz çıkışı için), 3-7 gün fermente et', en: 'Leave lid slightly open (for gas release), ferment 3-7 days' },
      { tr: 'Fermantasyon başlayınca buzdolabında veya serin yerde sakla', en: 'After fermentation starts, store in fridge or cool place' },
    ],
    warnings: [
      { tr: 'Küf görünürse tüm partiyi at', en: 'If mold appears, discard entire batch' },
      { tr: 'Kötü koku (çürüme) varsa tüketme', en: 'If bad smell (rot), do not consume' },
      { tr: 'Laktik asit bakterileri doğal koruyucudur, güvenilirdir', en: 'Lactic acid bacteria are natural preservatives, safe' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Turşu çeşitleri', 'Yoğurt (yazın çabuk ekşir)'], seasonEn: 'Summer', foodsEn: ['Pickle varieties', 'Yogurt (sours quickly in summer)'] },
      { season: 'Sonbahar', foods: ['Lahana turşusu', 'Şalgam', 'Sirke'], seasonEn: 'Fall', foodsEn: ['Cabbage pickles', 'Shalgam (turnip drink)', 'Vinegar'] },
      { season: 'Kış', foods: ['Kefir', 'Turşu (kışın yavaş fermente)',], seasonEn: 'Winter', foodsEn: ['Kefir', 'Pickles (slow ferment in winter)'] },
    ],
    provinceNotes: [
      { region: 'Tüm Türkiye', note: 'Turşu tüm ülkede yaygın. Her bölgenin kendine öz tarifi var.', regionEn: 'All Turkey', noteEn: 'Pickles common nationwide. Each region has own recipes.' },
      { region: 'Adana', note: 'Şalgam suyu geleneksel içecek, fermantasyon ile yapılır.', regionEn: 'Adana', noteEn: 'Shalgam is traditional drink, made by fermentation.' },
    ],
  },
  {
    id: 'konserve',
    title: 'Konserve (Canning)',
    titleEn: 'Canning Method',
    icon: Droplets,
    iconColor: 'text-red-400',
    shelfLife: '1-2 yıl',
    shelfLifeEn: '1-2 years',
    temperature: 'Kaynatma: 100°C (su banyosu) / Basınç: 116-121°C',
    temperatureEn: 'Boiling: 100°C (water bath) / Pressure: 116-121°C',
    steps: [
      { tr: 'Kavanozları kaynar suda steril et (10 dakika)', en: 'Sterilize jars in boiling water (10 minutes)' },
      { tr: 'Gıdaları hazırla ve kavanozlara doldur', en: 'Prepare foods and fill jars' },
      { tr: 'Üzerine kaynar su veya şekerli/sirke karışımı ekle', en: 'Add boiling water or sugar/vinegar mixture on top' },
      { tr: 'Kapaklarını sıkıca kapat', en: 'Seal lids tightly' },
      { tr: 'Su banyosunda 20-45 dakika kaynat (gıda türüne göre)', en: 'Boil in water bath 20-45 minutes (depending on food type)' },
      { tr: 'Çıkarıp ters çevir, 24 saat bekle', en: 'Remove, turn upside down, wait 24 hours' },
      { tr: 'Kapak test et: ortasına bas, içine çökmüşse kapak sağlam', en: 'Test seal: press center, if concave, seal is good' },
    ],
    warnings: [
      { tr: 'Şişmiş kapak, kötü koku = BOTULİZM, ASLA TÜKETME', en: 'Bulging lid, foul odor = BOTULISM, NEVER EAT' },
      { tr: 'Açıldıktan sonra buzdolabında sakla, 3-5 gün içinde tüket', en: 'After opening, refrigerate, consume within 3-5 days' },
      { tr: 'Düşük asitli gıdalar (et, sebze) için basınçlı konserve şart', en: 'Pressure canning required for low-acid foods (meat, vegetables)' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Domates salçası', 'Reçel', 'Komposto'], seasonEn: 'Summer', foodsEn: ['Tomato paste', 'Jam', 'Compote'] },
      { season: 'Sonbahar', foods: ['Turşu (konserve)', 'Meyve kompostosu', 'Reçel'], seasonEn: 'Fall', foodsEn: ['Preserved pickles', 'Fruit compote', 'Jam'] },
    ],
    provinceNotes: [
      { region: 'Tüm Türkiye', note: 'Domates salçası en yaygın konserve. Gaziantep, Hatay meşhur.', regionEn: 'All Turkey', noteEn: 'Tomato paste most common canned. Gaziantep, Hatay famous.' },
    ],
  },
  {
    id: 'tutsuleme',
    title: 'Tütsüleme (Smoking)',
    titleEn: 'Smoking Method',
    icon: Sun,
    iconColor: 'text-orange-400',
    shelfLife: '1-3 ay',
    shelfLifeEn: '1-3 months',
    temperature: 'Soğuk tütsü: 15-25°C / Sıcak tütsü: 52-80°C',
    temperatureEn: 'Cold smoke: 15-25°C / Hot smoke: 52-80°C',
    steps: [
      { tr: 'Gıdaları tuzla (1-2 saat tuzlu suda bekle)', en: 'Salt foods (soak in brine 1-2 hours)' },
      { tr: 'Tütsü için doğru odun seç (meşe, kayın, elma ağacı)', en: 'Select correct wood for smoking (oak, beech, apple)' },
      { tr: 'ÇAM ağacı KULLANMA (zehirli duman)', en: 'DO NOT USE pine wood (toxic smoke)' },
      { tr: 'Soğuk tütsü: 2-7 gün, sıcak tütsü: 1-4 saat', en: 'Cold smoke: 2-7 days, hot smoke: 1-4 hours' },
      { tr: 'Tütsülendikten sonra serin, havadar yerde sakla', en: 'After smoking, store in cool, ventilated place' },
    ],
    warnings: [
      { tr: 'Çam ağacı dumanı zehirlidir, kesinlikle kullanma', en: 'Pine wood smoke is toxic, never use' },
      { tr: 'Tütsülenmiş et/balık buzdolabında saklanmalıdır', en: 'Smoked meat/fish must be refrigerated' },
      { tr: 'Aşırı tütsülenmiş gıda kanserojen içerebilir, orta karar kullan', en: 'Over-smoked food may contain carcinogens, use moderately' },
    ],
    seasonalCalendar: [
      { season: 'Sonbahar', foods: ['Et tütsüleme', 'Balık tütsüleme'], seasonEn: 'Fall', foodsEn: ['Meat smoking', 'Fish smoking'] },
      { season: 'Kış', foods: ['Sucuk, pastırma (kurutma + tütsü)',], seasonEn: 'Winter', foodsEn: ['Sucuk, pastirma (drying + smoke)'] },
    ],
    provinceNotes: [
      { region: 'Karadeniz', note: 'Hamsi tütsüleme geleneksel. İzmit ve Rize yöresinde yaygın.', regionEn: 'Black Sea', noteEn: 'Anchovy smoking traditional. Common in Izmit and Rize area.' },
      { region: 'İç Anadolu', note: 'Kayseri pastırması en meşhur tütsülenmiş et ürünü.', regionEn: 'Central Anatolia', noteEn: 'Kayseri pastirma most famous smoked meat product.' },
    ],
  },
  {
    id: 'dondurma',
    title: 'Dondurma (Freezing)',
    titleEn: 'Freezing Method',
    icon: Thermometer,
    iconColor: 'text-cyan-400',
    shelfLife: '3-12 ay (dondurucuda -18°C)',
    shelfLifeEn: '3-12 months (at -18°C in freezer)',
    temperature: '-18°C veya daha düşük',
    temperatureEn: '-18°C or lower',
    steps: [
      { tr: 'Gıdaları porsiyonlara böl', en: 'Divide foods into portions' },
      { tr: 'Hava geçirmeyen torbalara veya kaplara koy', en: 'Place in airtight bags or containers' },
      { tr: 'Mümkünse vakumlu paketle (daha uzun ömür)', en: 'Vacuum pack if possible (longer shelf life)' },
      { tr: 'Tarihlendir ve dondurucuya koy', en: 'Date and place in freezer' },
      { tr: 'Güç kesintisinde: kuru buz kullan (2-3 gün dayanır)', en: 'During power outage: use dry ice (lasts 2-3 days)' },
    ],
    warnings: [
      { tr: 'Çözülmüş gıda tekrar dondurulmez (bakteri üreme riski)', en: 'Thawed food cannot be refrozen (bacteria growth risk)' },
      { tr: 'Dondurucu kapısını minimum aç (kapalı kalırsa 24-48 saat korur)', en: 'Open freezer door minimally (if closed, protects 24-48 hours)' },
      { tr: 'Kuru buz ile temasta eldiven kullan (ciddi yanık yapar)', en: 'Use gloves when handling dry ice (causes severe burns)' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Yaz meyveleri (çilek, şeftali, kiraz)', 'Yeşillik'], seasonEn: 'Summer', foodsEn: ['Summer fruits (strawberry, peach, cherry)', 'Greens'] },
      { season: 'Sonbahar', foods: ['Et stokları', 'Sebze (blanş edilmiş)',], seasonEn: 'Fall', foodsEn: ['Meat stocks', 'Vegetables (blanched)'] },
    ],
    provinceNotes: [
      { region: 'Doğu Anadolu', note: 'Kışın dışarısı doğal dondurucu olarak kullanılabilir (-20°C).', regionEn: 'Eastern Anatolia', noteEn: 'Winter outdoors can be used as natural freezer (-20°C).' },
    ],
  },
];

function MethodCard({ method }: { method: PreservationMethod }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ steps: true });

  const toggle = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const printMethod = () => {
    window.print();
  };

  const Icon = method.icon;

  const sections = [
    {
      key: 'steps',
      title: 'Adımlar / Steps',
      content: (
        <ol className="space-y-3">
          {method.steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nomad-green/20 text-nomad-green font-bold text-sm">
                {idx + 1}
              </span>
              <div>
                <p className="text-foreground text-sm">{step.tr}</p>
                <p className="text-nomad-slate text-xs mt-0.5">{step.en}</p>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      key: 'warnings',
      title: 'Uyarılar / Warnings',
      content: (
        <div className="space-y-2">
          {method.warnings.map((w, idx) => (
            <div key={idx} className="bg-red-950/50 border border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-300 text-sm">{w.tr}</p>
                  <p className="text-red-400 text-xs mt-0.5">{w.en}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'seasonal',
      title: 'Mevsimsel Takvim / Seasonal Calendar',
      content: (
        <div className="space-y-3">
          {method.seasonalCalendar.map((s, idx) => (
            <div key={idx} className="bg-nomad-surface rounded-lg p-3">
              <p className="font-medium text-nomad-green text-sm">{s.season} / {s.seasonEn}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.foods.map((food, fIdx) => (
                  <span
                    key={fIdx}
                    className="text-xs bg-nomad-bg text-foreground px-2 py-1 rounded"
                  >
                    {food}
                    {s.foodsEn[fIdx] && (
                      <span className="text-nomad-slate ml-1">({s.foodsEn[fIdx]})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'provinces',
      title: 'Bölge Notları / Province Notes',
      content: (
        <div className="space-y-2">
          {method.provinceNotes.map((p, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-nomad-surface rounded-lg p-3">
              <MapPin className="h-4 w-4 text-nomad-green mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-white text-sm">{p.region}</p>
                <p className="text-nomad-slate text-xs">{p.regionEn}</p>
                <p className="text-foreground text-sm mt-1">{p.note}</p>
                <p className="text-nomad-slate text-xs">{p.noteEn}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="bg-nomad-surface rounded-xl border border-nomad-border mb-6 overflow-hidden">
      <div className="p-5 border-b border-nomad-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${method.iconColor}`} />
            <div>
              <h2 className="text-xl font-bold text-white">{method.title}</h2>
              <p className="text-nomad-slate text-sm">{method.titleEn}</p>
            </div>
          </div>
          <button onClick={printMethod} className="btn-secondary flex items-center gap-2 no-print">
            <Printer className="h-4 w-4" />
            Yazdır / Print
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1 text-nomad-slate">
            <Clock className="h-4 w-4" />
            <span>Raf ömrü / Shelf life: <strong className="text-foreground">{method.shelfLife}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-nomad-slate">
            <Thermometer className="h-4 w-4" />
            <span>Sıcaklık / Temp: <strong className="text-foreground">{method.temperature}</strong></span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {sections.map((section) => (
          <div key={section.key} className="mb-4 last:mb-0">
            <button
              onClick={() => toggle(section.key)}
              className="w-full flex items-center justify-between p-3 bg-nomad-bg rounded-lg hover:bg-nomad-border transition-colors text-left"
            >
              <span className="font-medium text-white text-sm">{section.title}</span>
              {expanded[section.key] ? (
                <ChevronDown className="h-4 w-4 text-nomad-green" />
              ) : (
                <ChevronRight className="h-4 w-4 text-nomad-slate" />
              )}
            </button>
            {expanded[section.key] && (
              <div className="p-4 bg-nomad-bg border border-t-0 border-nomad-border rounded-b-lg">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GidaSaklamaPage() {
  return (
    <div className="min-h-screen bg-nomad-bg p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-nomad-green mb-1">
            Gıda Saklama Rehberi
          </h1>
          <p className="text-nomad-slate text-sm">
            Food Preservation Without Electricity -- Traditional Turkish Methods
          </p>
        </header>

        <div className="mb-6 bg-nomad-surface rounded-xl border border-nomad-border p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-nomad-green mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground text-sm">
                Elektrik olmadan gıdaları korumak için geleneksel Türk yöntemleri. Her yöntem,
                raf ömrü, sıcaklık gereksinimleri, mevsimsel takvim ve bölge notları içerir.
              </p>
              <p className="text-nomad-slate text-xs mt-1">
                Traditional Turkish methods to preserve food without electricity. Each method includes
                shelf life, temperature requirements, seasonal calendar, and province notes.
              </p>
            </div>
          </div>
        </div>

        {METHODS.map((method) => (
          <MethodCard key={method.id} method={method} />
        ))}
      </div>
    </div>
  );
}
