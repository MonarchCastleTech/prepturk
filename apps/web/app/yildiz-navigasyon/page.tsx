'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Star, Sun, Moon, Compass, Printer, Info, ChevronDown, ChevronUp,
  Eye, Clock, MapPin, Lightbulb, ArrowRight
} from 'lucide-react';

interface NavMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  description: string;
  howTo: string[];
  turkeyContext: string;
  diagram?: string;
  tips: string[];
  bestTime: string;
}

const METHODS: NavMethod[] = [
  {
    id: 'polaris',
    name: 'Kutup Yildizi (Polaris)',
    nameEn: 'North Star (Polaris)',
    icon: <Star className="h-7 w-7 text-yellow-300" />,
    description: 'Kutup Yildizi (Polaris) her zaman Kuzey\'i gosterir. Turkiye\'de (36-42K enlemlerinde) yil boyunca gorulebilir.',
    howTo: [
      'Coban Yildizi (Big Dipper) bulun -- kucuk ayi seklinde 7 yildiz',
      'Coban Yildizi\'nin "kase" kismindaki son iki yildizi bulun (dis kenar)',
      'Bu iki yildizi birlestiren cizgiyi 5 kat uzatin',
      'Bu cizginin sonunda parlak bir yildiz goreceksiniz -- bu Polaris',
      'Polaris\'in oldugu yon KUZEU\'dir',
      'Polaris\'e baktiginizda: Sag = Dogu, Sol = Bati, Arka = Guney',
    ],
    turkeyContext: 'Turkiye\'de Polaris, ufuktan yaklasik 36-42 derece yukselikte gorunur (enlemimize esit). Istanbul\'da ~41 derece, Antalya\'da ~36 derece.',
    tips: [
      'Polaris cok parlak degildir -- Coban Yildizi ile bulmak en kolay yoldur',
      'Kuzey Yarim Kure\'de her zaman gorunur (hava aciksa)',
      'Polaris\'e bakarak Kuzey\'i 1 derece hassasiyetle bulabilirsiniz',
      'Bulutlu hava veya isik kirliligi gorunurlugu azaltir',
    ],
    bestTime: 'Yil boyunca, gece, acik hava',
  },
  {
    id: 'sun-position',
    name: 'Gunes Pozisyonu',
    nameEn: 'Sun Position Method',
    icon: <Sun className="h-7 w-7 text-orange-400" />,
    description: 'Turkiye 36-42K enlemlerinde oldugu icin, oglen vakti Gunes her zaman GUNEY\'de olur. Golge KUZEU\'yu gosterir.',
    howTo: [
      'Oglen vakti (12:00-13:00) Gunes\'in oldugu yon GUNEY\'dir',
      'Golgeniz KUZEU\'yu gosterir',
      'Sabah (06:00 civari): Gunes DOGU\'da dogar',
      'Aksam (18:00 civari): Gunes BATI\'da batar',
      'Kis gunundogusu: Guneydogu, batar: Guneybati',
      'Yaz gunundogusu: Kuzeydogu, batar: Kuzeybati',
    ],
    turkeyContext: 'Turkiye UTC+3 saat diliminde. Gercek oglen saati yaz saati uygulamasi nedeniyle 13:00 civarindadir. Golge oglen en kisa oldugu anda tam kuzeyi gosterir.',
    tips: [
      'Golgeniz solunuzdaysa: Yuzunuz guney, arkaniz kuzey',
      'Golgeniz saginizdaysa: Yuzunuz kuzey, arkaniz guney',
      'Sabah: Gunes solunuzda -> yuzunuz kuzey',
      'Aksam: Gunes saginizda -> yuzunuz kuzey',
    ],
    bestTime: 'Gunduz, ozellikle oglen vakti',
  },
  {
    id: 'stick-shadow',
    name: 'Cop Golge Yontemi',
    nameEn: 'Stick Shadow Method',
    icon: <Compass className="h-7 w-7 text-amber-400" />,
    description: 'Yere bir cop dikin, golge ucunu isaretleyin. 15 dakika sonra tekrar isaretleyin. Cizgi DOGU-BATI yonundedir.',
    howTo: [
      'Duz bir zemine 60-100 cm uzunlugunda bir cop veya dal dikin',
      'Golgenin ucuna bir tas veya isaret koyun (1. isaret)',
      'En az 15 dakika bekleyin (golge hareket edecek)',
      'Golgenin yeni ucunu isaretleyin (2. isaret)',
      'Iki isareti birlestiren cizgi DOGU-BATI cizgisidir',
      'Ilk isaret BATI, ikinci isaret DOGU\'dur',
      'Bu cizgiye dik olan cizgi KUZEU-GUNEY cizgisidir',
    ],
    turkeyContext: 'Turkiye\'de bu yontem sabah 09:00 - ogleden sonra 15:00 arasinda en dogru sonuclari verir. Oglen civarinda golgeler daha kisa oldugu icin daha hassas okuma yapilabilir.',
    tips: [
      'Ne kadar uzun beklerseniz (30-60 dk), o kadar dogru olur',
      'Daha uzun cop = daha uzun golge = daha kolay okuma',
      'Golgesi dusmeyen bulutlu gunlerde calismaz',
      'Egitimli zeminde dogruluk azalir -- duz zemin bulun',
    ],
    bestTime: 'Gunduz, 09:00-15:00, acik hava',
  },
  {
    id: 'moon-phase',
    name: 'Ay Fazlari ile Navigasyon',
    nameEn: 'Moon Phase Navigation',
    icon: <Moon className="h-7 w-7 text-blue-300" />,
    description: 'Ay\'in fazina gore yon bulabilirsiniz. Artan Ay: sag taraf aydinlik, gece yarısından sonra batar. Eksilen Ay: sol taraf aydinlik, gece yarısından sonra dogar.',
    howTo: [
      'Ay\'in seklini gozlemleyin:',
      '  - Artan Ay (hilal): Sag taraf aydinlik -- DOGU\'ya bakar',
      '  - Dolunay: Tam aydinlik -- Gunes\'in karsisinda',
      '  - Eksilen Ay: Sol taraf aydinlik -- BATI\'ya bakar',
      'Artan Ay: Gunes batarak doguda gorunur, gece oncesi batar',
      'Dolunay: Gunes batarak dogar, sabah batar',
      'Eksilen Ay: Gece yarisinda dogar, sabah batida gorunur',
    ],
    turkeyContext: 'Turkiye\'de Ay guney gokyuzunden gecer. Ay\'in en yuksek noktasi (culmination) guney yonunu gosterir. Turkiye enlemlerinde Ay, ufuktan maksimum 36-42 derece yukselir.',
    tips: [
      'Dolunay geceleri gok yuzu aydinlik olur -- yildiz navigasyonu zorlasir',
      'Yeni Ay geceleri gok yuzu karanlik -- yildizlar daha iyi gorunur',
      'Ay dogarken ve batarken yon bulma icin en iyi zamandir',
      'Ay\'in golgesi de yon belirlemek icin kullanilabilir (Gunes gibi)',
    ],
    bestTime: 'Gece, Ay gorunur oldugunda',
  },
  {
    id: 'watch-method',
    name: 'Saat Yontemi',
    nameEn: 'Watch Method',
    icon: <Clock className="h-7 w-7 text-purple-400" />,
    description: 'Analog saat kullanarak yon bulun. Akrep\'i Gunes\'e dogru cevirin. Akrep ile 12 arasindaki aci GUNEY\'i gosterir.',
    howTo: [
      'Analog saatinizi (akrep-kollu) yatay tutun',
      'Akrebi Gunes\'e dogru cevirin (Gunes\'e isaret ettirin)',
      'Akrep ile 12 sayisi arasindaki acinin ortasi GUNEY\'dir',
      'Gunenin karsi tarafi KUZEU\'dur',
      'Ogleden sonra (12:00 sonra): Akrep ile 12 arasindaki kucuk aciyi bulun',
      'Ogleden once: Ayni yontem, farkli taraf',
    ],
    turkeyContext: 'Turkiye UTC+3 saat diliminde oldugu icin, gercek gunes zamani ile saat zamani arasinda yaklasik 1-2 saat fark vardir. Yaz saati uygulamasinda bu fark daha fazladir. Dogru sonuc icin saati 1 saat geri alin (UTC+2).',
    tips: [
      'Dijital saat is ise: yere bir cizgi cizin ve saat yelpazesi yapin',
      'Kuzey Yarim Kure\'de bu yontem calisir',
      'Ekvatora yaklastikca dogruluk azalir',
      'Oglen vakti en az dogru cunku Gunes tam tepede',
      'Bulutlu gunlerde calismaz',
    ],
    bestTime: 'Gunduz, Gunes gorunur oldugunda, sabah veya aksam',
  },
  {
    id: 'emergency-direction',
    name: 'Acil Durum Yon Bulma',
    nameEn: 'Emergency Direction Finding',
    icon: <Eye className="h-7 w-7 text-red-400" />,
    description: 'Arac veya alet olmadan yon bulma: doga belirtilerini kullanarak.',
    howTo: [
      'Agac yosunlari: Genellikle KUZEU yonunde daha yogun (nemli taraf)',
      'Karincalar: Yuvalari genellikle GUNEY yonunde (sicak taraf)',
      'Agac govdesi: Kabuk KUZEU yonunde daha kalin ve nemli',
      'Yapraklar: GUNEY yonunde daha yesil ve yogun',
      'Kardan erime: GUNEY yamaclarda daha hizli erir',
      'Evler ve binalar: Cati panelleri ve gunes panelleri GUNEY yonunde',
      'Uydu antenleri: GUNEY yonunde (Turkiye\'de Gunes uydularina)',
    ],
    turkeyContext: 'Turkiye\'de hakim ruzgarlar genellikle kuzeyden (Poyraz) ve guneyden (Lodos) eser. Agaclardaki egilme yonu hakim ruzgar yonunu gosterir. Karadeniz bolgesinde kuzey yonundeki yosunlar daha belirgindir.',
    tips: [
      'Bu yontemler yaklasik yon verir -- hassas degildir',
      'Birden fazla belirti kullanin ve ortalamasini alin',
      'Bolgeye gore farklilik gosterir (mikroklima)',
      'Sehir icinde binalar ve yollar daha guvenli yon gosterir',
      'Cep telefonunuzun pusulasi calisiyorsa en dogru sonuc odur',
    ],
    bestTime: 'Her zaman, ancak en az dogru yontemdir',
  },
];

