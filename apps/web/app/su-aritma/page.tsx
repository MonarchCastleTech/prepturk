'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Droplets, Flame, Sun, FlaskConical, Filter, Printer, ChevronDown, ChevronUp, AlertTriangle, Check, X, Clock, BookOpen, Info } from 'lucide-react';

interface PurificationMethod {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  timeRequired: string;
  description: string;
  steps: string[];
  removes: string[];
  doesNotRemove: string[];
  warnings?: string[];
  sources: string[];
  expanded: boolean;
}

const INITIAL_METHODS: PurificationMethod[] = [
  {
    id: 'kaynatma',
    title: 'Kaynatma',
    titleEn: 'Boiling',
    icon: Flame,
    iconColor: 'text-red-400',
    timeRequired: '1 dakika (2000m uzerinde 3 dakika)',
    description: 'Suyu kaynatmak en guvenilir ve en kolay su arıtma yontemidir. Bakteri, virus ve protozoalari oldurur.',
    steps: [
      'Suyu temiz bir kaba koyun (mumkunse metal kap)',
      'Suyu guclu bir ateste kaynama noktasina getirin',
      'Su kaynamaya baslayinca 1 dakika boyunca kaynatmaya devam edin',
      'Rakim 2000 metrenin uzerindeyse 3 dakika kaynatin',
      'Suyu sogumaya birakin (uzerini kapatin)',
      'Soguduktan sonra temiz bir kaba aktarin',
      'Tatlandirmak icin bir tutam tuz ekleyin (istege bagli)'
    ],
    removes: ['Bakteriler (E. coli, Salmonella, vs.)', 'Virusler (Hepatit A, Rotavirus, vs.)', 'Protozoalar (Giardia, Cryptosporidium, vs.)'],
    doesNotRemove: ['Kimyasal kirleticiler (pestisitler, agır metaller)', 'Tuz (tuzlu su icin uygun degil)', 'Agir metaller (kursun, civa, arsenik)', 'Tortu ve bulaniklik (on filtreleme gerekli)'],
    warnings: ['Kaynatma yakıt gerektirir -- kaynaklar sinirli olabilir', 'Su cok bulaniksa once bezden gecirin', 'Kaptaki su soguduktan sonra tuketin'],
    sources: ['AFAD Su Guvenligi Kilavuzu', 'Dunya Saglik Orgutu (WHO) -- Guidelines for Drinking-water Quality', 'Saglik Bakanligi Halk Sagligi Rehberi'],
    expanded: false,
  },
  {
    id: 'kimyasal',
    title: 'Kimyasal Arıtma',
    titleEn: 'Chemical Treatment',
    icon: FlaskConical,
    iconColor: 'text-purple-400',
    timeRequired: '30 dakika bekleme suresi',
    description: 'Klor dioksit veya iyot tabletlere ile suyun icindeki patojenler yok edilir. Taşınması kolay ve yakıt gerektirmez.',
    steps: [
      'Suyu mumkunse oncelikle bir bezden gecirerek tortuyu alin',
      'Klor dioksit tableti: 1 litre suya 1 tablet ekleyin',
      'Iyot: 1 litre suya 5 damla iyot tenturdiyot ekleyin',
      'Kabi kapatin ve 30 saniye calklayın',
      'Kapakta kalan ilacın cozulmesi icin kabi ters cevirin',
      '30 dakika bekleyin (su soguksa 60 dakika)',
      'Suyu tuketime hazir'
    ],
    removes: ['Cogu bakteri ve virus', 'Protozoa kistleri (klor dioksit ile)', 'Hepatit A virusu', 'Kolera bakterisi'],
    doesNotRemove: ['Cryptosporidium (iyot ile etkisiz)', 'Agir metaller', 'Kimyasal kirleticiler', 'Tortu ve partikuller', 'Tuz'],
    warnings: [
      'HAMIL KADINLAR icin iyot KULLANMAYIN -- tiroid bezine zarar verebilir',
      'Tiroid hastaligi olanlar iyot kullanmamalidir',
      'Iyotlu suyun tadı kotu olabilir -- C vitamini tozu ile notralize edilebilir',
      'Tabletlerin son kullanma tarihini kontrol edin',
      'Su 10C altindaysa bekleme suresini 60 dakikaya cikarin'
    ],
    sources: ['AFAD Acil Durum Rehberi', 'WHO Emergency Water Treatment', 'Saglik Bakanligi Su Arıtma Klavuzu', 'CDC Water Disinfection Guide'],
    expanded: false,
  },
  {
    id: 'sodis',
    title: 'SODIS (Gunesle Dezenfeksiyon)',
    titleEn: 'Solar Disinfection',
    icon: Sun,
    iconColor: 'text-yellow-400',
    timeRequired: '6 saat (gunesli) / 48 saat (bulutlu)',
    description: 'Gunesin UV-A isinlari ve isi etkisiyle sudaki patojenler yok edilir. Enerji gerektirmez, PET siselerle uygulanır.',
    steps: [
      'Sadece SEFFAF PET sise kullanin (cam veya renkli plastik CALISMAZ)',
      'Sise uzerinde cizik veya hasar olmadigindan emin olun',
      'Siseyi su ile doldurun (ustte 2 cm bosluk birakin)',
      'Kapagini sikica kapatin',
      'Siseyi 30 saniye calkalayin (oksijen seviyesini artirir)',
      'Siseyi YATAY olarak gunes isigi alan bir yere yerlestirin',
      'Dogrudan gunes isigi almalidir (golgeye degil)',
      'Gunesli havada 6 saat, bulutlu havada 48 saat bekletin',
      'Sure sonunda su icmeye hazirdir'
    ],
    removes: ['Bakteriler (UV-A hasar ile)', 'Virusler', 'Protozoa kistleri', 'E. coli ve koliform bakteriler'],
    doesNotRemove: ['Kimyasal kirleticiler', 'Agır metaller', 'Tuz', 'Tortu (cok bulanik suda on filtreleme sart)', 'Cam siselerde etkisiz', 'Renkli siselerde etkisiz'],
    warnings: [
      'CAM SISLERDE CALISMAZ -- sadece seffaf PET',
      'Renkli PET SISELERDE CALISMAZ',
      'Su cok bulaniksa (gazete yazi okunmiyorsa) once filtreleyin',
      'Yagmurlu/goklu gunlerde 2 gun (48 saat) bekletmek gerekir',
      'Sicaklik 50C uzerine cikarsa etki artar',
      'Metal veya opake kaplar kullanmayın'
    ],
    sources: ['WHO SODIS Guidelines', 'EAWAG/SSM Solar Water Treatment', 'AFAD Alternatif Su Yontemleri', 'Saglik Bakanligi'],
    expanded: false,
  },
  {
    id: 'filtreleme',
    title: 'Filtreleme',
    titleEn: 'Filtration',
    icon: Filter,
    iconColor: 'text-blue-400',
    timeRequired: 'Anlik (bez filtre) / Hizli (ticari filtre)',
    description: 'Fiziksel filtreleme ile tortu ve partikuller uzaklastirilir. Bez filtre katmanlari veya ticari 0.2 mikron filtreler kullanilabilir.',
    steps: [
      'BEZ FILTRE YONTEMI:',
      '  1. Temiz bir pamuklu bez veya tisort bulun',
      '  2. Bezi 3-4 kat yapin (katmanli kumas)',
      '  3. Bir huni veya agizli kaba yerlestirin',
      '  4. Suyu yavascat filtreden gecirin',
      '  5. Bulaniklik devam ederse tekrar filtreleyin',
      '',
      'TICARI FILTRE (0.2 mikron) YONTEMI:',
      '  1. Filtreyi talimatlara gore hazirlayın',
      '  2. Suyu filtreden gecirin',
      '  3. Filtrelenmis suyu temiz kaba toplayın',
      '  4. Virus riski varsa SONRASINDA kimyasal uygulayin'
    ],
    removes: ['Tortu ve askıda katilar (bez filtre)', 'Bakteriler (0.2 mikron ticari filtre)', 'Protozoa kistleri (ticari filtre)', 'Kum, calı, yaprak gibi buyuk partikuller'],
    doesNotRemove: ['Virusler (bez filtre ile -- KESINLIKLE)', 'Virusler (0.2 mikron filtreden gecebilir)', 'Kimyasal kirleticiler', 'Agir metaller', 'Tuz', 'Cozunmus mineraller'],
    warnings: [
      'Bez filtre virusleri GECIRMEZ -- mutlaka sonrasinda kaynatma veya kimyasal uygulanmali',
      '0.2 mikron filtre virusleri tam tutamaz -- kimyasal kombinasyon sart',
      'Filtre bezi her kullanimdan sonra yikanmali veya degistirilmeli',
      'Ticari filtrelerin omru vardir -- talimatlara uyun'
    ],
    sources: ['WHO Water Filter Guidelines', 'AFAD Acil Su Filtreleme', 'Saglik Bakanligi Su Kalite Rehberi', 'CDC Emergency Filtration'],
    expanded: false,
  },
  {
    id: 'damlatma',
    title: 'Damlama / Yogusturma',
    titleEn: 'Distillation (Solar Still)',
    icon: Droplets,
    iconColor: 'text-cyan-400',
    timeRequired: 'Yavas -- gunde 1-4 litre (kosullara bagli)',
    description: 'Gunes damıtıcı ile tuzlu, kirli veya kimyasal iceren su arıtilabilir. Topraga cukur acılıp uzerine plastik gerilir. En yavas ama EN TEMIZ sonucu verir.',
    steps: [
      'TOPRAKDA CUKUR KAZMA YONTEMI:',
      '  1. Toprakta 1 metre capinda, 60 cm derinliginde cukur kazin',
      '  2. Cukurun ortasına temiz bir kap yerlestirin',
      '  3. Cukurun cevrelerine taze bitki veya kirli su koyun (orta degil)',
      '  4. Cukurun uzerine seffaf plastik gerin',
      '  5. Plastik kenarlarini toprakla sabitleyin (hava kacmasin)',
      '  6. Plastigin ortasina (kapin ustune) kucuk tas koyun',
      '  7. Gun isiginda bekletin -- yogusma kapta toplanacak',
      '  8. Biriken suyu dikkatlice toplayin',
      '',
      'KAYNATMA YOĞUSTURMA (daha hizli):',
      '  1. Suyu bir kapta kaynatin',
      '  2. Buhari baska bir kapta yogusturun (kapak uzerinden)',
      '  3. Yogusan saf suyu toplayin'
    ],
    removes: ['Tuz (tuzlu suyu tatli suya cevirir)', 'Tum bakteriler, virusler, protozoalar', 'Agir metaller (kursun, civa, arsenik)', 'Kimyasal kirleticiler', 'Tortu ve partikuller', 'Neredeyse TUM kirleticiler'],
    doesNotRemove: ['Ucurucu organik bilesikler (kaynama noktasi suden dusukse)', 'Bazi pestisitler (dusuk kaynama noktalı)'],
    warnings: [
      'Cok YAVAS bir yontem -- acil durumda yeterli su saglanamayabilir',
      'Gunde sadece 1-4 litre arası uretim bekleyin',
      'Toprak cok kuru ise bitki malzemesi ekleyin',
      'Plastik yoksa alternatif kapak malzemesi kullanilabilir',
      'Ilk biriken suyu atin (kontamine olabilir)'
    ],
    sources: ['WHO Solar Distillation Guide', 'AFAD Alternatif Su Temini', 'Saglik Bakanligi Acil Su Rehberi', 'US Army Survival Manual'],
    expanded: false,
  },
];

