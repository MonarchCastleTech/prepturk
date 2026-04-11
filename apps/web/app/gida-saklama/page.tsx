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
    temperature: 'Gunes: 30-45°C / Firin: 50-70°C',
    temperatureEn: 'Sun: 30-45°C / Oven: 50-70°C',
    steps: [
      { tr: 'Gidalari esit kalinlikta dilimle (3-5mm)', en: 'Slice foods evenly (3-5mm thick)' },
      { tr: 'Gunes kurutma: Temiz bez ustunde, gunesli havada 2-5 gun', en: 'Sun drying: On clean cloth, in sunny weather 2-5 days' },
      { tr: 'Firin kurutma: En dusuk ayarda, kapi aralik 4-8 saat', en: 'Oven drying: Lowest setting, door ajar 4-8 hours' },
      { tr: 'Kuruduktan sonra nefes alabilisen torbalarda sakla', en: 'Store in breathable bags after drying' },
      { tr: 'Serin, kuru ve karanlik yerde muhafaza et', en: 'Store in cool, dry, dark place' },
    ],
    warnings: [
      { tr: 'Nemli kurutulmus gida kuf yapar, tamamen kurudugundan emin ol', en: 'Moist dried food molds, ensure fully dried' },
      { tr: 'Et kurutma sadece dusuk nemli, sicak iklimde guvenlidir', en: 'Meat drying is only safe in low-humidity, hot climates' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Biber', 'Patlican', 'Domates', 'Kayisi', 'Incir', 'Uzum'], seasonEn: 'Summer', foodsEn: ['Pepper', 'Eggplant', 'Tomato', 'Apricot', 'Fig', 'Grape'] },
      { season: 'Sonbahar', foods: ['Elma', 'Armut', 'Erik'], seasonEn: 'Fall', foodsEn: ['Apple', 'Pear', 'Plum'] },
      { season: 'Ilkbahar', foods: ['Yabani ot kurutma (isitgan, ebegumecgi)',], seasonEn: 'Spring', foodsEn: ['Wild herb drying'] },
    ],
    provinceNotes: [
      { region: 'Ege', note: 'Sicak ve kuru yazlar, ideal kurutma. Biber, incir, uzum yaygin.', regionEn: 'Aegean', noteEn: 'Hot dry summers, ideal for drying. Pepper, fig, grape common.' },
      { region: 'Akdeniz', note: 'En uzun kurutma sezonu (Mayim-Ekim). Patlican, biber kurutma yaygin.', regionEn: 'Mediterranean', noteEn: 'Longest drying season (May-Oct). Eggplant, pepper drying common.' },
      { region: 'Karadeniz', note: 'Yuksek nem, gunes kurutma zor. Firin kurutma onerilir.', regionEn: 'Black Sea', noteEn: 'High humidity, sun drying difficult. Oven drying recommended.' },
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
    temperature: 'Oda sicakliginda (15-25°C), serin yerde',
    temperatureEn: 'Room temperature (15-25°C), cool place',
    steps: [
      { tr: 'Gidalari yika ve kurut', en: 'Wash and dry foods' },
      { tr: 'Tuz-gida orani: %20-25 (100g gida icin 20-25g tuz)', en: 'Salt-to-food ratio: 20-25% (20-25g salt per 100g food)' },
      { tr: 'Tuzu gida ile iyice ovustur', en: 'Rub salt thoroughly into food' },
      { tr: 'Cam kavanoza yerlestir, uzerine tuzlu su ekle', en: 'Place in glass jar, add brine on top' },
      { tr: 'Agzini sikica kapat, serin yerde sakla', en: 'Seal tightly, store in cool place' },
    ],
    warnings: [
      { tr: 'Yemeden once tuzunu almak icin suda bekle', en: 'Soak in water before eating to reduce salt' },
      { tr: 'Yuksek tansiyon hastalari dikkatli tuketmeli', en: 'High blood pressure patients should consume carefully' },
      { tr: 'Iyotlu tuz kullan, guatr onleyici', en: 'Use iodized salt, prevents goiter' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Biber tursusu', 'Salatalik', 'Lahana'], seasonEn: 'Summer', foodsEn: ['Pepper pickles', 'Cucumber', 'Cabbage'] },
      { season: 'Sonbahar', foods: ['Lahana tursusu', 'Havuc', 'Turp', 'Zeytin'], seasonEn: 'Fall', foodsEn: ['Cabbage pickles', 'Carrot', 'Radish', 'Olive'] },
      { season: 'Kis', foods: ['Balik tuzlama (hamsi)',], seasonEn: 'Winter', foodsEn: ['Fish salting (anchovy)'] },
    ],
    provinceNotes: [
      { region: 'Karadeniz', note: 'Hamsi tuzlama geleneksel yontem. Tuzlanmis hamsi kuru saklanir.', regionEn: 'Black Sea', noteEn: 'Anchovy salting is traditional method. Salted anchovy stored dry.' },
      { region: 'Ege', note: 'Zeytin tuzlama yaygin. Cesme, Ayvalik zeytinleri meshur.', regionEn: 'Aegean', noteEn: 'Olive salting common. Cesme, Ayvalik olives famous.' },
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
    temperature: '18-22°C (oda sicakligi)',
    temperatureEn: '18-22°C (room temperature)',
    steps: [
      { tr: 'Gidalari temizle ve dogra', en: 'Clean and cut foods' },
      { tr: 'Tuzlu su hazirla (1 litre suya 2 yemek kasigi tuz)', en: 'Prepare brine (2 tbsp salt per 1 liter water)' },
      { tr: 'Gidalari kavanoza yerlestir, tuzlu su ekle', en: 'Place foods in jar, add brine' },
      { tr: 'Gidalarin suyun altinda kalmasini sagla (temiz tas kullan)', en: 'Ensure foods stay under water (use clean stone)' },
      { tr: 'Agzini hafif acik birak (gaz cikisi icin), 3-7 gun fermente et', en: 'Leave lid slightly open (for gas release), ferment 3-7 days' },
      { tr: 'Fermantasyon baslayinca buzdolabinda veya serin yerde sakla', en: 'After fermentation starts, store in fridge or cool place' },
    ],
    warnings: [
      { tr: 'Kuf gorunurse tum partiyi at', en: 'If mold appears, discard entire batch' },
      { tr: 'Kotu koku (curume) varsa tuketme', en: 'If bad smell (rot), do not consume' },
      { tr: 'Laktik asit bakterileri dogal koruyucudur, guvenilidir', en: 'Lactic acid bacteria are natural preservatives, safe' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Tursu cesitleri', 'Yogurt (yazin cabuk ekisir)'], seasonEn: 'Summer', foodsEn: ['Pickle varieties', 'Yogurt (sours quickly in summer)'] },
      { season: 'Sonbahar', foods: ['Lahana tursusu', 'Salgam', 'Sirke'], seasonEn: 'Fall', foodsEn: ['Cabbage pickles', 'Shalgam (turnip drink)', 'Vinegar'] },
      { season: 'Kis', foods: ['Kefir', 'Turstu (kisin yavas fermente)',], seasonEn: 'Winter', foodsEn: ['Kefir', 'Pickles (slow ferment in winter)'] },
    ],
    provinceNotes: [
      { region: 'Tum Turkiye', note: 'Tursu tum ulkede yaygin. Her bolgenin kendine oz tarifi var.', regionEn: 'All Turkey', noteEn: 'Pickles common nationwide. Each region has own recipes.' },
      { region: 'Adana', note: 'Salgam susmesi geleneksel icecek, fermantasyon ile yapilir.', regionEn: 'Adana', noteEn: 'Shalgam is traditional drink, made by fermentation.' },
    ],
  },
  {
    id: 'konserve',
    title: 'Konserve (Canning)',
    titleEn: 'Canning Method',
    icon: Droplets,
    iconColor: 'text-red-400',
    shelfLife: '1-2 yil',
    shelfLifeEn: '1-2 years',
    temperature: 'Kaynatma: 100°C (su banyosu) / Basinc: 116-121°C',
    temperatureEn: 'Boiling: 100°C (water bath) / Pressure: 116-121°C',
    steps: [
      { tr: 'Kavanozlari kaynar suda steril et (10 dakika)', en: 'Sterilize jars in boiling water (10 minutes)' },
      { tr: 'Gidalari hazirla ve kavanozlara doldur', en: 'Prepare foods and fill jars' },
      { tr: 'Uzerine kaynar su veya sekerli/sirke karisimi ekle', en: 'Add boiling water or sugar/vinegar mixture on top' },
      { tr: 'Kapaklarini sikica kapat', en: 'Seal lids tightly' },
      { tr: 'Su banyosunda 20-45 dakika kaynat (gida turune gore)', en: 'Boil in water bath 20-45 minutes (depending on food type)' },
      { tr: 'Cikarip ters cevir, 24 saat bekle', en: 'Remove, turn upside down, wait 24 hours' },
      { tr: 'Kapak test et: ortasina bas, icine cokmuse muhbas saglam', en: 'Test seal: press center, if concave, seal is good' },
    ],
    warnings: [
      { tr: 'Sismis kapak, kotu koku = BOTULISM, ASLA TUKETME', en: 'Bulging lid, foul odor = BOTULISM, NEVER EAT' },
      { tr: 'Acildiktan sonra buzdolabinda sakla, 3-5 gun icinde tuket', en: 'After opening, refrigerate, consume within 3-5 days' },
      { tr: 'Dusuk asitli gidalar (et, sebze) icin basincli konserve sart', en: 'Pressure canning required for low-acid foods (meat, vegetables)' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Domates salcasi', 'Recel', 'Komposto'], seasonEn: 'Summer', foodsEn: ['Tomato paste', 'Jam', 'Compote'] },
      { season: 'Sonbahar', foods: ['Turse (konserve)', 'Meyve kompostosu', 'Recel'], seasonEn: 'Fall', foodsEn: ['Preserved pickles', 'Fruit compote', 'Jam'] },
    ],
    provinceNotes: [
      { region: 'Tum Turkiye', note: 'Domates salcasi en yaygin konserve. Gaziantep, Hatay meshur.', regionEn: 'All Turkey', noteEn: 'Tomato paste most common canned. Gaziantep, Hatay famous.' },
    ],
  },
  {
    id: 'tutsuleme',
    title: 'Tutsuleme (Smoking)',
    titleEn: 'Smoking Method',
    icon: Sun,
    iconColor: 'text-orange-400',
    shelfLife: '1-3 ay',
    shelfLifeEn: '1-3 months',
    temperature: 'Soguk tutsu: 15-25°C / Sicak tutsu: 52-80°C',
    temperatureEn: 'Cold smoke: 15-25°C / Hot smoke: 52-80°C',
    steps: [
      { tr: 'Gidalari tuzla (1-2 saat tuzlu suda bekle)', en: 'Salt foods (soak in brine 1-2 hours)' },
      { tr: 'Tutsu icin dogru odun sec (mese, kayin, elma agaci)', en: 'Select correct wood for smoking (oak, beech, apple)' },
      { tr: 'CAM agaci KULLANMA (zehirli duman)', en: 'DO NOT USE pine wood (toxic smoke)' },
      { tr: 'Soguk tutsu: 2-7 gun, sicak tutsu: 1-4 saat', en: 'Cold smoke: 2-7 days, hot smoke: 1-4 hours' },
      { tr: 'Tutsulendikten sonra serin, havadar yerde sakla', en: 'After smoking, store in cool, ventilated place' },
    ],
    warnings: [
      { tr: 'Cam agaci dumanu zehirlidir, kesinlikle kullanma', en: 'Pine wood smoke is toxic, never use' },
      { tr: 'Tutsulenmis et/balik buzdolabinda saklanmalidir', en: 'Smoked meat/fish must be refrigerated' },
      { tr: 'Asiri tutsulenmis gida kanserojen icerebilir, orta karar kullan', en: 'Over-smoked food may contain carcinogens, use moderately' },
    ],
    seasonalCalendar: [
      { season: 'Sonbahar', foods: ['Et tutsuleme', 'Balik tutsuleme'], seasonEn: 'Fall', foodsEn: ['Meat smoking', 'Fish smoking'] },
      { season: 'Kis', foods: ['Sucuk, pastirma (kurutma + tutsu)',], seasonEn: 'Winter', foodsEn: ['Sucuk, pastirma (drying + smoke)'] },
    ],
    provinceNotes: [
      { region: 'Karadeniz', note: 'Hamsi tutsuleme geleneksel. Izmit ve Rize yoresinde yaygin.', regionEn: 'Black Sea', noteEn: 'Anchovy smoking traditional. Common in Izmit and Rize area.' },
      { region: 'Iceri Anadolu', note: 'Kayseri pastirmasi en meshur tutsulenmis et urunu.', regionEn: 'Central Anatolia', noteEn: 'Kayseri pastirma most famous smoked meat product.' },
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
    temperature: '-18°C veya daha dusuk',
    temperatureEn: '-18°C or lower',
    steps: [
      { tr: 'Gidalari porsiyonlara bol', en: 'Divide foods into portions' },
      { tr: 'Hava gecirmeyen torbalara veya kaplara koy', en: 'Place in airtight bags or containers' },
      { tr: 'Mumkunse vakumlu paketle (daha uzun omur)', en: 'Vacuum pack if possible (longer shelf life)' },
      { tr: 'Tarihlendir ve dondurucuya koy', en: 'Date and place in freezer' },
      { tr: 'Kesme guc ciktiginda: kuru buz kullan (2-3 gun dayanir)', en: 'During power outage: use dry ice (lasts 2-3 days)' },
    ],
    warnings: [
      { tr: 'Cozulmus gida tekrar dondurulmez (bakteri ureme riski)', en: 'Thawed food cannot be refrozen (bacteria growth risk)' },
      { tr: 'Dondurucu kapisini minimum ac (kapali kalirsa 24-48 saat korur)', en: 'Open freezer door minimally (if closed, protects 24-48 hours)' },
      { tr: 'Kuru buz ile temasta eldiven kullan (ciddi yanik yapar)', en: 'Use gloves when handling dry ice (causes severe burns)' },
    ],
    seasonalCalendar: [
      { season: 'Yaz', foods: ['Yaz meyveleri (cilek, seftali, kiraz)', 'Yesillik'], seasonEn: 'Summer', foodsEn: ['Summer fruits (strawberry, peach, cherry)', 'Greens'] },
      { season: 'Sonbahar', foods: ['Et stoklari', 'Sebze (blans edilmis)',], seasonEn: 'Fall', foodsEn: ['Meat stocks', 'Vegetables (blanched)'] },
    ],
    provinceNotes: [
      { region: 'Dogu Anadolu', note: 'Kisin disari dogal dondurucu olarak kullanilabilir (-20°C).', regionEn: 'Eastern Anatolia', noteEn: 'Winter outdoors can be used as natural freezer (-20°C).' },
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
      title: 'Adimlar / Steps',
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
      title: 'Uyarilar / Warnings',
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
      title: 'Bolge Notlari / Province Notes',
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
            Yazdir / Print
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1 text-nomad-slate">
            <Clock className="h-4 w-4" />
            <span>Raf omru / Shelf life: <strong className="text-foreground">{method.shelfLife}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-nomad-slate">
            <Thermometer className="h-4 w-4" />
            <span>Sicaklik / Temp: <strong className="text-foreground">{method.temperature}</strong></span>
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
            Gida Saklama Rehberi
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
                Elektrik olmadan gidalari korumak icin geleneksel Turk yontemleri. Her yontem,
                raf omru, sicaklik gereksinimleri, mevsimsel takvim ve bolge notlari icerir.
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
