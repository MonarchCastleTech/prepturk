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
      'Görebildiğiniz 5 şeyi bulun: Duvar, pencere, masa, ağaç, gök yüzü',
      'Dokunabildiğiniz 4 şeyi hissedin: Kıyafetiniz, yer, sandalye, saçınız',
      'Duyabildiğiniz 3 sesi dinleyin: Kuşlar, rüzgar, başka insanlar',
      'Koklayabildiğiniz 2 şeyi bulun: Temiz hava, yemek kokusu',
      'Tadabildiğiniz 1 şey: Su, sakız, çay',
    ],
  },
  {
    id: 'breathing',
    name: '4-7-8 Nefes Tekniği',
    nameEn: '4-7-8 Breathing Method',
    steps: [
      'Burnunuzdan 4 saniye nefes alın',
      'Nefesinizi 7 saniye tutun',
      'Ağzınızdan 8 saniye yavaşça verin',
      'Bu döngüyü 4 kez tekrarlayın',
      'Kalp atışınız yavaşlayacak, kaslarınız gevşeyecek',
    ],
  },
  {
    id: 'muscle',
    name: 'Progresif Kas Gevşemesi',
    nameEn: 'Progressive Muscle Relaxation',
    steps: [
      'Ayak parmaklarınızdan başlayın -- 5 saniye gerin, sonra bırakın',
      'Bacak kaslarınızı gerin -- 5 saniye, bırakın',
      'Karın kaslarınızı gerin -- 5 saniye, bırakın',
      'Ellerinizi yumruk yapın -- 5 saniye, bırakın',
      'Kollarınızı gerin -- 5 saniye, bırakın',
      'Omuzlarınızı kulaklarınıza çekin -- 5 saniye, bırakın',
      'Yüz kaslarınızı gerin -- 5 saniye, bırakın',
      'Tüm vücutla derin nefes alın',
    ],
  },
  {
    id: 'mindfulness',
    name: 'Farkındalık Egzersizi',
    nameEn: 'Mindfulness Exercise',
    steps: [
      'Rahat bir pozisyonda oturun veya yatın',
      'Gözlerinizi kapatın (mümkünse)',
      'Sadece nefesinize odaklanın',
      'Düşünceler gelirse, onları gözlemleyin ve bırakın',
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
          Psikolojik Sağlık ve Kriz Psikolojisi
        </h1>
        <p className="text-nomad-slate text-sm">Mental Health & Crisis Psychology</p>
      </div>

      {/* Support Message */}
      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-6 w-6 text-nomad-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-nomad-green">Yalnız Değilsiniz / You're Not Alone</p>
            <p className="text-sm text-nomad-slate mt-1">
              Afet sonrası psikolojik tepkiler normaldir. Bu geçici bir süreç. Destek almak önemlidir.
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
                  {['Şok ve inanmamak', 'İnkar: "Bu gerçek olamaz"', 'Anksiyete ve korku', 'Uykusuzluk', 'Sinirlilik ve tahammülsüzlük', 'Zorluk çekme', 'İlgi kaybı', 'Hafıza sorunları', 'Dikkat dağınıklığı'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-green-200/70 mt-3">
                  Bu belirtiler afet sonrası ilk günlerde ve haftalarda NORMALDİR. Zamanla geçer.
                </p>
              </div>

              {/* What Needs Attention */}
              <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-300 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  Dikkat Gerektiren / Needs Attention
                </h4>
                <ul className="space-y-2">
                  {['Panik ataklar: Ani, yoğun korku nöbetleri', 'Tamamen içine kapanma, konuşmama', 'Öz zarar verme düşünceleri', 'Halüsinasyonlar: Gerçek dışı şeyler görmek/duymak', 'Tam işlevsizlik: Hiçbir şey yapamama', 'Şiddetli intihar düşünceleri', 'Madde kullanımında artış (alkol, ilaç)', 'Çocuğu ihmalkarlığı veya terk etme'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                      <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-red-200/70 mt-3">
                  Bu belirtiler profesyonel yardım gerektirir. Mümkünse sağlık profesyoneline danışın.
                </p>
              </div>

              {/* Timeline */}
              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Süreç / Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-red-900/50 text-red-300 border-0">Akut</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-200">Saatler - Günler</p>
                      <p className="text-xs text-blue-200/70">Şok, inkar, korku, konfüzyon. Normal tepki.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-amber-900/50 text-amber-300 border-0">Kısa Vadeli</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-200">Haftalar</p>
                      <p className="text-xs text-blue-200/70">Anksiyete, kabuslar, tekrar yaşama. Destek önemli.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-900/50 text-green-300 border-0">Uzun Vadeli</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-200">Aylar</p>
                      <p className="text-xs text-blue-200/70">Kabullenme, yeni rutinler, anlam bulma. İyileşme başlar.</p>
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
                <p className="text-xs text-nomad-slate">Anksiyete ve panik anında kullanın</p>
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
                <h3 className="font-semibold">Çocuklara Yardım / Helping Children</h3>
                <p className="text-xs text-nomad-slate">Age-appropriate support strategies</p>
              </div>
            </div>
            {expandedSection === 'children' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'children' && (
            <CardContent className="p-4 space-y-4">
              <div className="p-4 bg-pink-950/30 border border-pink-800 rounded-lg">
                <h4 className="font-semibold text-pink-300 mb-3">Yaşa Uygun Açıklama / Age-Appropriate Explanations</h4>
                <ul className="space-y-2 text-sm text-pink-200">
                  <li><strong>2-5 yaş:</strong> Basit, somut açıklamalar. "Deprem oldu, bazı şeyler kırıldı. Güvendeyiz."</li>
                  <li><strong>6-11 yaş:</strong> Daha fazla detay. "Doğal afetler olur. İnsanlar yardım ediyor."</li>
                  <li><strong>12+ yaş:</strong> Yetişkin gibi konuşun. Duygularını ifade etmesine izin verin.</li>
                </ul>
              </div>

              <div className="p-4 bg-green-950/30 border border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-3">Rutinleri Koruma / Maintaining Routines</h4>
                <ul className="space-y-2 text-sm text-green-200">
                  <li>Düzenli uyku saatleri (mümkün oldukça)</li>
                  <li>Düzenli öğünler</li>
                  <li>Gün içinde aktivite planları</li>
                  <li>Ödev veya öğrenme zamanları</li>
                  <li>Ailece birlikte zaman</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-3">Oyun ve Yaratıcı Aktiviteler / Play and Creative Activities</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>Çizim ve boyama: Duygularını ifade etmenin güvenli yolu</li>
                  <li>Hikaye anlatımı: Yaşadıklarını işleme yardımcı olur</li>
                  <li>Rol oyunları: Kontrol hissi verir</li>
                  <li>Şarkılar ve tekerlemeler: Rahatlatır</li>
                  <li>Fiziksel oyun: Enerji atmasını sağlar</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
                <h4 className="font-semibold text-amber-300 mb-3">Travma Belirtileri / Signs of Trauma in Children</h4>
                <ul className="space-y-2 text-sm text-amber-200">
                  <li>Geriye dönüş: Alt ıslatma, parmak emme (daha önce bırakmıştı)</li>
                  <li>Kabuslar ve uyku sorunları</li>
                  <li>Aşırı bağlanma: Ayrılmama korkusu</li>
                  <li>Öfke nöbetleri veya içine kapanma</li>
                  <li>Oyun tekrarında afet teması</li>
                  <li>Okul performansında düşüş</li>
                </ul>
              </div>

              <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Profesyonel Yardım Ne Zaman / When to Seek Professional Help
                </h4>
                <ul className="space-y-2 text-sm text-red-200">
                  <li>Belirtiler 4-6 haftadan fazla sürüyorsa</li>
                  <li>Çocuk tamamen içine kapanmışsa</li>
                  <li>Öz zarar verme düşünceleri veya davranışları varsa</li>
                  <li>Madde kullanımı varsa (erginler)</li>
                  <li>Günlük işlevlerini yapamıyorsa</li>
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
                <h3 className="font-semibold">Topluluk Dayanıklılığı / Community Resilience</h3>
                <p className="text-xs text-nomad-slate">Muhtarlar ve topluluk liderleri için</p>
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
                    <span>Düzenli bilgilendirme yapın (günlük brifingler)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Küçük başarıları kutlayın (temiz su bulundu, barınak kuruldu)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>İnsanlara görev verin -- meşguliyet morali yükseltir</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Umut mesajları verin ama gerçekçi olun</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-purple-950/30 border border-purple-800 rounded-lg">
                <h4 className="font-semibold text-purple-300 mb-3">Grup Aktiviteleri / Group Activities</h4>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li><strong>Şarkı söyleme:</strong> Tanıdık şarkılar topluluk bağını güçlendirir</li>
                  <li><strong>Hikaye anlatımı:</strong> Yaşlı üyeler deneyimlerini paylaşsın</li>
                  <li><strong>Paylaşılan öğünler:</strong> Birlikte yemek yemek topluluğu birleştirir</li>
                  <li><strong>Oyunlar:</strong> Kart oyunları, kelime oyunları, çocuk oyunları</li>
                  <li><strong>Grup duaları veya meditasyon:</strong> İnanca göre</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-3">Bilgi Paylaşımı / Information Sharing</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>Doğrulanmış bilgileri paylaşın</li>
                  <li><strong>Söylentileri önleyin:</strong> Kaynağı belirsiz bilgileri yaymayın</li>
                  <li>Günlük brifingler yapın (sabah akşam)</li>
                  <li>Soru-cevap oturumları düzenleyin</li>
                  <li>Resmi kaynaklardan gelen bilgileri önceliklendirin</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
                <h4 className="font-semibold text-amber-300 mb-3">Yalnız ve Yaşlı Bireyler / Supporting Elderly and Isolated</h4>
                <ul className="space-y-2 text-sm text-amber-200">
                  <li>Günlük kontrol ziyaretleri yapın</li>
                  <li>Yalnız yaşayan bireyleri belirleyin ve takip edin</li>
                  <li>Fiziksel ihtiyaçlarını karşılayın (ilaçlar, yiyecek)</li>
                  <li>Konuşma fırsatı verin -- dinleyin</li>
                  <li>Topluluk aktivitelerine dahil edin</li>
                  <li>Engelli bireylere özel destek sağlayın</li>
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
                <h3 className="font-semibold">Uzun Vade Başa Çıkma / Long-term Coping</h3>
                <p className="text-xs text-nomad-slate">Rebuilding and finding meaning</p>
              </div>
            </div>
            {expandedSection === 'longterm' ? <ChevronUp className="h-5 w-5 text-nomad-slate" /> : <ChevronDown className="h-5 w-5 text-nomad-slate" />}
          </button>

          {expandedSection === 'longterm' && (
            <CardContent className="p-4 space-y-4">
              <div className="p-4 bg-indigo-950/30 border border-indigo-800 rounded-lg">
                <h4 className="font-semibold text-indigo-300 mb-3">Yeni Rutinler Oluşturma / Establishing New Routines</h4>
                <ul className="space-y-2 text-sm text-indigo-200">
                  <li>Düzenli uyku ve yemek saatleri belirleyin</li>
                  <li>Günlük hedefler koyun (küçük, ulaşılabilir)</li>
                  <li>Fiziksel aktiviteyi dahil edin (yürüyüş, esneme)</li>
                  <li>Sosyal bağlantılar kurun</li>
                  <li>Topluluk çalışmalarına katılın</li>
                  <li>Günlük tutun veya düşüncelerinizi yazın</li>
                </ul>
              </div>

              <div className="p-4 bg-teal-950/30 border border-teal-800 rounded-lg">
                <h4 className="font-semibold text-teal-300 mb-3">Anlam ve Amaç Bulma / Finding Meaning and Purpose</h4>
                <ul className="space-y-2 text-sm text-teal-200">
                  <li>Başkalarına yardım etmek anlamı artırır</li>
                  <li>Topluluk iyileştirme çalışmalarına katılın</li>
                  <li>Yeni beceriler öğrenin</li>
                  <li>Geçmiş deneyimlerden güç çıkarın</li>
                  <li>Gelecek için planlar yapın (küçük adımlarla)</li>
                  <li>Minnettarlık uygulayın (her gün 3 şey)</li>
                </ul>
              </div>

              <div className="p-4 bg-nomad-green/10 border border-nomad-green/30 rounded-lg">
                <h4 className="font-semibold text-nomad-green mb-3">Topluluk Yeniden İnşa / Community Rebuilding</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Ortak projeler planlayın (temizlik, yapım, organizasyon)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Anma etkinlikleri düzenleyin</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Topluluk hafızası oluşturun (hikayeler, dersler)</span>
                  </li>
                  <li className="text-green-200 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-nomad-green mt-1.5 flex-shrink-0" />
                    <span>Gelecek afetlere hazırlık planları yapın</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <HandHeart className="h-4 w-4" />
                  Profesyonel Yardım Mevcut Olduğunda / When Professional Help Becomes Available
                </h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>Psikolojik destek hizmetlerinden yararlanın</li>
                  <li>Travma sonrası stres bozukluğu (TSSB) için terapi arayın</li>
                  <li>Destek gruplarına katılın</li>
                  <li>Aile terapisi düşünün</li>
                  <li>Çocuklar için oyun terapisi</li>
                  <li>İlaç tedavisi gerekebilir (psikiyatrist)</li>
                </ul>
                <p className="text-xs text-blue-200/70 mt-3">
                  ALO 182: Sağlık Bakanlığı danışma hattı (çalışıyorsa)
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
            <h4 className="text-sm font-medium">Önemli Not / Important Note</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Bu bilgiler genel rehberlik amaçlıdır. Ciddi psikolojik sorunlar için her zaman bir ruh sağlığı
            profesyoneline danışın. Afet sonrası psikolojik destek önemlidir ve profesyonel yardım
            mevcut olduğunda mutlaka yararlanılmalıdır.
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
