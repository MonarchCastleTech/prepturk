'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Printer, Gamepad2, Puzzle, FlaskConical, Pencil, Palette, Dumbbell, Clock, Package, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  materials: string[];
  duration: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  description: string;
  instructions: string[];
  expanded: boolean;
}

const ACTIVITIES: Record<string, Activity[]> = {
  '3-6': [
    {
      id: 'i-spy', title: 'Bul Bakalim', titleEn: 'I-Spy', category: 'oyun',
      materials: ['Etraftaki esyalar'], duration: '10-15 dakika', difficulty: 'Kolay',
      description: 'Etraftaki nesneleri tahmin etme oyunu. Bir kisi bir nesne secer, digerleri tahmin eder.',
      instructions: [
        'Bir kisi etraftaki bir nesneyi aklinda tutar',
        '"Bul bakalim... rengi kirmizi olan bir sey goruyorum" der',
        'Diger oyuncular tahmin eder',
        'Dogru tahmin eden kisi sonraki turu yonetir',
        'Ipucu vererek oyunu kolaylastirabilirsiniz',
      ],
      expanded: false,
    },
    {
      id: 'golge-oyunu', title: 'Golge Kuklalar', titleEn: 'Shadow Puppets', category: 'oyun',
      materials: ['El feneri veya mum', 'Beyaz duvar veya camasir'], duration: '15-20 dakika', difficulty: 'Kolay',
      description: 'El feneri kullanarak duvarda golge kuklalar olusturun. Hayvan sekilleri yapin.',
      instructions: [
        'Karanlik bir oda bulun',
        'El fenerini veya mumu duvara dogru tuttun',
        'Ellerinizi isigin onune getirin',
        'Kus sekli: Bas parmaklari birlestirip kanatlarinizi acin',
        'Tavsan sekli: Isaret ve orta parmaklari kaldirin',
        'Kurt sekli: Bes parmagi acip kapayarak agiz yapin',
        'Cocuklarin hayal gucunu kullanmasina izin verin',
      ],
      expanded: false,
    },
    {
      id: 'el-alkisi', title: 'El Alkisi Oyunlari', titleEn: 'Hand Clap Games', category: 'oyun',
      materials: ['Sadece eller'], duration: '5-10 dakika', difficulty: 'Kolay',
      description: 'Geleneksel Turk el alkisi oyunlari. Ritim ve koordinasyon gelistirir.',
      instructions: [
        'Iki kisi karsi karsiya oturur',
        'Ellerinizi birbirinizin ellerine vurun',
        'Sirali ritim: once kendi elinize, sonra arkadasinizin eline',
        '"Bir, iki, uc, dort" diye sayarak ritim tutun',
        'Her turda hizi artirin',
        'Yanilen sirayi kaybeder',
      ],
      expanded: false,
    },
    {
      id: 'bulmaca-bilmece', title: 'Bilmeceler', titleEn: 'Riddles', category: 'bulmaca',
      materials: ['Sozel'], duration: '10-15 dakika', difficulty: 'Orta',
      description: 'Turk bilmeceleri ile cocuklarin dusunme becerilerini gelistirin.',
      instructions: [
        'Soru: Dali var agacli degil -- Cevap: Kitap',
        'Soru: Gozu var gorur degil -- Cevap: Igne',
        'Soru: Ayagi var yurumez -- Cevap: Masa',
        'Soru: Kapi var girilmez -- Cevap: Kapali kapi :)',
        'Soru: Disi var ama dis cekemez -- Cevap: Sarimsak',
        'Cocuklarin kendi bilmecelerini uydurmasini tesvik edin',
      ],
      expanded: false,
    },
    {
      id: 'deney-statik', title: 'Statik Elektrik Deneyi', titleEn: 'Static Electricity Experiment', category: 'deney',
      materials: ['Balon', 'Kucuk kagit parcalari veya sac'], duration: '10 dakika', difficulty: 'Kolay',
      description: 'Balonu saca surturerek statik elektrik olusturun ve kagitlari cekmesini izleyin.',
      instructions: [
        'Bir balonu sisirin',
        'Balonu sacliniza 10 saniye boyunca surturun',
        'Balonu kucuk kagit parcalarina yaklastirin',
        'Kagitlarin balona yapistigini goreceksiniz!',
        'Neden: Statik elektrik yuku olusur ve hafif nesneleri ceker',
        'Farkli nesnelerle deneyin: plastik kasik, tarak',
      ],
      expanded: false,
    },
    {
      id: 'yazi-hikaye', title: 'Hikaye Tamamla', titleEn: 'Story Completion', category: 'yazi',
      materials: ['Kagit', 'Kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Bir hikaye baslatin, cocuklar tamamlasin. Hayal gucunu gelistirir.',
      instructions: [
        'Baslangic: "Bir varmis bir yokmus. Kucuk bir kedi..."',
        'Cocugun hikayeyi tamamlamasini isteyin',
        'Sorular sorun: "Kedi nereye gitti?", "Ne gordu?"',
        'Her gun farkli bir baslangic yapin',
        'Ornek baslangiclar:',
        '  - "Bir gun gokten yagmur yerine..."',
        '  - "En sevdigim oyuncağim bir gece..."',
        '  - "Eger bir super gucum olsa..."',
      ],
      expanded: false,
    },
    {
      id: 'cizim-rubrik', title: 'Doga Rubingi', titleEn: 'Nature Rubbings', category: 'sanat',
      materials: ['Kagit', 'Kalem veya boya', 'Yaprak/bozuk para'], duration: '15-20 dakika', difficulty: 'Kolay',
      description: 'Yaprak veya bozuk paralarin uzerine kagit koyup kalemle surterek desen olusturun.',
      instructions: [
        'Duz bir yuzey bulun',
        'Bir yaprak veya bozuk parayi yuzeyin altina koyun',
        'Uzerine ince bir kagit yerlestirin',
        'Kalem veya boyayla uzerini hafifce surturun',
        'Desenin belirdigini goreceksiniz!',
        'Farkli nesnelerle deneyin: anahtar, kabuk, kumas',
        'En guzel deseni secip cerceveleyin',
      ],
      expanded: false,
    },
    {
      id: 'hareket-egzersiz', title: 'Ici Egzersizleri', titleEn: 'Indoor Exercises', category: 'hareket',
      materials: ['Bos alan'], duration: '15-20 dakika', difficulty: 'Kolay',
      description: 'Kapali alanda yapilabilen basit egzersizler. Enerji atmak icin mukemmel.',
      instructions: [
        'Ziplama: 10 kez zipla, 3 tekrar',
        'Yerinde kosma: 30 saniye yerinde kos',
        'Cocuklar icin "Simon Diyor" oyunu:',
        '  - "Simon diyor: zipla!" (ziplayin)',
        '  - "Simon diyor: don!" (donun)',
        '  - "Don!" (doneyim -- YANLIS, Simon demedi!)',
        'Esneklik: Elleri ayak parmaklarina uzat, 10 saniye tut',
        'Dans: En sevdigin sarkiyi soyle ve dans et',
      ],
      expanded: false,
    },
  ],
  '7-10': [
    {
      id: '20-soru', title: '20 Soru', titleEn: '20 Questions', category: 'oyun',
      materials: ['Sozel'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Bir kisi bir sey dusunur, digerleri 20 soru icinde tahmin etmeye calisir.',
      instructions: [
        'Bir kisi bir nesne, hayvan veya yer dusunur',
        'Diger oyuncular "Evet/Hayir" sorulari sorar',
        'Ornek: "Canli mi?", "Buyuk mu?", "Renkli mi?"',
        '20 soru icinde tahmin edilmeli',
        'Tahmin eden kisi sonraki turu yonetir',
        'Strateji: Genel sorularla baslayin, sonra ozellege inin',
      ],
      expanded: false,
    },
    {
      id: 'hikaye-zinciri', title: 'Hikaye Zinciri', titleEn: 'Story Chain', category: 'oyun',
      materials: ['Sozel veya kagit+kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Her kisi hikayeye bir cumle ekler. Ortaya cikmasi beklenmedik bir hikaye olur.',
      instructions: [
        'Ilk kisi "Bir varmis bir yokmus" diye baslar',
        'Her kisi sirayla bir cumle ekler',
        'Onceki cumleyle baglantili olmasi lazim',
        'Beklenmedik yonler tesvik edilir',
        'Hikayeyi kaydedin -- sonra okumak cok eglenceli!',
        'Ornek: "Bir varmis bir yokmus..." -> "Kucuk bir kasabada Ali yasadı..." -> "Ali nin garip bir gucu vardi..."',
      ],
      expanded: false,
    },
    {
      id: 'kelime-av', title: 'Kelime Bulmaca', titleEn: 'Word Search', category: 'bulmaca',
      materials: ['Kagit', 'Kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Turkce kelimelerle harf izgarasi olusturun, kelimeleri bulun.',
      instructions: [
        'Bir kagit uzerine 10x10 harf izgarasi cizin',
        'Icine Turkce kelimeler yerlestirin (dunya, kitap, okul, vs.)',
        'Kelimeler yatay, dikey veya capraz olabilir',
        'Bos kalan yerlere rastgele harfler yazin',
        'Kelime listesini asagiya yazin',
        'Diger cocuklar kelimeleri bulmaya calisir',
        'Ornek kelimeler: HAYVAN, KITAP, OKUL, DENIZ, AGAC, GUNES',
      ],
      expanded: false,
    },
    {
      id: 'matematik-bulmaca', title: 'Matematik Bulmacalari', titleEn: 'Math Puzzles', category: 'bulmaca',
      materials: ['Kagit', 'Kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Yas grubuna uygun matematik bulmacalari ve mantik sorulari.',
      instructions: [
        'Soru: 3 elma + 2 elma = ? elma',
        'Soru: Bir ciftcinin 5 koyunu var, 3 u kacarsa kac kalir?',
        'Soru: 10 dan geriye 2 ser 2 ser sayin',
        'Soru: 3 x 4 kac eder? 4 x 3 ile ayni mi?',
        'Soru: Bir dikdortgenin cevre uzunlugu nedir? (en+boy)x2',
        'Cocuklarin kendi sorularini uydurmasini isteyin',
        'Zorluk seviyesini artirin: "Ben bir sayi tuttum, 5 fazla 12 eder..."',
      ],
      expanded: false,
    },
    {
      id: 'deney-golge', title: 'Golge Bilimi', titleEn: 'Shadow Science', category: 'deney',
      materials: ['El feneri', 'Farkli nesneler', 'Beyaz kagit'], duration: '20 dakika', difficulty: 'Orta',
      description: 'Golgelerin nasil olustugunu ve nasil degistigini arastirin.',
      instructions: [
        'Farkli nesnelerin golgesini inceleyin',
        'Isik kaynagina yakinlastirip uzaklastirin',
        'Golge boyu nasil degisiyor?',
        'Sabah, oglen, aksam golgenizi olcun',
        'Neden golge oglen kisa, aksam uzun?',
        'Farkli acilardan isik tutun ve golge seklini gozlemleyin',
        'Sonucları kay dedin: hangisi en buyuk/kucuk golge yapti?',
      ],
      expanded: false,
    },
    {
      id: 'mektup', title: 'Gelecege Mektup', titleEn: 'Letter to Future Self', category: 'yazi',
      materials: ['Kagit', 'Kalem', 'Zarf'], duration: '20-30 dakika', difficulty: 'Orta',
      description: 'Kendinize bir mektup yazin. Kriz bittikten sonra okumak icin saklayin.',
      instructions: [
        '"Sevgili gelecekteki ben," diye baslayin',
        'Su anki durumunuzu anlatin',
        'Neler hissediyorsunuz?',
        'En cok neyi ozluyorsunuz?',
        'Gelecek icin hayalleriniz neler?',
        'Mektubu zarfa koyup tarih yazin',
        'Guvendli bir yerde saklayin',
        'Kriz bittikten sonra acin!',
      ],
      expanded: false,
    },
    {
      id: 'origami-turna', title: 'Origami Turna Kusu', titleEn: 'Origami Crane', category: 'sanat',
      materials: ['Kare kagit (15x15 cm ideal)'], duration: '20-30 dakika', difficulty: 'Zor',
      description: 'Japon kagit katlama sani origami ile turna kusu yapin. Baris semboludur.',
      instructions: [
        '1. Kare kagidi alin, capraz katlayin (ucgen olsun)',
        '2. Acin, diger caprazdan da katlayin',
        '3. Kare seklinde katlayin (kucuk kare)',
        '4. Her iki yandan merkeze katlayin',
        '5. Acin ve ters cevirip tekrarlayin',
        '6. Ust ucdan kanatlari olusturun',
        '7. Baskiyi verin ve sekillendirin',
        '8. Turna kusu hazir!',
        'ASCII:',
        '       /|\\',
        '        |',
        '       / \\',
      ],
      expanded: false,
    },
    {
      id: 'turk-dans', title: 'Turk Halk Danslari', titleEn: 'Turkish Folk Dance', category: 'hareket',
      materials: ['Bos alan', 'Opsiyonel: muzik'], duration: '20-30 dakika', difficulty: 'Orta',
      description: 'Geleneksel Turk halk danslarini ogrenin. Halay ve zeybek basit adimlari.',
      instructions: [
        'HALAY (bolgesel dans):',
        '  1. El ele tutusun veya omuz omuza durun',
        '  2. Sag ayakla baslayarak 4 adim saga',
        '  3. Sol ayakla 4 adim sola',
        '  4. Ayaklari birlestirip zipla',
        '  5. Tekrarla, hizi artir',
        '',
        'ZEYBEK (Ege bolgesi):',
        '  1. Genis durus, kollar yana acik (kartal gibi)',
        '  2. Sag diz kaldir, yavasça indir',
        '  3. Sol diz kaldir, yavasça indir',
        '  4. Kolları acip kapatarak don',
        '  5. Gurultulu ve gosterisli yapin!',
      ],
      expanded: false,
    },
  ],
  '11-14': [
    {
      id: 'strateji-oyun', title: 'Strateji Oyunu', titleEn: 'Strategy Game', category: 'oyun',
      materials: ['Kagit', 'Kalem'], duration: '20-30 dakika', difficulty: 'Zor',
      description: 'Noktalarda ucgen oyunu. Her oyuncu sirayla nokta birlestirir, ucgen yapmaya calisir.',
      instructions: [
        '4x4 veya 5x5 nokta izgarasi cizin',
        'Her oyuncu sirayla iki yan yana noktayi birlestirir',
        'Bir kare ucgen tamamlayan oyuncu 1 puan alir',
        'En cok puani toplayan kazanir',
        'Strateji: Rakibin hamlelerini ongorun',
        'Buyuk izgara = daha zor oyun',
        'Alternatif: "Nokta ve Kare" oyunu -- kare tamamlayan puan alir',
      ],
      expanded: false,
    },
    {
      id: 'mantik-bulmaca', title: 'Ileri Mantik Bulmacalari', titleEn: 'Advanced Logic Puzzles', category: 'bulmaca',
      materials: ['Kagit', 'Kalem'], duration: '20-30 dakika', difficulty: 'Zor',
      description: 'Yas grubuna uygun zor mantik ve cozumleme bulmacalari.',
      instructions: [
        'Bulmaca 1: Bir adamin 3 oglu var. Yaslari carpimi 36, toplami ev numarasina esit...',
        '  (Cozum: 2, 2, 9 veya 1, 6, 6 -- ipucu: en buyuk ogul...)',
        'Bulmaca 2: 3 kapı var: 1. ateş, 2. katil, 3. aslan (3 yildir aclikta)',
        '  (Cozum: 3. kapi -- 3 yil aclikan aslan olmustur)',
        'Bulmaca 3: Bir koyde herkes ya yalanci ya dogrucu...',
        '  (Mantik kapilari problemi -- tablo ile cozun)',
        'Kendi bulmacalarinizi uydurun!',
      ],
      expanded: false,
    },
    {
      id: 'deney-su-dongusu', title: 'Suda Dongusu Cantdasi', titleEn: 'Water Cycle in a Bag', category: 'deney',
      materials: ['Seffaf buzdolabi poseti', 'Su', 'Bant', 'Gunes isigi'], duration: '30 dakika + gozlem', difficulty: 'Kolay',
      description: 'Kucuk bir su dongusu modeli olusturun. Buharlasma, yogusma ve yagmur gozlemleyin.',
      instructions: [
        'Seffaf posete biraz su koyun (tabani gececek kadar)',
        'Posetin agzini kapatin',
        'Poseti pencereye bantla yapistirin',
        'Gunes isigi alan bir yer secin',
        'Bir kac saat sonra gozlemleyin:',
        '  - Posetin ustunde su damlalari gorunecek (yogusma)',
        '  - Damlalar asagi dusucek (yagmur)',
        '  - Su tekrar tabana donecek (toplanma)',
        'Bu durt asama su dongusunu gosterir!',
      ],
      expanded: false,
    },
    {
      id: 'deney-mantar', title: 'Mantar Yetistirme', titleEn: 'Mushroom Growing', category: 'deney',
      materials: ['Ekmek parcalari', 'Seffaf kapakli kap', 'Su spreyi'], duration: '1 hafta+ gozlem', difficulty: 'Orta',
      description: 'Evde mantar yetistirin ve buyume dongusunu gozlemleyin.',
      instructions: [
        'Bir ekmek parcasini nemlendirin',
        'Seffaf kaba koyun',
        'Kapagi kapatin (tamamen degil, biraz hava kalsin)',
        'Karanlik, sicak bir yere koyun',
        'Her gun gozlemleyin ve not edin',
        '3-5 gun icinde mantar belirmeye baslar',
        'Buyume hizini olcun ve cizin',
        'UYARI: Mantarlari YEMEYIN -- sadece gozlem!',
      ],
      expanded: false,
    },
    {
      id: 'essay-yazma', title: 'Essay Yazma', titleEn: 'Essay Writing', category: 'yazi',
      materials: ['Kagit', 'Kalem'], duration: '30-45 dakika', difficulty: 'Zor',
      description: 'Turkce essay yazma pratiği. Konular: doga, toplum, gelecek.',
      instructions: [
        'Konu secin:',
        '  - "Kriz sonrasinda dunya nasil olacak?"',
        '  - "En degerli sey nedir ve neden?"',
        '  - "Topluluk neden onemlidir?"',
        '  - "Doga ile uyumlu yasamak mumkun mu?"',
        'Essay yapisi:',
        '  1. Giris: Konuyu tanitin (2-3 cumle)',
        '  2. Gelisme: Argumanlarinizi sunun (5-10 cumle)',
        '  3. Sonuc: Ozet ve dusunceleriniz (2-3 cumle)',
        'Yazdiktan sonra sesli okuyun ve duzenleyin',
      ],
      expanded: false,
    },
    {
      id: 'cizim-perspektif', title: 'Perspektif Cizim', titleEn: 'Perspective Drawing', category: 'sanat',
      materials: ['Kagit', 'Kalem', 'Silgi'], duration: '30-45 dakika', difficulty: 'Zor',
      description: 'Tek nokta perspektif kullanarak 3 boyutlu cizim yapmayi ogrenin.',
      instructions: [
        '1. Kagitin ortasina bir nokta koyun (kayip noktasi)',
        '2. Dortgen cizin (on duvar)',
        '3. Dortgenin koselerinden kayip noktasina cizgiler cekin',
        '4. Bu cizgiler yan duvarlari ve tavanı olusturur',
        '5. Pencereler, kapilar ekleyin',
        '6. Mobilya ekleyin (masa, sandalye)',
        '7. Detaylari boyayin',
        'Ornek: Bir oda koridor veya sokak gorunumu',
      ],
      expanded: false,
    },
    {
      id: 'origami-kutu', title: 'Origami Kutu', titleEn: 'Origami Box', category: 'sanat',
      materials: ['Kare kagit'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Origami ile kullanışli bir kutu yapin. Esyalarinizi saklamak icin kullanin.',
      instructions: [
        '1. Kare kagidi alin',
        '2. Her iki yonden de ortadan katlayip acin',
        '3. Dort koseden merkeze katlayin',
        '4. Acin, kenarlardan merkeze cizgiler boyunca katlayin',
        '5. Kenarlari kaldirip sekillendirin',
        '6. Koseleri iceri katlayip sabitleyin',
        '7. Kutu hazir!',
        'Boyut: Kucuk esyalar icin ideal',
        'ASCII:',
        '   +---------+',
        '  /|        /|',
        ' +---------+ |',
        ' | |       | |',
        ' | +-------|-+',
        ' |/        |/',
        ' +---------+',
      ],
      expanded: false,
    },
    {
      id: 'hareket-ileri', title: 'Ileri Egzersiz Programi', titleEn: 'Advanced Exercise Program', category: 'hareket',
      materials: ['Bos alan'], duration: '30-45 dakika', difficulty: 'Zor',
      description: 'Kapali alanda yapilabilen kapsamli egzersiz programi.',
      instructions: [
        'ISINMA (5 dakika):',
        '  - Yerinde kosma 2 dakika',
        '  - Kol ve bacak sallama 2 dakika',
        '  - Donme hareketleri 1 dakika',
        '',
        'ANA PROGRAM (20 dakika):',
        '  - Mekik: 15 tekrar x 3 set',
        '  - Sirinma: 10 tekrar x 3 set',
        '  - Plank: 30 saniye x 3 set',
        '  - Lunges: 10 her bacak x 3 set',
        '  - Ziplama: 20 tekrar x 2 set',
        '',
        'SOGUMA (5 dakika):',
        '  - Butun vucut esneme',
        '  - Derin nefes egzersizleri',
        '',
        'Not: Her gun yapilmamali -- kaslar dinlenmeli',
      ],
      expanded: false,
    },
  ],
};

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; labelEn: string }> = {
  oyun: { icon: Gamepad2, label: 'Oyunlar', labelEn: 'Games' },
  bulmaca: { icon: Puzzle, label: 'Bulmacalar', labelEn: 'Puzzles' },
  deney: { icon: FlaskConical, label: 'Deneyler', labelEn: 'Science' },
  yazi: { icon: Pencil, label: 'Yazi', labelEn: 'Writing' },
  sanat: { icon: Palette, label: 'Sanat', labelEn: 'Art' },
  hareket: { icon: Dumbbell, label: 'Hareket', labelEn: 'Physical' },
};

const AGE_GROUPS = ['3-6', '7-10', '11-14'];

function ActivityCard({ activity, onToggle, onPrint }: { activity: Activity; onToggle: () => void; onPrint: () => void }) {
  const catMeta = CATEGORY_META[activity.category];
  const CatIcon = catMeta?.icon || Gamepad2;

  const diffColor = activity.difficulty === 'Kolay' ? 'text-green-400' : activity.difficulty === 'Orta' ? 'text-yellow-400' : 'text-red-400';

  return (
    <Card className="border-nomad-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-nomad-bg">
              <CatIcon className="h-5 w-5 text-nomad-green" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{activity.title}</CardTitle>
              <CardDescription>{activity.titleEn}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="text-xs bg-nomad-bg text-nomad-slate border border-nomad-border">
              <Clock className="h-3 w-3 mr-1" />
              {activity.duration}
            </Badge>
            <Badge className={`text-xs bg-nomad-bg border border-nomad-border ${diffColor}`}>
              {activity.difficulty}
            </Badge>
            <button onClick={onToggle} className="p-1 hover:bg-nomad-bg rounded transition-colors">
              {activity.expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <p className="text-sm text-nomad-slate mt-2">{activity.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-3 w-3 text-nomad-slate" />
          <span className="text-xs text-nomad-slate">{activity.materials.join(', ')}</span>
        </div>
      </CardHeader>

      {activity.expanded && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Talimatlar / Instructions</h4>
            <ol className="space-y-1">
              {activity.instructions.map((step, i) => (
                <li key={i} className="text-sm text-nomad-slate flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-nomad-surface border border-nomad-border flex items-center justify-center text-xs text-nomad-slate mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-3 w-3 mr-1" />
              Yazdir / Print
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function printActivity(activity: Activity) {
  let markup = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
  <title>${activity.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #000; }
    h1 { font-size: 20px; border-bottom: 3px solid #000; padding-bottom: 8px; }
    h2 { font-size: 16px; margin-top: 16px; }
    ol { padding-left: 24px; }
    li { margin-bottom: 6px; font-size: 14px; }
    .meta { font-size: 13px; color: #666; margin: 8px 0; }
    .footer { margin-top: 24px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <h1>${activity.title} / ${activity.titleEn}</h1>
  <p class="meta">Sure: ${activity.duration} | Zorluk: ${activity.difficulty}</p>
  <p class="meta">Malzemeler: ${activity.materials.join(', ')}</p>
  <p>${activity.description}</p>
  <h2>Talimatlar:</h2><ol>`;
  activity.instructions.forEach(s => { markup += `<li>${s}</li>`; });
  markup += `</ol><div class="footer">PrepTurk -- Cocuk Aktivite Paketi</div></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(markup); w.document.close(); w.print(); }
}

export default function CocukAktivitePage() {
  const [activeAge, setActiveAge] = useState('3-6');
  const [activities, setActivities] = useState<Record<string, Activity[]>>(ACTIVITIES);

  const toggleActivity = useCallback((age: string, id: string) => {
    setActivities(prev => ({
      ...prev,
      [age]: prev[age].map(a => a.id === id ? { ...a, expanded: !a.expanded } : a),
    }));
  }, []);

  const printAll = useCallback((age: string) => {
    activities[age].forEach(a => printActivity(a));
  }, [activities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cocuk Aktivite Paketi / Emergency Activity Pack</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Uzun sureli barinak durumlarinda cocuklari mesgul edecek cevrimdisi aktiviteler
        </p>
      </div>

      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                Tum aktiviteler cevrimdisi yapilabilir. Malzemeler ev esyalaridir. Her aktivite yazdirilabilir.
              </p>
              <p className="text-xs text-nomad-slate mt-1">
                All activities can be done offline. Materials are household items. Each activity is printable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Age tabs */}
      <div className="flex gap-2">
        {AGE_GROUPS.map(age => (
          <button
            key={age}
            onClick={() => setActiveAge(age)}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeAge === age
                ? 'bg-nomad-green text-white'
                : 'bg-nomad-surface border border-nomad-border text-nomad-slate hover:text-foreground'
            }`}
          >
            Yas {age} / Age {age}
          </button>
        ))}
      </div>

      {/* Activities by category */}
      {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
        const catActivities = activities[activeAge]?.filter(a => a.category === catKey) || [];
        if (catActivities.length === 0) return null;
        const CatIcon = meta.icon;

        return (
          <div key={catKey}>
            <div className="flex items-center gap-2 mb-4">
              <CatIcon className="h-5 w-5 text-nomad-green" />
              <h2 className="text-lg font-bold">{meta.label} / {meta.labelEn}</h2>
            </div>
            <div className="space-y-4">
              {catActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  onToggle={() => toggleActivity(activeAge, act.id)}
                  onPrint={() => printActivity(act)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Print all */}
      <div className="flex justify-center pb-8">
        <Button variant="outline" size="lg" onClick={() => printAll(activeAge)}>
          <Printer className="h-4 w-4 mr-2" />
          Tum Aktiviteleri Yazdir (Yas {activeAge})
        </Button>
      </div>
    </div>
  );
}