export default function YildizNavigasyonPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  const selected = METHODS.find((m) => m.id === selectedMethod);

  if (showPrintView) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">Yildiz Navigasyon -- Referans Karti</h1>
          <p className="text-sm text-gray-600">Celestial Navigation Reference Card -- Turkiye (36-42K)</p>
        </div>

        {METHODS.map((method) => (
          <div key={method.id} className="border border-gray-300 p-4 page-break-inside-avoid">
            <h2 className="text-lg font-bold">{method.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{method.nameEn}</p>
            <ol className="list-decimal pl-6 text-sm space-y-1">
              {method.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))}

        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-300">
          PrepTurk Yildiz Navigasyon -- {new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-7 w-7 text-yellow-300" />
            Yildiz Navigasyon
          </h1>
          <p className="text-nomad-slate text-sm">Celestial Navigation Guide -- Turkiye (36-42K Enlem)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPrintView(true)}>
            <Printer className="h-4 w-4 mr-1" />
            Referans Karti
          </Button>
        </div>
      </div>

      {/* Location Context */}
      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-3 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-nomad-green flex-shrink-0" />
          <span className="text-nomad-slate">
            Turkiye: 36-42 derece Kuzey enlemi. Polaris ufuktan 36-42 derece yukselikte gorunur.
            Gunes oglen her zaman guneyde, golge kuzeyi gosterir.
          </span>
        </CardContent>
      </Card>

      {/* Method Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id === selectedMethod ? null : method.id)}
            className={`p-4 rounded-lg border text-center transition-all ${
              selectedMethod === method.id
                ? 'border-nomad-green bg-nomad-green/10'
                : 'border-nomad-border bg-nomad-surface hover:border-nomad-green/30'
            }`}
          >
            <div className="flex justify-center mb-2">{method.icon}</div>
            <p className="text-sm font-medium">{method.name.split('(')[0].trim()}</p>
            <p className="text-xs text-nomad-slate">{method.nameEn.split('(')[0].trim()}</p>
          </button>
        ))}
      </div>

      {/* Selected Method Detail */}
      {selected && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {selected.icon}
              <div>
                <span>{selected.name}</span>
                <p className="text-sm text-nomad-slate font-normal">{selected.nameEn}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground">{selected.description}</p>

            {/* How To */}
            <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-nomad-green" />
                Nasil Yapilir / How To
              </h4>
              <ol className="space-y-2">
                {selected.howTo.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Turkey Context */}
            <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-300 mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Turkiye Baglami / Turkey Context
              </h4>
              <p className="text-sm text-blue-200">{selected.turkeyContext}</p>
            </div>

            {/* Tips */}
            <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
              <h4 className="text-sm font-semibold mb-3">Ipuclari / Tips</h4>
              <ul className="space-y-2">
                {selected.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-nomad-green flex-shrink-0 mt-1" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Time */}
            <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-300 mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En İyi Zaman / Best Time
              </h4>
              <p className="text-sm text-amber-200">{selected.bestTime}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reference Card */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardHeader>
          <CardTitle>Hizli Basvuru / Quick Reference</CardTitle>
          <CardDescription>Tum yontemlerin ozeti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {METHODS.map((method) => (
              <div key={method.id} className="p-3 bg-nomad-surface rounded-lg border border-nomad-border">
                <div className="flex items-center gap-2 mb-1">
                  {method.icon}
                  <h4 className="font-medium">{method.name.split('(')[0].trim()}</h4>
                </div>
                <p className="text-xs text-nomad-slate mb-1">{method.nameEn.split('(')[0].trim()}</p>
                <p className="text-xs text-nomad-slate">
                  {method.bestTime}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Star Diagram Description */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-300" />
            Coban Yildizi ve Polaris Diyagrami
          </CardTitle>
          <CardDescription>Big Dipper and Polaris Star Diagram Description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-semibold mb-3">Coban Yildizi (Big Dipper) Sekli</h4>
            <pre className="text-xs text-nomad-slate font-mono overflow-x-auto">
{`        (Dubhe) *-----------* (Merak)
                     |           |
                     |           |
        (Phecda) *---*-----------* (Megrez)
                     |
                     |
        (Alioth) *---*-----------* (Mizar)
                     |
                     |
                     * (Alkaid)

  Kaseyi olusturan son iki yildiz (Dubhe ve Merak)
  arasindaki cizgiyi 5 kat uzatin --> Polaris!

  Polaris (Kutup Yildizi)
        *
       /
      / 5x mesafe
     /
    * (Dubhe)
`}
            </pre>
          </div>

          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-semibold mb-3">Yon Pusulasi / Direction Compass</h4>
            <pre className="text-xs text-nomad-slate font-mono text-center">
{`            KUZEU (North)
                ↑
                | Polaris
                |
                |
BATI (West) ←---+---> DOGU (East)
                |
                |
                |
            GUNEY (South)
                ↓
              (Gunes oglen)
`}
            </pre>
          </div>

          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-semibold mb-3">Ay Fazlari / Moon Phases</h4>
            <pre className="text-xs text-nomad-slate font-mono text-center">
{`Yeni Ay    -->  (      --> Gorunmez
  |
  v
Artan Ay   -->  )      --> Sag aydinlik, dogu yonu
  |
  v
Dolunay    -->  (O)     --> Tam aydinlik, gunes karsisi
  |
  v
Eksilen Ay -->  (      --> Sol aydinlik, bati yonu
  |
  v
Yeni Ay    -->  (      --> Dongu basa doner
`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-nomad-border">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Onemli Not / Important Note</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Yildiz navigasyon yontemleri binlerce yildir kullanilmaktadir. Turkiye'nin kuzey yarim kuredeki konumu (36-42K),
            Polaris'in her zaman gorunur olmasini saglar. Bu yontemler GPS olmadiginda veya calismadiginda
            yon bulmak icin guvenilirdir. Ancak hassasiyetleri profesyonel navigasyon cihazlari kadar degildir.
          </p>
          <p className="text-xs text-nomad-slate">
            (Star navigation methods have been used for thousands of years. Turkey's northern hemisphere position (36-42N)
            ensures Polaris is always visible. These methods are reliable for direction finding when GPS is unavailable,
            but their accuracy is not as high as professional navigation devices.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
