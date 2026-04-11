'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Droplets, Flame, Sun, FlaskConical, Filter, Printer, ChevronDown, ChevronUp, AlertTriangle, Check, X, Clock, BookOpen, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    timeRequired: '1 dakika (2000m üzerinde 3 dakika)',
    description: 'Suyu kaynatmak en güvenilir ve en kolay su arıtma yöntemidir. Bakteri, virüs ve protozoaları öldürür.',
    steps: [
      'Suyu temiz bir kaba koyun (mümkünse metal kap)',
      'Suyu güçlü bir ateşte kaynama noktasına getirin',
      'Su kaynamaya başlayınca 1 dakika boyunca kaynatmaya devam edin',
      'Rakım 2000 metrenin üzerindeyse 3 dakika kaynatın',
      'Suyu soğumaya bırakın (üzerini kapatın)',
      'Soğuduktan sonra temiz bir kaba aktarın',
      'Tatlandırmak için bir tutam tuz ekleyin (isteğe bağlı)'
    ],
    removes: ['Bakteriler (E. coli, Salmonella, vs.)', 'Virüsler (Hepatit A, Rotavirus, vs.)', 'Protozoalar (Giardia, Cryptosporidium, vs.)'],
    doesNotRemove: ['Kimyasal kirleticiler (pestisitler, ağır metaller)', 'Tuz (tuzlu su için uygun değil)', 'Ağır metaller (kurşun, cıva, arsenik)', 'Tortu ve bulanıklık (ön filtreleme gerekli)'],
    warnings: ['Kaynatma yakıt gerektirir -- kaynaklar sınırlı olabilir', 'Su çok bulanıksa önce bezden geçirin', 'Kaptaki su soğuduktan sonra tüketin'],
    sources: ['AFAD Su Güvenliği Kılavuzu', 'Dünya Sağlık Örgütü (WHO)', 'Sağlık Bakanlığı Halk Sağlığı Rehberi'],
    expanded: false,
  },
  {
    id: 'kimyasal',
    title: 'Kimyasal Arıtma',
    titleEn: 'Chemical Treatment',
    icon: FlaskConical,
    iconColor: 'text-purple-400',
    timeRequired: '30-60 dakika',
    description: 'Klor dioksit veya iyot tabletleri ile suyun içindeki patojenler yok edilir. Taşınması kolaydır ve yakıt gerektirmez.',
    steps: [
      'Suyu mümkünse öncelikle bir bezden geçirerek tortuyu alın',
      'Klor dioksit tableti: 1 litre suya 1 tablet ekleyin',
      'İyot: 1 litre suya 5 damla iyot tentürdiyot ekleyin',
      'Kabı kapatın ve 30 saniye çalkalayın',
      'Kapakta kalan ilacın çözülmesi için kabı ters çevirin',
      '30 dakika bekleyin (su soğuksa 60 dakika)',
      'Suyu tüketime hazırdır'
    ],
    removes: ['Çoğu bakteri ve virüs', 'Protozoa kistleri (klor dioksit ile)', 'Hepatit A virüsü', 'Kolera bakterisi'],
    doesNotRemove: ['Cryptosporidium (iyot ile etkisiz)', 'Ağır metaller', 'Kimyasal kirleticiler', 'Tortu ve partiküller', 'Tuz'],
    warnings: [
      'HAMİLE KADINLAR için iyot KULLANMAYIN',
      'Tiroid hastalığı olanlar iyot kullanmamalıdır',
      'İyotlu suyun tadı C vitamini tozu ile nötralize edilebilir',
      'Su 10°C altındaysa bekleme süresini 60 dakikaya çıkarın'
    ],
    sources: ['AFAD Acil Durum Rehberi', 'WHO Emergency Water Treatment', 'CDC Water Disinfection Guide'],
    expanded: false,
  },
  {
    id: 'sodis',
    title: 'SODIS (Güneşle Dezenfeksiyon)',
    titleEn: 'Solar Disinfection',
    icon: Sun,
    iconColor: 'text-yellow-400',
    timeRequired: '6-48 saat',
    description: 'Güneşin UV-A ışınları ve ısı etkisiyle sudaki patojenler yok edilir. Enerji gerektirmez, PET şişelerle uygulanır.',
    steps: [
      'Sadece ŞEFFAF PET şişe kullanın (cam veya renkli plastik ÇALIŞMAZ)',
      'Şişeyi su ile doldurun (üstte 2 cm boşluk bırakın)',
      'Kapağını sıkıca kapatın',
      'Şişeyi 30 saniye çalkalayın (oksijen seviyesini artırır)',
      'Şişeyi YATAY olarak güneş ışığı alan bir yere yerleştirin',
      'Güneşli havada 6 saat, bulutlu havada 48 saat bekletin',
      'Süre sonunda su içmeye hazırdır'
    ],
    removes: ['Bakteriler', 'Virüsler', 'Protozoa kistleri'],
    doesNotRemove: ['Kimyasal kirleticiler', 'Ağır metaller', 'Tuz', 'Cam veya renkli şişelerde etkisizdir'],
    warnings: [
      'CAM ŞİŞELERDE ÇALIŞMAZ',
      'Su çok bulanıksa önce filtreleyin',
      'Sıcaklık 50°C üzerine çıkarsa etki artar'
    ],
    sources: ['WHO SODIS Guidelines', 'AFAD Alternatif Su Yöntemleri'],
    expanded: false,
  },
];

