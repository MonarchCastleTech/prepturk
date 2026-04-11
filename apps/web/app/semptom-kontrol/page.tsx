'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Thermometer, Wind, Droplets, Activity, AlertTriangle, AlertCircle,
  Info, ArrowLeft, Stethoscope, Heart, Brain, Bandage, Shield
} from 'lucide-react';

interface SymptomInfo {
  id: string;
  nameTr: string;
  nameEn: string;
  icon: React.ReactNode;
  immediateAction: string[];
  monitorAndReassess: string[];
  homeCare: string[];
  warningSigns112: string[];
  whatNotToDo: string[];
  firstAidSteps: string[];
  childrenNote?: string;
  elderlyNote?: string;
}

const SYMPTOMS: SymptomInfo[] = [
  {
    id: 'fever',
    nameTr: 'Ateş (Fever)',
    nameEn: 'Fever',
    icon: <Thermometer className="h-8 w-8 text-red-400" />,
    immediateAction: [
      'Ateş 39C uzeriyse: Ilık su ile silme yapın',
      'Parasetamol/ibuprofen verin (doz: yetişkin 500-1000mg, cocuk 10-15mg/kg)',
      'Bol sıvı verin (su, cay, corba)',
      'Hafif giydirin, battaniye ile sarmayın',
    ],
    monitorAndReassess: [
      'Her 4 saatte ateşi olcun',
      'Sıvı alımını takip edin',
      'Ilaclama sonrası 1-2 saat icinde dşsüş yoksa tekrar degerlendirin',
      'Belirtiler 3 gunden fazla suruyorsa doktora danısın',
    ],
    homeCare: [
      'Dinlenme: Yatak istirahati',
      'Sıvı: Gunde en az 2-3 litre',
      'Hafif yiyecekler: Corba, pilav, muz',
      'Oda sıcaklığını normal tutun (20-22C)',
      'Ilık duş (soguk degil)',
    ],
    warningSigns112: [
      'Ateş 40C uzeri ve dşsüşmşyorsa',
      'Bilinc bulanıklıgı veya konfşzyon',
      'Boyun sertligi (menenjit suphesi)',
      'Nobet gecirme',
      'Mor dokşntş (ciltte kanama)',
      'Nefes almada zorluk',
    ],
    whatNotToDo: [
      'ALCOL ile silme YAPMAYIN (zehirlenme riski)',
      'Aspirin cocuklara VERMEYIN (Reye sendromu riski)',
      'Battaniye ile sarmayın (ateşi daha da yukseltir)',
      'Buzlu su kullanmayın (titreme ateşi yukseltir)',
    ],
    firstAidSteps: [
      'Ateşi olcun (mumkunse)',
      'Hafif giydirin',
      'Ilık suyla alın, boyun, kasık bolgesini silin',
      'Parasetamol verin',
      'Bol sıvı icirin',
      '30 dakika sonra tekrar olcun',
    ],
    childrenNote: 'Cocuklarda 38.5C uzeri ateş onemlidir. 3 aydan kşcşk bebeklerde 38C uzeri ateş ACIL DURUM -- hemen 112\'yi arayın.',
    elderlyNote: 'Yaslılarda ateş dşsşk olabilir ama enfeksiyon cıddı olabilir. 37.8C uzeri dikkatle izlenmelidir.',
  },
  {
    id: 'cough',
    nameTr: 'Oksuruk (Cough)',
    nameEn: 'Cough',
    icon: <Wind className="h-8 w-8 text-cyan-400" />,
    immediateAction: [
      'Oksurugun tipini belirleyin: kuru veya balgamli',
      'Bal cayı veya ilık sıvı verin (1 yas ustu icin)',
      'Nemli hava saglayın (buharlı banyo)',
      'Yastıgı yukseltin (gece oksurugu icin)',
    ],
    monitorAndReassess: [
      'Oksuruk 2 haftadan fazla suruyorsa doktora danısın',
      'Balgam rengini takip edin (sarı/yesil = enfeksiyon)',
      'Ateş eslık ediyorsa dikkatli olun',
      'Nefes darlıgı varsa degerlendirin',
    ],
    homeCare: [
      'Bal-limon karısımı (1 yas ustu)',
      'Ilık sıvı tuketimi',
      'Tuzlu su ile gargara',
      'Buharlı banyo veya nemlendirici',
      'Sigara dumanından uzak durun',
    ],
    warningSigns112: [
      'Kanlı balgam',
      'Sıddetli nefes darlıgı',
      'Gogus agrısı ile birlikte',
      'Yuz veya dudaklarda morarma',
      'Yutkunma veya konusamama (tikanma)',
    ],
    whatNotToDo: [
      'Kuru oksuruk icin balgam sokucu ilac KULLANMAYIN',
      '1 yas alti cocuklara bal VERMEYIN',
      'Oksurugu tamamen baskılamayın (balgam birikebilir)',
    ],
    firstAidSteps: [
      'Hastayı oturtun veya yarı oturur pozisyona getirin',
      'Ilık sıvı verin',
      'Nemli hava saglayın',
      'Rahat nefes almasını saglayın',
    ],
    childrenNote: 'Cocuklarda oksuruk krup veya bronşıolıt belirtisi olabilir. Hırıltılı nefes varsa dikkatli olun.',
    elderlyNote: 'Yaslılarda kronik oksuruk KOAH veya kalp yetmezlıgı belirtisi olabilir.',
  },
  {
    id: 'breathing',
    nameTr: 'Nefes Darlıgı (Breathing Difficulty)',
    nameEn: 'Breathing Difficulty',
    icon: <Wind className="h-8 w-8 text-blue-400" />,
    immediateAction: [
      'HEMEN 112\'yi arayın',
      'Hastayı yarı oturur pozisyona getirin',
      'Dar giysileri gevsetin',
      'Temiz hava akısı saglayın',
      'Sakinlestirin -- panik nefes darlıgını artırır',
      'Varsa inhaler veya oksijen verin',
    ],
    monitorAndReassess: [
      'Nefes hızını sayın (normal: 12-20/dk)',
      'Dudak ve tirnak rengini kontrol edin (morarma = acil)',
      'Konuşabilip konuşamadığını kontrol edin',
      'Bilinc durumunu takip edin',
    ],
    homeCare: [
      'Dik oturma pozisyonu',
      'Dudak buzurerek nefes verme (pursed-lip breathing)',
      'Yavas, derin nefes egzersizleri',
      'Sakin ortam, stres azaltma',
    ],
    warningSigns112: [
      'Dudaklarda veya yuzde morarma',
      'Konuşamama (tek kelime bile)',
      'Gogus ic cekilmeleri',
      'Bilinc kaybi',
      'Nefes sesi gelmiyorsa',
      'Hizli nefes (30+/dk)',
    ],
    whatNotToDo: [
      'Hastayı yatırmayın (nefes alma zorlasır)',
      'Yiyecek veya icecek vermeyin (bogulma riski)',
      'Paniğe kapılmayın -- sakin olun',
    ],
    firstAidSteps: [
      '112\'yi arayın',
      'Yarı oturur pozisyonda oturtun',
      'Giysileri gevsetin',
      'Temiz hava saglayın',
      'Varsa ilaclerını verin',
      'Bilinc kaybı olursa: yatin, yan cevirin',
      'Nefes durursa: CPR baslayın',
    ],
  },
  {
    id: 'chest-pain',
    nameTr: 'Gogus Agrısı (Chest Pain)',
    nameEn: 'Chest Pain',
    icon: <Heart className="h-8 w-8 text-rose-400" />,
    immediateAction: [
      'HEMEN 112\'yi arayın',
      'Hastayı yarı oturur pozisyonda dinlendirin',
      'Varsa aspirin cıgnetin (300mg, alerjisi yoksa)',
      'Dar giysileri gevsetin',
      'Hareket etmesini engelleyin',
    ],
    monitorAndReassess: [
      'Agrının yayılımını takip edin (kol, cene, sırt)',
      'Nabız ve nefes hızını kontrol edin',
      'Terleme var mı kontrol edin',
      'Bilinc durumunu takip edin',
    ],
    homeCare: [
      'Sadece 112 gelene kadar bekleme',
      'Sakin tutun, hareket ettirmeyin',
      'Kapıyı acık bırakın (saglık ekibi icin)',
    ],
    warningSigns112: [
      'Goguste baskı, sıkısma veya agrı (5+ dakika)',
      'Sol kola yayılan agrı',
      'Cene, boyun veya sırt agrısı',
      'Soguk terleme',
      'Bulantı veya kusma',
      'Nefes darlıgı',
    ],
    whatNotToDo: [
      'Hastayı YURUTMEYIN veya tasımayın',
      'Yiyecek veya icecek VERMEYIN',
      'Ağrı kesici vermeyin (belirtileri maskeler)',
      'Yalnız bırakmayın',
    ],
    firstAidSteps: [
      '112\'yi arayın',
      'Yarı oturur pozisyonda oturtun',
      '300mg aspirin cıgnetin (alerji yoksa)',
      'Giysileri gevsetin',
      'Sakinlestirin',
      'Kalp durursa: CPR + 112',
    ],
  },
  {
    id: 'bleeding',
    nameTr: 'Kanamalı (Bleeding)',
    nameEn: 'Bleeding',
    icon: <Droplets className="h-8 w-8 text-red-400" />,
    immediateAction: [
      'Kanamaya dogrudan basinç uygulayın (temiz bez/gazli bez)',
      'Basıncı 10-15 dakika devamli uygulayın',
      'Kanayan bolgeyi yukseltin (mumkunse)',
      'Eldiven giyin (mumkunse)',
    ],
    monitorAndReassess: [
      'Kanamanın durup durmadıgını kontrol edin',
      'Sok belirtilerini takip edin (solukluk, terleme, hizli nabız)',
      'Yara kenarlarını kontrol edin (dıkıs gerekebilir mi)',
    ],
    homeCare: [
      'Kanamayı durduktan sonra: yarayı temiz suyla yıkayın',
      'Antiseptik uygulayın',
      'Steril pansuman yapın',
      'Yarayı kuru ve temiz tutun',
    ],
    warningSigns112: [
      'Kanamayı 15 dakikada durduramıyorsanız',
      'Fıskıran kanama (atardamar)',
      'Cok fazla kan kaybı (sok belirtileri)',
      'Vucutta cok sayıda yara',
      'Kafadan, gogustan veya karından kanama',
    ],
    whatNotToDo: [
      'Batık cismi cikarmayın (kanamayı artırır)',
      'Yaraya pamuk koymayın (yapısır)',
      'Yarayı alkole batırmayın (doku hasarı)',
      'Turnike KULLANMAYIN (son care olarak)',
    ],
    firstAidSteps: [
      'Eldiven giyin',
      'Temiz bez/gazli bez ile dogrudan basin',
      'Basıncı 10-15 dakika surdurun',
      'Kanayan yeri yukseltin',
      'Bez kanla dolundıgında YENISINI EKLEYIN (eskisini cikarmayın)',
      'Kanamayı durdurduktan sonra yarayı temizleyin',
      'Pansuman yapın',
    ],
  },
  {
    id: 'fracture',
    nameTr: 'Kırık/Burkulma (Fracture/Sprain)',
    nameEn: 'Fracture/Sprain',
    icon: <Bandage className="h-8 w-8 text-amber-400" />,
    immediateAction: [
      'Bolgeyi hareketsiz hale getirin (atelleme)',
      'Buz uygulayın (20 dakika, beze sarılı)',
      'Bolgeyi yukseltin',
      'Hareket ettirmeyin',
    ],
    monitorAndReassess: [
      'Morarma ve sisligi takip edin',
      'Parmak ucundaki hissi ve rengi kontrol edin',
      'Agri seviyesini degerlendirin',
    ],
    homeCare: [
      'RICE protokolu: Rest, Ice, Compression, Elevation',
      'Dinlenme: Bolgeyi kullanmayın',
      'Buz: 20 dakika, her 2-3 saatte',
      'Kompresyon: Elastik bandaj (cok sıkmayın)',
      'Yukseltme: Kalp seviyesinin uzerinde',
    ],
    warningSigns112: [
      'Acık kırık (kemik deriyi delmiş)',
      'Sekil bozuklugu (uzuv anormal acıda)',
      'Hissizlik veya karıncalanma',
      'Parmaklar morarmış veya soguk',
      'Kalca, uyluk veya omurga kırık suphesi',
    ],
    whatNotToDo: [
      'Kırık uzvu DUZELTMEYE calısmayın',
      'Acık kırıkta kemigi ice itmeyin',
      'Agırık kesici vermeyin (ameliyat gerekebilir)',
      'Kırık bolgeyi YUKLEMEYIN',
    ],
    firstAidSteps: [
      'Bolgeyi oldugu gibi sabitleyin',
      'Atel yapın (sert malzeme: tahta, karton, gazete)',
      'Eklem bolgelerini de sabitleyin (ust ve alt eklem)',
      'Buz uygulayın (beze sarılı)',
      'Bolgeyi yukseltin',
      'Tıbbi yardım cagrın',
    ],
    childrenNote: 'Cocuklarda buyume cizgisi kırıkları ozel dikkat gerektirir. Suphe durumunda her zaman doktora gorunun.',
    elderlyNote: 'Yaslılarda osteoporoz nedeniyle dusme sonucu kırık riski yuksektir. Kalca kırıkları ozellikle ciddidir.',
  },
  {
    id: 'burn',
    nameTr: 'Yanık (Burn)',
    nameEn: 'Burn',
    icon: <Thermometer className="h-8 w-8 text-orange-400" />,
    immediateAction: [
      'Yanık bolgeyi 10-20 dakika serin (buz degil!) akan su altında tutun',
      'Yanık bolgedeki kıyafetleri cikarin (yapısmamıssa)',
      'Yapısmış kıyafetleri cikarmayın',
      'Takı, saat gibi esyaları hemen cikarin (sisme olmadan)',
    ],
    monitorAndReassess: [
      'Yanık derecesini belirleyin (1., 2., 3. derece)',
      'Yanık alanını takip edin (buyuyor mu)',
      'Enfeksiyon belirtileri: kızarıklık, irin, ateş',
    ],
    homeCare: [
      '1. derece (kızarıklık): Aloe vera veya yanık kremi',
      'Steril pansuman yapın (yapısmayan)',
      'Agri kesici (parasetamol/ibuprofen)',
      'Bol sıvı tuketimi',
    ],
    warningSigns112: [
      '3. derece yanık (beyaz, koyu veya koseleşmiş cilt)',
      'Yuz, el, ayak, eklem veya cinsel bolge yanıkları',
      'Cok buyuk alan (yetiskin avucundan buyuk)',
      'Kimyasal veya elektrik yanıkları',
      'Solunum yolu yanıkları (duman soluma)',
      'Cocuk ve yaslılarda herhangi bir ciddi yanık',
    ],
    whatNotToDo: [
      'BUZ uygulamayın (doku hasarını artırır)',
      'Dis macunu, tereyag, yag SURMEYIN',
      'Su toplarını PATLATMAYIN',
      'Yaraya pamuk koymayın',
    ],
    firstAidSteps: [
      '10-20 dakika serin akan su',
      'Kıyafetleri ve takıları cikarin',
      'Steril pansuman yapın',
      'Agri kesici verin',
      'Yanık alanını yukseltin',
      'Ciddi ise 112\'yi arayın',
    ],
    childrenNote: 'Cocuklarda yanıklar daha hızlı derinlesir. Kucuk yanıklar bile ciddi olabilir.',
    elderlyNote: 'Yaslılarda cilt daha incedir, yanıklar daha derin olabilir. İyilesşme daha yavas seyreder.',
  },
  {
    id: 'allergy',
    nameTr: 'Alerji (Allergy)',
    nameEn: 'Allergy',
    icon: <AlertCircle className="h-8 w-8 text-pink-400" />,
    immediateAction: [
      'Alerjeni uzaklastırın',
      'Antihistaminik verin (mumkunse)',
      'EpiPen varsa: hemen uygulayın (dis uyluga)',
      'Hastayı yatin, bacakları yukseltin',
    ],
    monitorAndReassess: [
      'Nefes alma durumunu kontrol edin',
      'Sisme artıyor mu takip edin',
      'Nabız ve tansiyonu takip edin',
      'Cilt belirtilerini izleyin',
    ],
    homeCare: [
      'Hafif alerjiler icin: antihistaminik',
      'Kasinti icin: losyon veya kremler',
      'Soguk kompres (sisme icin)',
      'Alerjenden uzak durma',
    ],
    warningSigns112: [
      'Nefes almada zorluk veya hırıltı',
      'Dil, dudak veya bogazda sisme',
      'Bas donmesi veya bilinc kaybı',
      'Hızlı nabız, dusuk tansiyon',
      'Yaygın kurdeşen ve kızarıklık',
      'Bulantı, kusma, ishal (ciddi reaksiyon)',
    ],
    whatNotToDo: [
      'Hastayı oturtmayın (bayılma riski varsa)',
      'Agizdan bir sey vermeyin (bogaz sismisse)',
      'Alerjeni uzaklastırmadan baska sey YAPMAYIN',
    ],
    firstAidSteps: [
      'Alerjeni uzaklastırın',
      'EpiPen: dis uyluga dik olarak, 10 saniye basin',
      'Hastayı yatin, bacakları yukseltin',
      'Nefes almada sorun varsa: yarı oturur',
      '112\'yi arayın (anafilaksi suphesı varsa)',
      'Antihistaminik verin (hafif vakalarda)',
    ],
  },
  {
    id: 'nausea',
    nameTr: 'Bulantı/Kusma (Nausea/Vomiting)',
    nameEn: 'Nausea/Vomiting',
    icon: <AlertTriangle className="h-8 w-8 text-yellow-400" />,
    immediateAction: [
      'Hastayı yan cevirin (aspirasyon riski)',
      'Kusmuk temizligi yapın',
      'Agzı su ile calkalayın',
      'Kusma gectikten sonra kucuk yudumlar sıvı verin',
    ],
    monitorAndReassess: [
      'Sıvı alımını takip edin (dehidratasyon riski)',
      'Kusma sıklıgını kaydedin',
      'Kusmuk icerigini kontrol edin (kan var mı)',
      'Idrar cikisini takip edin',
    ],
    homeCare: [
      'Kucuk, sık sıvı yudumları (ORS veya su)',
      'Mideyi dinlendirin (1-2 saat hic bir sey vermeyin)',
      'Yavas yavas sıvı baslayın',
      'Tuzlu kraker, muz, pilav (BRAT diyeti)',
      'Zencefil cayi (bulantı icin)',
    ],
    warningSigns112: [
      'Kanlı kusmuk (kahve telvesi gorunumu)',
      'Sıddetli karın agrısı',
      '24 saatten uzun suren kusma',
      'Dehidratasyon: kuru agiz, az idrar, bas donmesi',
      'Kafa travması sonrası kusma',
      'Bilinc degisikligi',
    ],
    whatNotToDo: [
      'Hemen buyuk miktarda sıvı VERMEYIN (daha fazla kusturur)',
      'Agır, yaglı yiyecekler vermeyin',
      'Kusma ilacları doktora danısmadan KULLANMAYIN',
    ],
    firstAidSteps: [
      'Yan cevirin',
      'Temizlik yapın',
      '1-2 saat mideyi dinlendirin',
      'Kucuk yudumlar sıvı baslayın',
      'Tolerans varsa BRAT diyeti',
    ],
    childrenNote: 'Cocuklarda dehidratasyon hızlı gelisir. 6 saatten uzun kusma veya ishal varsa sıvı desteği sart.',
    elderlyNote: 'Yaslılarda dehidratasyon riski daha yuksektir. Belirtiler farklı olabilir (konfşzyon, halsizlik).',
  },
  {
    id: 'diarrhea',
    nameTr: 'Ishal (Diarrhea)',
    nameEn: 'Diarrhea',
    icon: <Droplets className="h-8 w-8 text-brown-400" />,
    immediateAction: [
      'ORS (Oral Rehidratasyon Solutu) verin',
      'Bol sıvı tuketimi saglayın',
      'El hijyenine dikkat edin (bulas riski)',
    ],
    monitorAndReassess: [
      'Sıvı alımını ve idrar cikisini takip edin',
      'Diskının icerigini kontrol edin (kan, mukus)',
      'Ateş eslık ediyor mu',
      'Dehidratasyon belirtileri',
    ],
    homeCare: [
      'ORS: 1 litre temiz su + 6 tat kasıgı seker + 1 cay kasıgı tuz',
      'BRAT diyeti: Muz, Pirinc, Elma puresi, Tost',
      'Probiyotik (yogurt, kefir)',
      'Dinlenme',
    ],
    warningSigns112: [
      'Kanlı veya siyah diski',
      'Sıddetli karın agrısı',
      'Yuksek ateş (39C+)',
      'Ciddi dehidratasyon: kuru agiz, gozler cukurlasmıs, idrar yok',
      '3 gunden uzun suren ishal',
    ],
    whatNotToDo: [
      'Ishal kesici ilac (loperamid) ENFEKSIYON suphesinde KULLANMAYIN',
      'Sut urunleri vermemeye calısın (gecici intolerans)',
      'Asırı sekerli icecekler vermeyin (ishali kotulestirir)',
    ],
    firstAidSteps: [
      'ORS hazırlayın ve verin',
      'Sıvı tuketimini artırın',
      'BRAT diyeti baslayın',
      'El hijyenini saglayın',
      'Belirtileri kaydedin',
    ],
    childrenNote: 'Cocuklarda ishal hizlica dehidratasyona yol acar. ORS sart. Emzirme devam edilmelidir.',
    elderlyNote: 'Yaslılarda dehidratasyon riski yuksek. Elektrolit dengesi onemlidir.',
  },
  {
    id: 'headache',
    nameTr: 'Bas Agrısı (Headache)',
    nameEn: 'Headache',
    icon: <Brain className="h-8 w-8 text-purple-400" />,
    immediateAction: [
      'Sessiz, karanlık bir odada dinlendirin',
      'Parasetamol veya ibuprofen verin',
      'Bol su icirin (dehidratasyon bas agrısı yapabilir)',
      'Alın ve sapaklara soguk kompres uygulayın',
    ],
    monitorAndReassess: [
      'Agrının siddetini ve surecini takip edin',
      'Tetikleyicileri belirleyin (stres, acılık, uykusuzluk)',
      'Baska belirtiler eslık ediyor mu',
    ],
    homeCare: [
      'Dinlenme: Sessiz, karanlık oda',
      'Soguk veya ilık kompres',
      'Bol sıvı',
      'Duzenli uyku',
      'Stres yonetimi: derin nefes, gevseme',
    ],
    warningSigns112: [
      'Ani, sıddetli bas agrısı ("hayatımda en kotu agrı")',
      'Kafa travması sonrası bas agrısı',
      'Bilinc degisikligi, konusma bozuklugu',
      'Boyun sertligi ve ateş',
      'Gorus degisikligi',
      'Kol/bacakta guc kaybı',
    ],
    whatNotToDo: [
      'Agri kesicileri asırı dozda KULLANMAYIN',
      'Kafa travması varsa agrı kesici VERMEYIN',
      'Belirtileri goz ardi etmeyin',
    ],
    firstAidSteps: [
      'Sessiz, karanlık odada dinlendirin',
      'Soguk kompres uygulayın',
      'Parasetamol verin',
      'Su icirin',
      '30 dakika sonra degerlendirin',
    ],
    elderlyNote: 'Yeni baslayan bas agrıları yaslılarda ciddi bir nedene isaret edebilir. Dikkatli olun.',
  },
  {
    id: 'unconscious',
    nameTr: 'Bilinc Kaybı (Unconsciousness)',
    nameEn: 'Unconsciousness',
    icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
    immediateAction: [
      'HEMEN 112\'yi arayın',
      'Cevre guvenligini saglayın',
      'Hastanın tepki durumunu kontrol edin (omuzlarına dokunun, seslenin)',
      'Nefes alıp almadıgını kontrol edin (10 saniye)',
      'Nefes alıyorsa: Recovery position (yan pozisyon)',
      'Nefes almıyorsa: CPR baslayın',
    ],
    monitorAndReassess: [
      'Nefes alıp almadıgını sürekli kontrol edin',
      'Nabız kontrolü',
      'Vucut ısısını koruyun (battaniye)',
      'Belirtileri 112\'ye rapor edin',
    ],
    homeCare: [
      'Bu bir ACIL DURUM -- evde tedavi YOK',
      '112 gelene kadar temel ilk yardım',
      'Hastayı sakin tutun',
    ],
    warningSigns112: [
      'HER TURLU bilinc kaybı ACILDIR',
      'Nefes almama',
      'Nabız almama',
      'Nobet eslık ediyorsa',
      'Travma sonrası bilinc kaybı',
    ],
    whatNotToDo: [
      'Hastayı SILKEMEYIN veya sarpmayın',
      'Agzına veya burnuna bir sey KOYMAYIN',
      'Yuzustu yatırmayın',
      'Yiyecek veya icecek VERMEYIN',
    ],
    firstAidSteps: [
      '112\'yi arayın',
      'Tepki kontrolu: "İyi misiniz?" deyin, omuzlarına dokunun',
      'Nefes kontrolu: 10 saniye bak-dinle-hisset',
      'Nefes alıyorsa: yan pozisyon',
      'Nefes almıyorsa: CPR (30 basin: 2 nefes)',
      'Vucut ısısını koruyun',
      '112 gelene kadar devam edin',
    ],
  },
];