function WaterMethodCard({ method, onToggle, onPrint }: { method: PurificationMethod; onToggle: () => void; onPrint: () => void }) {
  const Icon = method.icon;

  return (
    <Card className="border-nomad-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-nomad-bg ${method.iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{method.title}</CardTitle>
              <CardDescription>{method.titleEn}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-xs bg-nomad-bg text-nomad-slate border border-nomad-border">
              <Clock className="h-3 w-3 mr-1" />
              {method.timeRequired}
            </Badge>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-nomad-bg rounded transition-colors"
              aria-label={method.expanded ? 'Kapat' : 'Ac'}
            >
              {method.expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <p className="text-sm text-nomad-slate mt-2">{method.description}</p>
      </CardHeader>

      {method.expanded && (
        <CardContent className="space-y-6">
          {/* Steps */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-nomad-green text-white text-xs font-bold">1</span>
              Adımlar / Steps
            </h4>
            <ol className="space-y-2">
              {method.steps.filter(s => s.trim() !== '').map((step, i) => {
                const isSubStep = step.startsWith('  ');
                return (
                  <li key={i} className={`flex items-start gap-2 ${isSubStep ? 'ml-6 text-sm' : ''}`}>
                    {!isSubStep && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-nomad-surface border border-nomad-border flex items-center justify-center text-xs text-nomad-slate">
                        {i + 1}
                      </span>
                    )}
                    <span className={isSubStep ? 'text-nomad-slate' : 'text-sm'}>{step.trim()}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Removes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-950/20 border border-green-800/30 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Neleri Temizler / Removes
              </h4>
              <ul className="space-y-2">
                {method.removes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-300">
                    <Check className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-lg">
              <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <X className="h-4 w-4" />
                Neleri Temizlemez / Does NOT Remove
              </h4>
              <ul className="space-y-2">
                {method.doesNotRemove.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                    <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warnings */}
          {method.warnings && method.warnings.length > 0 && (
            <div className="p-4 bg-amber-950/20 border border-amber-800/30 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Uyariılar / Warnings
              </h4>
              <ul className="space-y-2">
                {method.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          <div className="p-3 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-xs font-semibold text-nomad-slate mb-2 flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              Kaynaklar / Sources
            </h4>
            <ul className="space-y-1">
              {method.sources.map((s, i) => (
                <li key={i} className="text-xs text-nomad-slate">{s}</li>
              ))}
            </ul>
          </div>

          {/* Print button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-3 w-3 mr-1" />
              Bu Yontemi Yazdir
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function generatePrintCard(method: PurificationMethod): string {
  let html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
  <title>Su Aritma - ${method.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #000; }
    h1 { font-size: 20px; border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
    h2 { font-size: 16px; margin-top: 16px; margin-bottom: 8px; }
    .warning { background: #fff3cd; border: 2px solid #ffc107; padding: 12px; margin: 12px 0; font-size: 14px; }
    ol { padding-left: 24px; }
    li { margin-bottom: 4px; font-size: 13px; }
    .removes { background: #e8f5e9; padding: 8px 12px; margin: 8px 0; border: 1px solid #4caf50; }
    .not-removes { background: #ffebee; padding: 8px 12px; margin: 8px 0; border: 1px solid #f44336; }
    .footer { margin-top: 24px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
    .time { font-size: 14px; font-weight: bold; margin: 8px 0; }
    @media print { body { margin: 0; } }
  </style></head><body>`;

  html += `<h1>${method.title} / ${method.titleEn}</h1>`;
  html += `<p class="time">Sure: ${method.timeRequired}</p>`;
  html += `<p>${method.description}</p>`;

  html += `<h2>Adımlar:</h2><ol>`;
  method.steps.filter(s => s.trim() !== '').forEach((s) => {
    html += `<li>${s.trim()}</li>`;
  });
  html += `</ol>`;

  html += `<div class="removes"><strong>Temizler:</strong> ${method.removes.join('; ')}</div>`;
  html += `<div class="not-removes"><strong>Temizlemez:</strong> ${method.doesNotRemove.join('; ')}</div>`;

  if (method.warnings) {
    html += `<div class="warning"><strong>UYARILAR:</strong><br>`;
    method.warnings.forEach((w) => { html += `- ${w}<br>`; });
    html += `</div>`;
  }

  html += `<div style="background:#f8d7da;border:2px solid #dc3545;padding:12px;margin:12px 0;font-weight:bold;font-size:15px;">UYARI: Su kalitesinden emin degilseniz icmeyin -- 112'yi arayin!</div>`;
  html += `<div class="footer">Kaynaklar: ${method.sources.join(', ')} -- PrepTurk</div>`;
  html += `</body></html>`;
  return html;
}

export default function SuAritmaPage() {
  const [methods, setMethods] = useState<PurificationMethod[]>(INITIAL_METHODS);
  const printRef = useRef<HTMLIFrameElement | null>(null);

  const toggleMethod = useCallback((id: string) => {
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, expanded: !m.expanded } : m));
  }, []);

  const printMethod = useCallback((method: PurificationMethod) => {
    const html = generatePrintCard(method);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 250);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Su Aritma Rehberi / Water Purification</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Acil durumlarda guvenli icme suyu elde etme yontemleri
        </p>
      </div>

      {/* Critical Warning */}
      <Card className="border-red-700 bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-bold text-red-400">KRITIK UYARI</p>
              <p className="text-sm text-red-300 mt-1">
                Su kalitesinden emin degilseniz icmeyin -- 112&apos;yi arayin. Temiz su bulana kadar minimal su tuketin.
              </p>
              <p className="text-xs text-nomad-slate mt-2">Kaynak: AFAD, Saglik Bakanligi, WHO</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                Insan gunluk en az <strong>3 litre</strong> temiz suya ihtiyac duyar. Yemek ve hijyen icin bu miktar artar.
                Su kaynaklari: musluk suyu, yagmur suyu, dogal kaynaklar (nehir, gol, dere). Her kaynagi arıtmadan icmeyin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick comparison table */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="text-base">Hızli Karsilastirma / Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nomad-border">
                  <th className="text-left py-2 px-2 text-nomad-slate font-medium">Yontem</th>
                  <th className="text-center py-2 px-2 text-nomad-slate font-medium">Sure</th>
                  <th className="text-center py-2 px-2 text-nomad-slate font-medium">Bakteri</th>
                  <th className="text-center py-2 px-2 text-nomad-slate font-medium">Virus</th>
                  <th className="text-center py-2 px-2 text-nomad-slate font-medium">Protozoa</th>
                  <th className="text-center py-2 px-2 text-nomad-slate font-medium">Kimyasal</th>
                  <th className="text-center py-2 px-2 text-nomad-slate font-medium">Tuz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Kaynatma', time: '1 dk', bak: true, vir: true, pro: true, chem: false, salt: false },
                  { name: 'Kimyasal', time: '30 dk', bak: true, vir: true, pro: true, chem: false, salt: false },
                  { name: 'SODIS', time: '6-48s', bak: true, vir: true, pro: true, chem: false, salt: false },
                  { name: 'Filtre', time: 'Anlik', bak: true, vir: false, pro: true, chem: false, salt: false },
                  { name: 'Damlama', time: 'Yavas', bak: true, vir: true, pro: true, chem: true, salt: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-nomad-border/50">
                    <td className="py-2 px-2 font-medium">{row.name}</td>
                    <td className="py-2 px-2 text-center text-nomad-slate">{row.time}</td>
                    <td className="py-2 px-2 text-center text-green-400"><Check className="h-4 w-4 inline" /></td>
                    <td className="py-2 px-2 text-center">{row.vir ? <Check className="h-4 w-4 inline text-green-400" /> : <X className="h-4 w-4 inline text-red-400" />}</td>
                    <td className="py-2 px-2 text-center text-green-400"><Check className="h-4 w-4 inline" /></td>
                    <td className="py-2 px-2 text-center">{row.chem ? <Check className="h-4 w-4 inline text-green-400" /> : <X className="h-4 w-4 inline text-red-400" />}</td>
                    <td className="py-2 px-2 text-center">{row.salt ? <Check className="h-4 w-4 inline text-green-400" /> : <X className="h-4 w-4 inline text-red-400" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Methods */}
      <div>
        <h2 className="text-lg font-bold mb-4">Aritma Yontemleri / Purification Methods</h2>
        <div className="space-y-4">
          {methods.map((method) => (
            <WaterMethodCard
              key={method.id}
              method={method}
              onToggle={() => toggleMethod(method.id)}
              onPrint={() => printMethod(method)}
            />
          ))}
        </div>
      </div>

      {/* Print All */}
      <div className="flex justify-center pb-8">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            methods.forEach((m) => printMethod(m));
          }}
        >
          <Printer className="h-4 w-4 mr-2" />
          Tum Yontemleri Yazdir
        </Button>
      </div>
    </div>
  );
}