function WaterMethodCard({ method, onToggle, onPrint }: { method: PurificationMethod; onToggle: () => void; onPrint: () => void }) {
  const Icon = method.icon;

  return (
    <Card className="border-white/8 bg-white/[0.02]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-black/20 ${method.iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-white">{method.title}</CardTitle>
              <CardDescription className="text-slate-400">{method.titleEn}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              <Clock className="h-3 w-3 mr-1" />
              {method.timeRequired}
            </Badge>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-white/5 rounded transition-colors text-slate-400"
            >
              {method.expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {method.expanded && (
        <CardContent className="space-y-6 pt-4 border-t border-white/5">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              Adımlar / Steps
            </h4>
            <ol className="space-y-2">
              {method.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Temizler</h4>
              <ul className="space-y-2">
                {method.removes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-emerald-200/80">
                    <Check className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Temizlemez</h4>
              <ul className="space-y-2">
                {method.doesNotRemove.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-200/80">
                    <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-1">
              {method.sources.slice(0, 2).map((s, i) => (
                <Badge key={i} variant="secondary" className="text-[9px] bg-white/5 text-slate-400 border-none">
                  {s}
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={onPrint} className="text-xs h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10">
              <Printer className="h-3 w-3 mr-1" />
              Yazdır
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function SuAritmaPage() {
  const [methods, setMethods] = useState<PurificationMethod[]>(INITIAL_METHODS);

  const toggleMethod = (id: string) => {
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, expanded: !m.expanded } : m));
  };

  const printMethod = (method: PurificationMethod) => {
    // Basic print logic
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/5">
          Kritik Bilgi
        </Badge>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Su Arıtma Rehberi</h1>
        <p className="text-slate-400">Acil durumlarda güvenli içme suyu elde etme yöntemleri.</p>
      </header>

      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400 uppercase tracking-tight">Kritik Uyarı</h3>
              <p className="text-sm text-red-200/80 mt-1 leading-relaxed">
                Su kalitesinden emin değilseniz içmeyin. Temiz su bulana kadar tüketimi minimumda tutun. 
                Şüpheli durumlarda mutlaka 112'yi bilgilendirin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {methods.map((method) => (
          <WaterMethodCard
            key={method.id}
            method={method}
            onToggle={() => toggleMethod(method.id)}
            onPrint={() => printMethod(method)}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center">
        <Droplets className="h-10 w-10 text-emerald-500/40 mx-auto mb-4" />
        <h3 className="text-white font-semibold">Tüm Rehberi Hazırla</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          Cihaz şarjı bitmeden önce tüm arıtma yöntemlerini kağıda dökmeniz önerilir.
        </p>
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8">
          <Printer className="h-4 w-4 mr-2" />
          Tam Listeyi Yazdır
        </Button>
      </div>
    </div>
  );
}
