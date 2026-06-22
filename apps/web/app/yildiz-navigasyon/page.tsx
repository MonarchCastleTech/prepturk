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
    name: 'Kutup Yıldızı (Polaris)',
    nameEn: 'North Star (Polaris)',
    icon: <Star className="h-7 w-7 text-yellow-300" />,
    description: 'Kutup Yıldızı (Polaris) her zaman Kuzey\'i gösterir. Türkiye\'de (36-42K enlemlerinde) yıl boyunca görülebilir.',
    howTo: [
      'Çoban Yıldızı (Big Dipper) bulun -- küçük ayı şeklinde 7 yıldız',
      'Çoban Yıldızı\'nın "kase" kısmındaki son iki yıldızı bulun (dış kenar)',
      'Bu iki yıldızı birleştiren çizgiyi 5 kat uzatın',
      'Bu çizginin sonunda parlak bir yıldız göreceksiniz -- bu Polaris',
      'Polaris\'in olduğu yön KUZEY\'dir',
      'Polaris\'e baktığınızda: Sağ = Doğu, Sol = Batı, Arka = Güney',
    ],
    turkeyContext: 'Türkiye\'de Polaris, ufuktan yaklaşık 36-42 derece yükseklikte görünür (enlemimize eşit). İstanbul\'da ~41 derece, Antalya\'da ~36 derece.',
    tips: [
      'Polaris çok parlak değildir -- Çoban Yıldızı ile bulmak en kolay yoldur',
      'Kuzey Yarım Küre\'de her zaman görünür (hava açıksa)',
      'Polaris\'e bakarak Kuzey\'i 1 derece hassasiyetle bulabilirsiniz',
      'Bulutlu hava veya ışık kirliliği görünürlüğü azaltır',
    ],
    bestTime: 'Yıl boyunca, gece, açık hava',
  },
  {
    id: 'sun-position',
    name: 'Güneş Pozisyonu',
    nameEn: 'Sun Position Method',
    icon: <Sun className="h-7 w-7 text-orange-400" />,
    description: 'Türkiye 36-42K enlemlerinde olduğu için, öğlen vakti Güneş her zaman GÜNEY\'de olur. Gölge KUZEY\'i gösterir.',
    howTo: [
      'Öğlen vakti (12:00-13:00) Güneş\'in olduğu yön GÜNEY\'dir',
      'Gölgeniz KUZEY\'i gösterir',
      'Sabah (06:00 civarı): Güneş DOĞU\'da doğar',
      'Akşam (18:00 civarı): Güneş BATI\'da batar',
      'Kış günündoğusu: Güneydoğu, batar: Güneybatı',
      'Yaz günündoğusu: Kuzeydoğu, batar: Kuzeybatı',
    ],
    turkeyContext: 'Türkiye UTC+3 saat diliminde. Gerçek öğlen saati yaz saati uygulaması nedeniyle 13:00 civarındadır. Gölge öğlen en kısa olduğu anda tam kuzeyi gösterir.',
    tips: [
      'Gölgeniz solunuzdaysa: Yüzünüz güney, arkanız kuzey',
      'Gölgeniz sağınızdaysa: Yüzünüz kuzey, arkanız güney',
      'Sabah: Güneş solunuzda -> yüzünüz kuzey',
      'Akşam: Güneş sağınızda -> yüzünüz kuzey',
    ],
    bestTime: 'Gündüz, özellikle öğlen vakti',
  },
  {
    id: 'stick-shadow',
    name: 'Çöp Gölge Yöntemi',
    nameEn: 'Stick Shadow Method',
    icon: <Compass className="h-7 w-7 text-amber-400" />,
    description: 'Yere bir çöp dikin, gölge ucunu işaretleyin. 15 dakika sonra tekrar işaretleyin. Çizgi DOĞU-BATI yönündedir.',
    howTo: [
      'Düz bir zemine 60-100 cm uzunluğunda bir çöp veya dal dikin',
      'Gölgenin ucuna bir taş veya işaret koyun (1. işaret)',
      'En az 15 dakika bekleyin (gölge hareket edecek)',
      'Gölgenin yeni ucunu işaretleyin (2. işaret)',
      'İki işareti birleştiren çizgi DOĞU-BATI çizgisidir',
      'İlk işaret BATI, ikinci işaret DOĞU\'dur',
      'Bu çizgiye dik olan çizgi KUZEY-GÜNEY çizgisidir',
    ],
    turkeyContext: 'Türkiye\'de bu yöntem sabah 09:00 - öğleden sonra 15:00 arasında en doğru sonuçları verir. Öğlen civarında gölgeler daha kısa olduğu için daha hassas okuma yapılabilir.',
    tips: [
      'Ne kadar uzun beklerseniz (30-60 dk), o kadar doğru olur',
      'Daha uzun çöp = daha uzun gölge = daha kolay okuma',
      'Gölgesi düşmeyen bulutlu günlerde çalışmaz',
      'Eğimli zeminde doğruluk azalır -- düz zemin bulun',
    ],
    bestTime: 'Gündüz, 09:00-15:00, açık hava',
  },
  {
    id: 'moon-phase',
    name: 'Ay Fazları ile Navigasyon',
    nameEn: 'Moon Phase Navigation',
    icon: <Moon className="h-7 w-7 text-blue-300" />,
    description: 'Ay\'ın fazına göre yön bulabilirsiniz. Artan Ay: sağ taraf aydınlık, gece yarısından sonra batar. Eksilen Ay: sol taraf aydınlık, gece yarısından sonra doğar.',
    howTo: [
      'Ay\'ın şeklini gözlemleyin:',
      '  - Artan Ay (hilal): Sağ taraf aydınlık -- DOĞU\'ya bakar',
      '  - Dolunay: Tam aydınlık -- Güneş\'in karşısında',
      '  - Eksilen Ay: Sol taraf aydınlık -- BATI\'ya bakar',
      'Artan Ay: Güneş batarak doğuda görünür, gece öncesi batar',
      'Dolunay: Güneş batarak doğar, sabah batar',
      'Eksilen Ay: Gece yarısında doğar, sabah batıda görünür',
    ],
    turkeyContext: 'Türkiye\'de Ay güney gökyüzünden geçer. Ay\'ın en yüksek noktası (culmination) güney yönünü gösterir. Türkiye enlemlerinde Ay, ufuktan maksimum 36-42 derece yükselir.',
    tips: [
      'Dolunay geceleri gök yüzü aydınlık olur -- yıldız navigasyonu zorlaşır',
      'Yeni Ay geceleri gök yüzü karanlık -- yıldızlar daha iyi görünür',
      'Ay doğarken ve batarken yön bulma için en iyi zamandır',
      'Ay\'ın gölgesi de yön belirlemek için kullanılabilir (Güneş gibi)',
    ],
    bestTime: 'Gece, Ay görünür olduğunda',
  },
  {
    id: 'watch-method',
    name: 'Saat Yöntemi',
    nameEn: 'Watch Method',
    icon: <Clock className="h-7 w-7 text-purple-400" />,
    description: 'Analog saat kullanarak yön bulun. Akrep\'i Güneş\'e doğru çevirin. Akrep ile 12 arasındaki açı GÜNEY\'i gösterir.',
    howTo: [
      'Analog saatinizi (akrep-kollu) yatay tutun',
      'Akrebi Güneş\'e doğru çevirin (Güneş\'e işaret ettirin)',
      'Akrep ile 12 sayısı arasındaki açının ortası GÜNEY\'dir',
      'Güneşin karşı tarafı KUZEY\'dir',
      'Öğleden sonra (12:00 sonra): Akrep ile 12 arasındaki küçük açıyı bulun',
      'Öğleden önce: Aynı yöntem, farklı taraf',
    ],
    turkeyContext: 'Türkiye UTC+3 saat diliminde olduğu için, gerçek güneş zamanı ile saat zamanı arasında yaklaşık 1-2 saat fark vardır. Yaz saati uygulamasında bu fark daha fazladır. Doğru sonuç için saati 1 saat geri alın (UTC+2).',
    tips: [
      'Dijital saat ise: yere bir çizgi çizin ve saat yelpazesi yapın',
      'Kuzey Yarım Küre\'de bu yöntem çalışır',
      'Ekvatora yaklaştıkça doğruluk azalır',
      'Öğlen vakti en az doğru çünkü Güneş tam tepede',
      'Bulutlu günlerde çalışmaz',
    ],
    bestTime: 'Gündüz, Güneş görünür olduğunda, sabah veya akşam',
  },
  {
    id: 'emergency-direction',
    name: 'Acil Durum Yön Bulma',
    nameEn: 'Emergency Direction Finding',
    icon: <Eye className="h-7 w-7 text-red-400" />,
    description: 'Araç veya alet olmadan yön bulma: doğa belirtilerini kullanarak.',
    howTo: [
      'Ağaç yosunları: Genellikle KUZEY yönünde daha yoğun (nemli taraf)',
      'Karıncalar: Yuvaları genellikle GÜNEY yönünde (sıcak taraf)',
      'Ağaç gövdesi: Kabuk KUZEY yönünde daha kalın ve nemli',
      'Yapraklar: GÜNEY yönünde daha yeşil ve yoğun',
      'Kardan erime: GÜNEY yamaçlarda daha hızlı erir',
      'Evler ve binalar: Çatı panelleri ve güneş panelleri GÜNEY yönünde',
      'Uydu antenleri: GÜNEY yönünde (Türkiye\'de Güneş uydularına)',
    ],
    turkeyContext: 'Türkiye\'de hakim rüzgarlar genellikle kuzeyden (Poyraz) ve güneyden (Lodos) eser. Ağaçlardaki eğilme yönü hakim rüzgar yönünü gösterir. Karadeniz bölgesinde kuzey yönündeki yosunlar daha belirgindir.',
    tips: [
      'Bu yöntemler yaklaşık yön verir -- hassas değildir',
      'Birden fazla belirti kullanın ve ortalamasını alın',
      'Bölgeye göre farklılık gösterir (mikroklima)',
      'Şehir içinde binalar ve yollar daha güvenli yön gösterir',
      'Cep telefonunuzun pusulası çalışıyorsa en doğru sonuç odur',
    ],
    bestTime: 'Her zaman, ancak en az doğru yöntemdir',
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
          <h1 className="text-2xl font-bold">Yıldız Navigasyon -- Referans Kartı</h1>
          <p className="text-sm text-gray-600">Celestial Navigation Reference Card -- Türkiye (36-42K)</p>
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
          PrepTürk Yıldız Navigasyon -- {new Date().toLocaleDateString('tr-TR')}
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
            Yıldız Navigasyon
          </h1>
          <p className="text-nomad-slate text-sm">Celestial Navigation Guide -- Türkiye (36-42K Enlem)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPrintView(true)}>
            <Printer className="h-4 w-4 mr-1" />
            Referans Kartı
          </Button>
        </div>
      </div>

      {/* Location Context */}
      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-3 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-nomad-green flex-shrink-0" />
          <span className="text-nomad-slate">
            Türkiye: 36-42 derece Kuzey enlemi. Polaris ufuktan 36-42 derece yükseklikte görünür.
            Güneş öğlen her zaman güneyde, gölge kuzeyi gösterir.
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
                Nasıl Yapılır / How To
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
                Türkiye Bağlamı / Turkey Context
              </h4>
              <p className="text-sm text-blue-200">{selected.turkeyContext}</p>
            </div>

            {/* Tips */}
            <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
              <h4 className="text-sm font-semibold mb-3">İpuçları / Tips</h4>
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
          <CardTitle>Hızlı Başvuru / Quick Reference</CardTitle>
          <CardDescription>Tüm yöntemlerin özeti</CardDescription>
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
            Çoban Yıldızı ve Polaris Diyagramı
          </CardTitle>
          <CardDescription>Big Dipper and Polaris Star Diagram Description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-semibold mb-3">Çoban Yıldızı (Big Dipper) Şekli</h4>
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

  Kaseyi oluşturan son iki yıldız (Dubhe ve Merak)
  arasındaki çizgiyi 5 kat uzatın --> Polaris!

  Polaris (Kutup Yıldızı)
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
{`            KUZEY (North)
                ↑
                | Polaris
                |
                |
BATI (West) ←---+---> DOĞU (East)
                |
                |
                |
            GÜNEY (South)
                ↓
              (Güneş öğlen)
`}
            </pre>
          </div>

          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-semibold mb-3">Ay Fazları / Moon Phases</h4>
            <pre className="text-xs text-nomad-slate font-mono text-center">
{`Yeni Ay    -->  (      --> Görünmez
  |
  v
Artan Ay   -->  )      --> Sağ aydınlık, doğu yönü
  |
  v
Dolunay    -->  (O)     --> Tam aydınlık, güneş karşısı
  |
  v
Eksilen Ay -->  (      --> Sol aydınlık, batı yönü
  |
  v
Yeni Ay    -->  (      --> Döngü başa döner
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
            <h4 className="text-sm font-medium">Önemli Not / Important Note</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Yıldız navigasyon yöntemleri binlerce yıldır kullanılmaktadır. Türkiye'nin kuzey yarım küredeki konumu (36-42K),
            Polaris'in her zaman görünür olmasını sağlar. Bu yöntemler GPS olmadığında veya çalışmadığında
            yön bulmak için güvenilirdir. Ancak hassasiyetleri profesyonel navigasyon cihazları kadar değildir.
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
