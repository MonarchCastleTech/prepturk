'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Brain, Heart, Users, BookOpen, Info, Wind, Clock, AlertTriangle,
  ChevronDown, ChevronUp, Activity, Shield, HandHeart
} from 'lucide-react';

const GROUNDING_TECHNIQUES = [
  {
    id: '54321',
    name: '5-4-3-2-1 Topraklama',
    nameEn: '5-4-3-2-1 Grounding Technique',
    steps: [
      'Gorebildiginiz 5 seyi bulun: Duvar, pencere, masa, agac, gok yuzu',
      'Dokunabildiginiz 4 seyi hissedin: Kiyafetiniz, yer, sandalye, sacliniz',
      'Duyabildiginiz 3 sesi dinleyin: Kuslar, ruzgar, baska insanlar',
      'Koklayabildiginiz 2 seyi bulun: Temiz hava, yemek kokusu',
      'Tadabildiginiz 1 sey: Su, sakiz, cay',
    ],
  },
  {
    id: 'breathing',
    name: '4-7-8 Nefes Teknigi',
    nameEn: '4-7-8 Breathing Method',
    steps: [
      'Burnunuzdan 4 saniye nefes alin',
      'Nefesinizi 7 saniye tutun',
      'Agzinizdan 8 saniye yavasca verin',
      'Bu donguyu 4 kez tekrarlayin',
      'Kalp atisiniz yavaslayacak, kaslariniz gevseyecek',
    ],
  },
  {
    id: 'muscle',
    name: 'Progresif Kas Gevsemesi',
    nameEn: 'Progressive Muscle Relaxation',
    steps: [
      'Ayak parmaklarinizdan baslayin -- 5 saniye gerin, sonra birakin',
      'Bacak kaslarinizi gerin -- 5 saniye, birakin',
      'Karın kaslarinizi gerin -- 5 saniye, birakin',
      'Ellerinizi yumruk yapin -- 5 saniye, birakin',
      'Kollarinizi gerin -- 5 saniye, birakin',
      'Omuzlarinizi kulaklariniza cekin -- 5 saniye, birakin',
      'Yuz kaslarinizi gerin -- 5 saniye, birakin',
      'Tum vucutla derin nefes alin',
    ],
  },
  {
    id: 'mindfulness',
    name: 'Farkindalik Egzersizi',
    nameEn: 'Mindfulness Exercise',
    steps: [
      'Rahat bir pozisyonda oturun veya yatin',
      'Gozlerinizi kapatin (mumkunse)',
      'Sadece nefesinize odaklanin',
      'Dusunceler gelirse, onlari gozlemleyin ve birakin',
      'Her nefeste "al" ve "ver" deyin',
      '5-10 dakika devam edin',
    ],
  },
];