export default function SemptomKontrolPage() {
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomInfo | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-nomad-green" />
            Semptom Kontrol
          </h1>
          <p className="text-nomad-slate text-sm">Symptom Checker -- Triaj Aracı (Triage Tool)</p>
        </div>
      </div>

      {/* Critical Disclaimer */}
      <Card className="border-red-700 bg-red-950/30">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-300 text-lg">UYARI / DISCLAIMER</p>
            <p className="text-red-200 mt-1">
              Bu sistem doktor degıldır. Saglık sorunlarınız icin doktorunuza danısın.
            </p>
            <p className="text-red-200/70 text-sm mt-1">
              (This system is NOT a doctor. Consult a healthcare professional for medical concerns. This is a TRIAGE tool only.)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-3 flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-nomad-green flex-shrink-0" />
          <span className="text-nomad-slate">
            Kaynaklar: Saglık Bakanlıgı, UZEM, WHO Acil Durum Kılavuzları
          </span>
        </CardContent>
      </Card>

      {/* Back button */}
      {selectedSymptom && (
        <Button variant="outline" size="sm" onClick={() => setSelectedSymptom(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri / Back
        </Button>
      )}

      {!selectedSymptom ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ana Semptomu Secin / Select Primary Symptom</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SYMPTOMS.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => setSelectedSymptom(symptom)}
                className="p-4 bg-nomad-surface border border-nomad-border rounded-lg hover:border-nomad-green/50 hover:bg-nomad-bg transition-all text-center flex flex-col items-center gap-2"
              >
                {symptom.icon}
                <div>
                  <p className="text-sm font-medium">{symptom.nameTr.split('(')[0].trim()}</p>
                  <p className="text-xs text-nomad-slate">{symptom.nameEn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {selectedSymptom.icon}
                <div>
                  <span>{selectedSymptom.nameTr}</span>
                  <p className="text-sm text-nomad-slate font-normal">{selectedSymptom.nameEn}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Immediate Action (Red) */}
              <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-300 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  ANINDA AKSIYON / IMMEDIATE ACTION (Kırmızı)
                </h3>
                <ol className="space-y-2">
                  {selectedSymptom.immediateAction.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                      <span className="h-5 w-5 rounded-full bg-red-900 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Monitor and Reassess (Yellow) */}
              <div className="p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
                <h3 className="font-semibold text-amber-300 flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4" />
                  IZLE VE DEGERLENDIR / MONITOR (Sarı)
                </h3>
                <ul className="space-y-2">
                  {selectedSymptom.monitorAndReassess.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Home Care (Green) */}
              <div className="p-4 bg-green-950/30 border border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-300 flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" />
                  EVDE BAKIM / HOME CARE (Yesil)
                </h3>
                <ul className="space-y-2">
                  {selectedSymptom.homeCare.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning Signs */}
              <div className="p-4 bg-red-950/40 border border-red-700 rounded-lg">
                <h3 className="font-semibold text-red-300 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5" />
                  112 ARANMASI GEREKEN BELIR TILER / CALL 112 IF
                </h3>
                <div className="space-y-2">
                  {selectedSymptom.warningSigns112.map((sign, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-200">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What NOT to Do */}
              <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-300 flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4" />
                  YAPMAYIN / WHAT NOT TO DO
                </h3>
                <ul className="space-y-2">
                  {selectedSymptom.whatNotToDo.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                      <span className="text-red-400 font-bold flex-shrink-0">X</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* First Aid Steps */}
              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-300 flex items-center gap-2 mb-3">
                  <Bandage className="h-4 w-4" />
                  ILK YARDIM ADIMLARI / FIRST AID STEPS
                </h3>
                <ol className="space-y-2">
                  {selectedSymptom.firstAidSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-200">
                      <span className="h-5 w-5 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Special Notes */}
              {(selectedSymptom.childrenNote || selectedSymptom.elderlyNote) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSymptom.childrenNote && (
                    <div className="p-3 bg-purple-950/30 border border-purple-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-300 mb-1">Cocuklar / Children</h4>
                      <p className="text-xs text-purple-200">{selectedSymptom.childrenNote}</p>
                    </div>
                  )}
                  {selectedSymptom.elderlyNote && (
                    <div className="p-3 bg-indigo-950/30 border border-indigo-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-indigo-300 mb-1">Yaslilar / Elderly</h4>
                      <p className="text-xs text-indigo-200">{selectedSymptom.elderlyNote}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Disclaimer */}
          <Card className="border-nomad-border bg-nomad-bg">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-nomad-slate">
                Bu bilgiler Saglık Bakanlıgı, UZEM ve WHO kılavuzlarına dayanmaktadır.
                Tibbi tanı veya tedavi yerine gecmez. Suphe durumunda her zaman saglık profesyoneline danısın.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
