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
      id: 'i-spy', title: 'Bul Bakalım', titleEn: 'I-Spy', category: 'oyun',
      materials: ['Etraftaki eşyalar'], duration: '10-15 dakika', difficulty: 'Kolay',
      description: 'Etraftaki nesneleri tahmin etme oyunu. Bir kişi bir nesne seçer, diğerleri tahmin eder.',
      instructions: [
        'Bir kişi etraftaki bir nesneyi aklında tutar',
        '"Bul bakalım... rengi kırmızı olan bir şey görüyorum" der',
        'Diğer oyuncular tahmin eder',
        'Doğru tahmin eden kişi sonraki turu yönetir',
        'İpucu vererek oyunu kolaylaştırabilirsiniz',
      ],
      expanded: false,
    },
    {
      id: 'golge-oyunu', title: 'Gölge Kuklalar', titleEn: 'Shadow Puppets', category: 'oyun',
      materials: ['El feneri veya mum', 'Beyaz duvar veya çamaşır'], duration: '15-20 dakika', difficulty: 'Kolay',
      description: 'El feneri kullanarak duvarda gölge kuklalar oluşturun. Hayvan şekilleri yapın.',
      instructions: [
        'Karanlık bir oda bulun',
        'El fenerini veya mumu duvara doğru tutun',
        'Ellerinizi ışığın önüne getirin',
        'Kuş şekli: Baş parmakları birleştirip kanatlarınızı açın',
        'Tavşan şekli: İşaret ve orta parmakları kaldırın',
        'Kurt şekli: Beş parmağı açıp kapayarak ağız yapın',
        'Çocukların hayal gücünü kullanmasına izin verin',
      ],
      expanded: false,
    },
    {
      id: 'el-alkisi', title: 'El Alkışı Oyunları', titleEn: 'Hand Clap Games', category: 'oyun',
      materials: ['Sadece eller'], duration: '5-10 dakika', difficulty: 'Kolay',
      description: 'Geleneksel Türk el alkışı oyunları. Ritim ve koordinasyon geliştirir.',
      instructions: [
        'İki kişi karşı karşıya oturur',
        'Ellerinizi birbirinizin ellerine vurun',
        'Sıralı ritim: önce kendi elinize, sonra arkadaşınızın eline',
        '"Bir, iki, üç, dört" diye sayarak ritim tutun',
        'Her turda hızı artırın',
        'Yanılan sırayı kaybeder',
      ],
      expanded: false,
    },
    {
      id: 'bulmaca-bilmece', title: 'Bilmeceler', titleEn: 'Riddles', category: 'bulmaca',
      materials: ['Sözel'], duration: '10-15 dakika', difficulty: 'Orta',
      description: 'Türk bilmeceleri ile çocukların düşünme becerilerini geliştirin.',
      instructions: [
        'Soru: Dalı var ağacı değil -- Cevap: Kitap',
        'Soru: Gözü var görür değil -- Cevap: İğne',
        'Soru: Ayağı var yürümez -- Cevap: Masa',
        'Soru: Kapı var girilmez -- Cevap: Kapalı kapı :)',
        'Soru: Dişi var ama diş çekemez -- Cevap: Sarımsak',
        'Çocukların kendi bilmecelerini uydurmasını teşvik edin',
      ],
      expanded: false,
    },
    {
      id: 'deney-statik', title: 'Statik Elektrik Deneyi', titleEn: 'Static Electricity Experiment', category: 'deney',
      materials: ['Balon', 'Küçük kağıt parçaları veya saç'], duration: '10 dakika', difficulty: 'Kolay',
      description: 'Balonu saça sürterek statik elektrik oluşturun ve kağıtları çekmesini izleyin.',
      instructions: [
        'Bir balonu şişirin',
        'Balonu saçınıza 10 saniye boyunca sürtün',
        'Balonu küçük kağıt parçalarına yaklaştırın',
        'Kağıtların balona yapıştığını göreceksiniz!',
        'Neden: Statik elektrik yükü oluşur ve hafif nesneleri çeker',
        'Farklı nesnelerle deneyin: plastik kaşık, tarak',
      ],
      expanded: false,
    },
    {
      id: 'yazi-hikaye', title: 'Hikaye Tamamla', titleEn: 'Story Completion', category: 'yazi',
      materials: ['Kağıt', 'Kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Bir hikaye başlatın, çocuklar tamamlasın. Hayal gücünü geliştirir.',
      instructions: [
        'Başlangıç: "Bir varmış bir yokmuş. Küçük bir kedi..."',
        'Çocuğun hikayeyi tamamlamasını isteyin',
        'Sorular sorun: "Kedi nereye gitti?", "Ne gördü?"',
        'Her gün farklı bir başlangıç yapın',
        'Örnek başlangıçlar:',
        '  - "Bir gün gökten yağmur yerine..."',
        '  - "En sevdiğim oyuncağım bir gece..."',
        '  - "Eğer bir süper gücüm olsa..."',
      ],
      expanded: false,
    },
    {
      id: 'cizim-rubrik', title: 'Doğa Rubingi', titleEn: 'Nature Rubbings', category: 'sanat',
      materials: ['Kağıt', 'Kalem veya boya', 'Yaprak/bozuk para'], duration: '15-20 dakika', difficulty: 'Kolay',
      description: 'Yaprak veya bozuk paraların üzerine kağıt koyup kalemle sürterek desen oluşturun.',
      instructions: [
        'Düz bir yüzey bulun',
        'Bir yaprak veya bozuk parayı yüzeyin altına koyun',
        'Üzerine ince bir kağıt yerleştirin',
        'Kalem veya boyayla üzerini hafifçe sürtün',
        'Desenin belirdiğini göreceksiniz!',
        'Farklı nesnelerle deneyin: anahtar, kabuk, kumaş',
        'En güzel deseni seçip çerçeveleyin',
      ],
      expanded: false,
    },
    {
      id: 'hareket-egzersiz', title: 'İç Mekan Egzersizleri', titleEn: 'Indoor Exercises', category: 'hareket',
      materials: ['Boş alan'], duration: '15-20 dakika', difficulty: 'Kolay',
      description: 'Kapalı alanda yapılabilen basit egzersizler. Enerji atmak için mükemmel.',
      instructions: [
        'Zıplama: 10 kez zıpla, 3 tekrar',
        'Yerinde koşma: 30 saniye yerinde koş',
        'Çocuklar için "Simon Diyor" oyunu:',
        '  - "Simon diyor: zıpla!" (zıplayın)',
        '  - "Simon diyor: dön!" (dönün)',
        '  - "Dön!" (dönmeyin -- YANLIŞ, Simon demedi!)',
        'Esneklik: Elleri ayak parmaklarına uzat, 10 saniye tut',
        'Dans: En sevdiğin şarkıyı söyle ve dans et',
      ],
      expanded: false,
    },
  ],
  '7-10': [
    {
      id: '20-soru', title: '20 Soru', titleEn: '20 Questions', category: 'oyun',
      materials: ['Sözel'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Bir kişi bir şey düşünür, diğerleri 20 soru içinde tahmin etmeye çalışır.',
      instructions: [
        'Bir kişi bir nesne, hayvan veya yer düşünür',
        'Diğer oyuncular "Evet/Hayır" soruları sorar',
        'Örnek: "Canlı mı?", "Büyük mü?", "Renkli mi?"',
        '20 soru içinde tahmin edilmeli',
        'Tahmin eden kişi sonraki turu yönetir',
        'Strateji: Genel sorularla başlayın, sonra özelliğe inin',
      ],
      expanded: false,
    },
    {
      id: 'hikaye-zinciri', title: 'Hikaye Zinciri', titleEn: 'Story Chain', category: 'oyun',
      materials: ['Sözel veya kağıt+kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Her kişi hikayeye bir cümle ekler. Ortaya çıkması beklenmedik bir hikaye olur.',
      instructions: [
        'İlk kişi "Bir varmış bir yokmuş" diye başlar',
        'Her kişi sırayla bir cümle ekler',
        'Önceki cümleyle bağlantılı olması lazım',
        'Beklenmedik yönler teşvik edilir',
        'Hikayeyi kaydedin -- sonra okumak çok eğlenceli!',
        'Örnek: "Bir varmış bir yokmuş..." -> "Küçük bir kasabada Ali yaşadı..." -> "Ali nin garip bir gücü vardı..."',
      ],
      expanded: false,
    },
    {
      id: 'kelime-av', title: 'Kelime Bulmaca', titleEn: 'Word Search', category: 'bulmaca',
      materials: ['Kağıt', 'Kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Türkçe kelimelerle harf ızgarası oluşturun, kelimeleri bulun.',
      instructions: [
        'Bir kağıt üzerine 10x10 harf ızgarası çizin',
        'İçine Türkçe kelimeler yerleştirin (dünya, kitap, okul, vs.)',
        'Kelimeler yatay, dikey veya çapraz olabilir',
        'Boş kalan yerlere rastgele harfler yazın',
        'Kelime listesini aşağıya yazın',
        'Diğer çocuklar kelimeleri bulmaya çalışır',
        'Örnek kelimeler: HAYVAN, KİTAP, OKUL, DENİZ, AĞAÇ, GÜNEŞ',
      ],
      expanded: false,
    },
    {
      id: 'matematik-bulmaca', title: 'Matematik Bulmacaları', titleEn: 'Math Puzzles', category: 'bulmaca',
      materials: ['Kağıt', 'Kalem'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Yaş grubuna uygun matematik bulmacaları ve mantık soruları.',
      instructions: [
        'Soru: 3 elma + 2 elma = ? elma',
        'Soru: Bir çiftçinin 5 koyunu var, 3 ü kaçarsa kaç kalır?',
        'Soru: 10 dan geriye 2 şer 2 şer sayın',
        'Soru: 3 x 4 kaç eder? 4 x 3 ile aynı mı?',
        'Soru: Bir dikdörtgenin çevre uzunluğu nedir? (en+boy)x2',
        'Çocukların kendi sorularını uydurmasını isteyin',
        'Zorluk seviyesini artırın: "Ben bir sayı tuttum, 5 fazlası 12 eder..."',
      ],
      expanded: false,
    },
    {
      id: 'deney-golge', title: 'Gölge Bilimi', titleEn: 'Shadow Science', category: 'deney',
      materials: ['El feneri', 'Farklı nesneler', 'Beyaz kağıt'], duration: '20 dakika', difficulty: 'Orta',
      description: 'Gölgelerin nasıl oluştuğunu ve nasıl değiştiğini araştırın.',
      instructions: [
        'Farklı nesnelerin gölgesini inceleyin',
        'Işık kaynağına yaklaştırıp uzaklaştırın',
        'Gölge boyu nasıl değişiyor?',
        'Sabah, öğlen, akşam gölgenizi ölçün',
        'Neden gölge öğlen kısa, akşam uzun?',
        'Farklı açılardan ışık tutun ve gölge şeklini gözlemleyin',
        'Sonuçları kaydedin: hangisi en büyük/küçük gölge yaptı?',
      ],
      expanded: false,
    },
    {
      id: 'mektup', title: 'Geleceğe Mektup', titleEn: 'Letter to Future Self', category: 'yazi',
      materials: ['Kağıt', 'Kalem', 'Zarf'], duration: '20-30 dakika', difficulty: 'Orta',
      description: 'Kendinize bir mektup yazın. Kriz bittikten sonra okumak için saklayın.',
      instructions: [
        '"Sevgili gelecekteki ben," diye başlayın',
        'Şu anki durumunuzu anlatın',
        'Neler hissediyorsunuz?',
        'En çok neyi özlüyorsunuz?',
        'Gelecek için hayalleriniz neler?',
        'Mektubu zarfa koyup tarih yazın',
        'Güvenli bir yerde saklayın',
        'Kriz bittikten sonra açın!',
      ],
      expanded: false,
    },
    {
      id: 'origami-turna', title: 'Origami Turna Kusu', titleEn: 'Origami Crane', category: 'sanat',
      materials: ['Kare kağıt (15x15 cm ideal)'], duration: '20-30 dakika', difficulty: 'Zor',
      description: 'Japon kağıt katlama sanatı origami ile turna kuşu yapın. Barış sembolüdür.',
      instructions: [
        '1. Kare kağıdı alın, çapraz katlayın (üçgen olsun)',
        '2. Açın, diğer çaprazdan da katlayın',
        '3. Kare şeklinde katlayın (küçük kare)',
        '4. Her iki yandan merkeze katlayın',
        '5. Açın ve ters çevirip tekrarlayın',
        '6. Üst uçtan kanatları oluşturun',
        '7. Baskıyı verin ve şekillendirin',
        '8. Turna kuşu hazır!',
        'ASCII:',
        '       /|\\',
        '        |',
        '       / \\',
      ],
      expanded: false,
    },
    {
      id: 'turk-dans', title: 'Türk Halk Dansları', titleEn: 'Turkish Folk Dance', category: 'hareket',
      materials: ['Boş alan', 'Opsiyonel: müzik'], duration: '20-30 dakika', difficulty: 'Orta',
      description: 'Geleneksel Türk halk danslarını öğrenin. Halay ve zeybek basit adımları.',
      instructions: [
        'HALAY (bölgesel dans):',
        '  1. El ele tutuşun veya omuz omuza durun',
        '  2. Sağ ayakla başlayarak 4 adım sağa',
        '  3. Sol ayakla 4 adım sola',
        '  4. Ayakları birleştirip zıpla',
        '  5. Tekrarla, hızı artır',
        '',
        'ZEYBEK (Ege bölgesi):',
        '  1. Geniş duruş, kollar yana açık (kartal gibi)',
        '  2. Sağ diz kaldır, yavaşça indir',
        '  3. Sol diz kaldır, yavaşça indir',
        '  4. Kolları açıp kapatarak dön',
        '  5. Gürültülü ve gösterişli yapın!',
      ],
      expanded: false,
    },
  ],
  '11-14': [
    {
      id: 'strateji-oyun', title: 'Strateji Oyunu', titleEn: 'Strategy Game', category: 'oyun',
      materials: ['Kağıt', 'Kalem'], duration: '20-30 dakika', difficulty: 'Zor',
      description: 'Noktalarda üçgen oyunu. Her oyuncu sırayla nokta birleştirir, üçgen yapmaya çalışır.',
      instructions: [
        '4x4 veya 5x5 nokta ızgarası çizin',
        'Her oyuncu sırayla iki yan yana noktayı birleştirir',
        'Bir kare üçgen tamamlayan oyuncu 1 puan alır',
        'En çok puanı toplayan kazanır',
        'Strateji: Rakibin hamlelerini öngörün',
        'Büyük ızgara = daha zor oyun',
        'Alternatif: "Nokta ve Kare" oyunu -- kare tamamlayan puan alır',
      ],
      expanded: false,
    },
    {
      id: 'mantik-bulmaca', title: 'İleri Mantık Bulmacaları', titleEn: 'Advanced Logic Puzzles', category: 'bulmaca',
      materials: ['Kağıt', 'Kalem'], duration: '20-30 dakika', difficulty: 'Zor',
      description: 'Yaş grubuna uygun zor mantık ve çözümleme bulmacaları.',
      instructions: [
        'Bulmaca 1: Bir adamın 3 oğlu var. Yaşları çarpımı 36, toplamı ev numarasına eşit...',
        '  (Çözüm: 2, 2, 9 veya 1, 6, 6 -- ipucu: en büyük oğul...)',
        'Bulmaca 2: 3 kapı var: 1. ateş, 2. katil, 3. aslan (3 yıldır açlıkta)',
        '  (Çözüm: 3. kapı -- 3 yıl açlıktan aslan ölmüştür)',
        'Bulmaca 3: Bir köyde herkes ya yalancı ya doğrucu...',
        '  (Mantık kapıları problemi -- tablo ile çözün)',
        'Kendi bulmacalarınızı uydurun!',
      ],
      expanded: false,
    },
    {
      id: 'deney-su-dongusu', title: 'Poşette Su Döngüsü', titleEn: 'Water Cycle in a Bag', category: 'deney',
      materials: ['Şeffaf buzdolabı poşeti', 'Su', 'Bant', 'Güneş ışığı'], duration: '30 dakika + gözlem', difficulty: 'Kolay',
      description: 'Küçük bir su döngüsü modeli oluşturun. Buharlaşma, yoğuşma ve yağmur gözlemleyin.',
      instructions: [
        'Şeffaf poşete biraz su koyun (tabanı geçecek kadar)',
        'Poşetin ağzını kapatın',
        'Poşeti pencereye bantla yapıştırın',
        'Güneş ışığı alan bir yer seçin',
        'Birkaç saat sonra gözlemleyin:',
        '  - Poşetin üstünde su damlaları görünecek (yoğuşma)',
        '  - Damlalar aşağı düşecek (yağmur)',
        '  - Su tekrar tabana dönecek (toplanma)',
        'Bu dört aşama su döngüsünü gösterir!',
      ],
      expanded: false,
    },
    {
      id: 'deney-mantar', title: 'Mantar Yetiştirme', titleEn: 'Mushroom Growing', category: 'deney',
      materials: ['Ekmek parçaları', 'Şeffaf kapaklı kap', 'Su spreyi'], duration: '1 hafta+ gözlem', difficulty: 'Orta',
      description: 'Evde mantar yetiştirin ve büyüme döngüsünü gözlemleyin.',
      instructions: [
        'Bir ekmek parçasını nemlendirin',
        'Şeffaf kaba koyun',
        'Kapağı kapatın (tamamen değil, biraz hava kalsın)',
        'Karanlık, sıcak bir yere koyun',
        'Her gün gözlemleyin ve not edin',
        '3-5 gün içinde mantar belirmeye başlar',
        'Büyüme hızını ölçün ve çizin',
        'UYARI: Mantarları YEMEYİN -- sadece gözlem!',
      ],
      expanded: false,
    },
    {
      id: 'essay-yazma', title: 'Essay Yazma', titleEn: 'Essay Writing', category: 'yazi',
      materials: ['Kağıt', 'Kalem'], duration: '30-45 dakika', difficulty: 'Zor',
      description: 'Türkçe essay yazma pratiği. Konular: doğa, toplum, gelecek.',
      instructions: [
        'Konu seçin:',
        '  - "Kriz sonrasında dünya nasıl olacak?"',
        '  - "En değerli şey nedir ve neden?"',
        '  - "Topluluk neden önemlidir?"',
        '  - "Doğa ile uyumlu yaşamak mümkün mü?"',
        'Essay yapısı:',
        '  1. Giriş: Konuyu tanıtın (2-3 cümle)',
        '  2. Gelişme: Argümanlarınızı sunun (5-10 cümle)',
        '  3. Sonuç: Özet ve düşünceleriniz (2-3 cümle)',
        'Yazdıktan sonra sesli okuyun ve düzenleyin',
      ],
      expanded: false,
    },
    {
      id: 'cizim-perspektif', title: 'Perspektif Çizim', titleEn: 'Perspective Drawing', category: 'sanat',
      materials: ['Kağıt', 'Kalem', 'Silgi'], duration: '30-45 dakika', difficulty: 'Zor',
      description: 'Tek nokta perspektif kullanarak 3 boyutlu çizim yapmayı öğrenin.',
      instructions: [
        '1. Kağıdın ortasına bir nokta koyun (kayıp noktası)',
        '2. Dörtgen çizin (ön duvar)',
        '3. Dörtgenin köşelerinden kayıp noktasına çizgiler çekin',
        '4. Bu çizgiler yan duvarları ve tavanı oluşturur',
        '5. Pencereler, kapılar ekleyin',
        '6. Mobilya ekleyin (masa, sandalye)',
        '7. Detayları boyayın',
        'Örnek: Bir oda, koridor veya sokak görünümü',
      ],
      expanded: false,
    },
    {
      id: 'origami-kutu', title: 'Origami Kutu', titleEn: 'Origami Box', category: 'sanat',
      materials: ['Kare kağıt'], duration: '15-20 dakika', difficulty: 'Orta',
      description: 'Origami ile kullanışlı bir kutu yapın. Eşyalarınızı saklamak için kullanın.',
      instructions: [
        '1. Kare kağıdı alın',
        '2. Her iki yönden de ortadan katlayıp açın',
        '3. Dört köşeden merkeze katlayın',
        '4. Açın, kenarlardan merkeze çizgiler boyunca katlayın',
        '5. Kenarları kaldırıp şekillendirin',
        '6. Köşeleri içeri katlayıp sabitleyin',
        '7. Kutu hazır!',
        'Boyut: Küçük eşyalar için ideal',
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
      id: 'hareket-ileri', title: 'İleri Egzersiz Programı', titleEn: 'Advanced Exercise Program', category: 'hareket',
      materials: ['Boş alan'], duration: '30-45 dakika', difficulty: 'Zor',
      description: 'Kapalı alanda yapılabilen kapsamlı egzersiz programı.',
      instructions: [
        'ISINMA (5 dakika):',
        '  - Yerinde koşma 2 dakika',
        '  - Kol ve bacak sallama 2 dakika',
        '  - Dönme hareketleri 1 dakika',
        '',
        'ANA PROGRAM (20 dakika):',
        '  - Mekik: 15 tekrar x 3 set',
        '  - Şınav: 10 tekrar x 3 set',
        '  - Plank: 30 saniye x 3 set',
        '  - Lunges: 10 her bacak x 3 set',
        '  - Zıplama: 20 tekrar x 2 set',
        '',
        'SOĞUMA (5 dakika):',
        '  - Bütün vücut esneme',
        '  - Derin nefes egzersizleri',
        '',
        'Not: Her gün yapılmamalı -- kaslar dinlenmeli',
      ],
      expanded: false,
    },
  ],
};

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; labelEn: string }> = {
  oyun: { icon: Gamepad2, label: 'Oyunlar', labelEn: 'Games' },
  bulmaca: { icon: Puzzle, label: 'Bulmacalar', labelEn: 'Puzzles' },
  deney: { icon: FlaskConical, label: 'Deneyler', labelEn: 'Science' },
  yazi: { icon: Pencil, label: 'Yazı', labelEn: 'Writing' },
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
              Yazdır / Print
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
  <p class="meta">Süre: ${activity.duration} | Zorluk: ${activity.difficulty}</p>
  <p class="meta">Malzemeler: ${activity.materials.join(', ')}</p>
  <p>${activity.description}</p>
  <h2>Talimatlar:</h2><ol>`;
  activity.instructions.forEach(s => { markup += `<li>${s}</li>`; });
  markup += `</ol><div class="footer">PrepTürk -- Çocuk Aktivite Paketi</div></body></html>`;
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
        <h1 className="text-2xl font-bold">Çocuk Aktivite Paketi / Emergency Activity Pack</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Uzun süreli barınak durumlarında çocukları meşgul edecek çevrimdışı aktiviteler
        </p>
      </div>

      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                Tüm aktiviteler çevrimdışı yapılabilir. Malzemeler ev eşyalarıdır. Her aktivite yazdırılabilir.
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
            Yaş {age} / Age {age}
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
          Tüm Aktiviteleri Yazdır (Yaş {activeAge})
        </Button>
      </div>
    </div>
  );
}