export default function PsikolojikSaglikPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('acute');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-7 w-7 text-purple-400" />
          Psikolojik Saglik ve Kriz Psikolojisi
        </h1>
        <p className="text-nomad-slate text-sm">Mental Health & Crisis Psychology</p>
      </div>

      {/* Support Message */}
      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-6 w-6 text-nomad-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-nomad-green">Yalniz Degilsiniz / You're Not Alone</p>
            <p className="text-sm text-nomad-slate mt-1">
              Afet sonrasi psikolojik tepkiler normaldir. Bu gecici bir surec. Destek almak onemlidir.
            </p>
            <p className="text-xs text-nomad-slate mt-1">
              (Post-disaster psychological responses are normal. This is a temporary process. Support is important.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-3">
        {/* Acute Stress Response */}
        <Card className="border-nomad-border">
          <button
            onClick={() => toggleSection('acute')}
            className="w-full flex items-center justify-between p-4 hover:bg-nomad-border/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="font-semibold">Akut Stres Tepkisi / Acute Stress Response</h3>
                <p className="text-xs text-nomad-slate">What's normal vs what needs attention</p>
              </div>
            </div>
            {expandedSection === 'acute' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'acute' && (
            <CardContent className="p-4 space-y-4">
              {/* What's Normal */}
              <div className="p-4 bg-green-950/30 border border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-300 flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4" />
                  Normal Tepkiler / Normal Responses
                </h4>
                <ul className="space-y-2">
                  {['Sok ve inanmamak', 'Inkar: "Bu gercek olamaz"', 'Anksiyete ve korku', 'Uykusuzluk', 'Sinirlilik ve tahammulsuzluk', 'Zorluk cekme', 'Ilgı kaybı', 'Hafiza sorunlari', 'Dikkat daginikligi'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-green-200/70 mt-3">
                  Bu belirtiler afet sonrasi ilk gunlerde ve haftalarda NORMALDIR. Zamanla gecer.
                </p>
              </div>

              {/* What Needs Attention */}
              <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-300 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  Dikkat Gerektiren / Needs Attention
                </h4>
                <ul className="space-y-2">
                  {['Panik ataklar: Ani, yogun korku nobetleri', 'Tamamen icine kapanma, konusmama', 'Oz zarar verme dusunceleri', 'Halusinasyonlar: Gercek disi seyler gormek/duymak', 'Tam islevsizlik: Hicbir sey yapamama', 'Siddetli intihar dusunceleri', 'Madde kullaniminda artis (alkol, ilac)', 'Cocugu ihmalkarligi veya terketme'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                      <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-red-200/70 mt-3">
                  Bu belirtiler profesyonel yardim gerektirir. Mumkunse saglik profesyoneline danisin.
                </p>
              </div>

              {/* Timeline */}
              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Surec / Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-red-900/50 text-red-300 border-0">Akut</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-200">Saatler - Gunler</p>
                      <p className="text-xs text-blue-200/70">Sok, inkar, korku, konfuzyon. Normal tepki.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-amber-900/50 text-amber-300 border-0">Kisa Vadeli</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-200">Haftalar</p>
                      <p className="text-xs text-blue-200/70">Anksiyete, kabuslar, tekrar yasama. Destek onemli.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-900/50 text-green-300 border-0">Uzun Vadeli</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-200">Aylar</p>
                      <p className="text-xs text-blue-200/70">Kabullenme, yeni rutinler, anlam bulma. Iyilesme baslar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Grounding Techniques */}
        <Card className="border-nomad-border">
          <button
            onClick={() => toggleSection('grounding')}
            className="w-full flex items-center justify-between p-4 hover:bg-nomad-border/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Wind className="h-6 w-6 text-cyan-400" />
              <div>
                <h3 className="font-semibold">Topraklama Teknikleri / Grounding Techniques</h3>
                <p className="text-xs text-nomad-slate">Anksiyete ve panik aninda kullanin</p>
              </div>
            </div>
            {expandedSection === 'grounding' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'grounding' && (
            <CardContent className="p-4 space-y-4">
              {GROUNDING_TECHNIQUES.map((technique) => (
                <div key={technique.id} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                  <h4 className="font-medium text-foreground mb-1">{technique.name}</h4>
                  <p className="text-xs text-nomad-slate mb-3">{technique.nameEn}</p>
                  <ol className="space-y-2">
                    {technique.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Helping Children */}
        <Card className="border-nomad-border">
          <button
            onClick={() => toggleSection('children')}
            className="w-full flex items-center justify-between p-4 hover:bg-nomad-border/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-pink-400" />
              <div>
                <h3 className="font-semibold">Cocuklara Yardim / Helping Children</h3>
                <p className="text-xs text-nomad-slate">Age-appropriate support strategies</p>
              </div>
            </div>
            {expandedSection === 'children' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'children' && (
            <CardContent className="p-4 space-y-4">
              <div className="p-4 bg-pink-950/30 border border-pink-800 rounded-lg">
                <h4 className="font-semibold text-pink-300 mb-3">Yasa Uygun Aciklama / Age-Appropriate Explanations</h4>
                <ul className="space-y-2 text-sm text-pink-200">
                  <li><strong>2-5 yas:</strong> Basit, somut aciklamalar. "Deprem oldu, bazi seyler kirlidi. Guvendeyiz."</li>
                  <li><strong>6-11 yas:</strong> Daha fazla detay. "Dogal afetler olur. Insanlar yardim ediyor."</li>
                  <li><strong>12+ yas:</strong> Yetiskin gibi konusun. Duygularini ifade etmesine izin verin.</li>
                </ul>
              </div>

              <div className="p-4 bg-green-950/30 border border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-3">Rutinleri Koruma / Maintaining Routines</h4>
                <ul className="space-y-2 text-sm text-green-200">
                  <li>Duzenli uyku saatleri (mumkun oldugunca)</li>
                  <li>Duzenli ogunler</li>
                  <li>Gun icinde aktivite planlari</li>
                  <li>Odev veya ogrenme zamanlari</li>
                  <li>Ailece birlikte zaman</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-3">Oyun ve Yaratici Aktiviteler / Play and Creative Activities</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>Cizim ve boyama: Duygularini ifade etmenin guvenli yolu</li>
                  <li>Hikaye anlatimi: Yasadiklarini isleme yardimci olur</li>
                  <li>Roller oyunlari: Kontrol hissi verir</li>
                  <li>Sarkilar ve tekerlemeler: Rahatlatir</li>
                  <li>Fiziksel oyun: Enerji atmasini saglar</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
                <h4 className="font-semibold text-amber-300 mb-3">Travma Belirtileri / Signs of Trauma in Children</h4>
                <ul className="space-y-2 text-sm text-amber-200">
                  <li>Geriye donus: Alt islatma, parmak emme (daha once birakmisti)</li>
                  <li>Kabuslar ve uyku sorunlari</li>
                  <li>Asiri baglanma: Ayrilmama korkusu</li>
                  <li>Ofke nobetleri veya icine kapanma</li>
                  <li>Oyun tekrarinda afet teması</li>
                  <li>Okul performansinda dusus</li>
                </ul>
              </div>

              <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Profesyonel Yardim Ne Zaman / When to Seek Professional Help
                </h4>
                <ul className="space-y-2 text-sm text-red-200">
                  <li>Belirtiler 4-6 haftadan fazla suruyorsa</li>
                  <li>Cocuk tamamen icine kapanmissa</li>
                  <li>Oz zarar verme dusunceleri veya davranislari varsa</li>
                  <li>Madde kullanimi varsa (erginler)</li>
                  <li>Gunluk islevlerini yapamiyorsa</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Community Resilience */}
        <Card className="border-nomad-border">
          <button
            onClick={() => toggleSection('community')}
            className="w-full flex items-center justify-between p-4 hover:bg-nomad-border/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-nomad-green" />
              <div>
                <h3 className="font-semibold">Topluluk Dayanikliligi / Community Resilience</h3>
                <p className="text-xs text-nomad-slate">Muhtarlar ve topluluk liderleri icin</p>
              </div>
            </div>
            {expandedSection === 'community' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'community' && (
            <CardContent className="p-4 space-y-4">
              <div className="p-4 bg-nomad-green/10 border border-nomad-green/30 rounded-lg">
                <h4 className="font-semibold text-nomad-green mb-3">Morali Koruma / Maintaining Morale</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Duzenli bilgilendirme yapin (gunluk brifingler)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Kucuk basarilari kutlayin (temiz su bulundu, barinak kuruldu)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Insanlara gorev verin -- mesguliyet morali yukseltir</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Umut mesajlari verin ama gercekci olun</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-purple-950/30 border border-purple-800 rounded-lg">
                <h4 className="font-semibold text-purple-300 mb-3">Grup Aktiviteleri / Group Activities</h4>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li><strong>Sarkı soyleme:</strong> Tanidik sarkilar topluluk bagini guclendirir</li>
                  <li><strong>Hikaye anlatimi:</strong> Yasli uyeler deneyimlerini paylassin</li>
                  <li><strong>Paylasilan ogunler:</strong> Birlikte yemek yemek toplulugu birlestirir</li>
                  <li><strong>Oyunlar:</strong> Kart oyunlari, kelime oyunlari, cocuk oyunlari</li>
                  <li><strong>Grup dualari veya meditasyon:</strong> Inanca gore</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-3">Bilgi Paylasimi / Information Sharing</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>Dogrumlanmis bilgileri paylasin</li>
                  <li><strong>So ylantilari onleyin:</strong> Kaynagi belirsiz bilgileri yaymayin</li>
                  <li>Gunluk brifingler yapin (sabah aksam)</li>
                  <li>Soru-cevap oturumlari duzenleyin</li>
                  <li>Resmi kaynaklardan gelen bilgileri oncilikleyin</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
                <h4 className="font-semibold text-amber-300 mb-3">Yalniz ve Yasli Bireyler / Supporting Elderly and Isolated</h4>
                <ul className="space-y-2 text-sm text-amber-200">
                  <li>Gunluk kontrol ziyaretleri yapin</li>
                  <li>Yalniz yasan bireyleri belirleyin ve takip edin</li>
                  <li>Fiziksel ihtiyaclarini karsilayin (ilaclar, yiyecek)</li>
                  <li>Konusma firsati verin -- dinleyin</li>
                  <li>Topluluk aktivitelerine dahil edin</li>
                  <li>Engelli bireylere ozel destek saglayin</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Long-term Coping */}
        <Card className="border-nomad-border">
          <button
            onClick={() => toggleSection('longterm')}
            className="w-full flex items-center justify-between p-4 hover:bg-nomad-border/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              <div>
                <h3 className="font-semibold">Uzun Vade Basa Cikma / Long-term Coping</h3>
                <p className="text-xs text-nomad-slate">Rebuilding and finding meaning</p>
              </div>
            </div>
            {expandedSection === 'longterm' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'longterm' && (
            <CardContent className="p-4 space-y-4">
              <div className="p-4 bg-indigo-950/30 border border-indigo-800 rounded-lg">
                <h4 className="font-semibold text-indigo-300 mb-3">Yeni Rutinler Olusturma / Establishing New Routines</h4>
                <ul className="space-y-2 text-sm text-indigo-200">
                  <li>Duzenli uyku ve yemek saatleri belirleyin</li>
                  <li>Gunluk hedefler koyun (kucuk, ulasilabilir)</li>
                  <li>Fiziksel aktiviteyi dahil edin (yuruyus, esneme)</li>
                  <li>Sosyal baglantilar kurun</li>
                  <li>Topluluk calismalarina katilin</li>
                  <li>Gunluk tutun veya dusuncelerinizi yazin</li>
                </ul>
              </div>

              <div className="p-4 bg-teal-950/30 border border-teal-800 rounded-lg">
                <h4 className="font-semibold text-teal-300 mb-3">Anlam ve Amac Bulma / Finding Meaning and Purpose</h4>
                <ul className="space-y-2 text-sm text-teal-200">
                  <li>Baskalarina yardim etmek anlami artirir</li>
                  <li>Topluluk iyilestirme calismalarina katilin</li>
                  <li>Yeni beceriler ogrenin</li>
                  <li>Gecmis deneyimlerden gic cikarin</li>
                  <li>Gelecek icin planlar yapin (kucuk adimlarla)</li>
                  <li>Minnettarlik uygulayin (her gun 3 sey)</li>
                </ul>
              </div>

              <div className="p-4 bg-nomad-green/10 border border-nomad-green/30 rounded-lg">
                <h4 className="font-semibold text-nomad-green mb-3">Topluluk Yeniden Insa / Community Rebuilding</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Ortak projeler planlayin (temizlik, yapim, organizasyon)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Anma etkinlikleri duzenleyin</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Topluluk hafizasi olusturun (hikayeler, dersler)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Gelecek afetlere hazirlik planlari yapin</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <HandHeart className="h-4 w-4" />
                  Profesyonel Yardim Mevcut Oldugunda / When Professional Help Becomes Available
                </h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>Psikolojik destek hizmetlerinden yararlanin</li>
                  <li>Travma sonrasi stres bozuklugu (TSSB) icin terapi arayin</li>
                  <li>Destek gruplarina katilin</li>
                  <li>Aile terapisi dusunun</li>
                  <li>Cocuklar icin oyun terapisi</li>
                  <li>Ilacl tedavisi gerekebilir (psikiyatrist)</li>
                </ul>
                <p className="text-xs text-blue-200/70 mt-3">
                  ALO 182: Saglik Bakanligi danisma hatti (calisiyorsa)
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Footer */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Onemli Not / Important Note</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Bu bilgiler genel rehberlik amaclidir. Ciddi psikolojik sorunlar icin her zaman bir ruh sagligi
            profesyoneline danisin. Afet sonrasi psikolojik destek onemlidir ve profesyonel yardim
            mevcut oldugunda mutlaka yararlanilmalidir.
          </p>
          <p className="text-xs text-nomad-slate">
            (This information is for general guidance only. For serious psychological concerns, always consult
            a mental health professional. Post-disaster psychological support is important.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
      {children}
    </span>
  );
}
