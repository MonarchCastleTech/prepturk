'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Home, Shield } from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Acil Çağrı', labelEn: 'Emergency', color: 'bg-red-600', icon: AlertTriangle },
  { number: '110', label: 'İtfaiye', labelEn: 'Fire Dept', color: 'bg-orange-600', icon: AlertTriangle },
  { number: '155', label: 'Polis', labelEn: 'Police', color: 'bg-blue-600', icon: Shield },
  { number: '156', label: 'Jandarma', labelEn: 'Gendarmerie', color: 'bg-green-700', icon: Shield },
  { number: '177', label: 'Orman Yangını', labelEn: 'Forest Fire', color: 'bg-amber-600', icon: AlertTriangle },
  { number: '183', label: 'Aile Hattı', labelEn: 'Family Line', color: 'bg-purple-600', icon: Home },
];

const QUICK_CARDS = [
  {
    id: 'deprem',
    titleTr: 'Deprem Sırasında',
    titleEn: 'During Earthquake',
    icon: '🏚️',
    steps: [
      'Çök -- Kapan -- Tutun',
      'Sağlam bir masanın altına gir',
      'Dış duvarlardan ve camlardan uzaklaş',
      'Sarsıntı bitene kadar yerinden kıpırdama',
      'Asansör KULLANMA',
      'Dışarı çıkarken merdiveni kullan',
    ],
  },
  {
    id: 'deprem-sonrasi',
    titleTr: 'Deprem Sonrasında',
    titleEn: 'After Earthquake',
    icon: '⚠️',
    steps: [
      'Gaz, su ve elektrik vanalarını kontrol et',
      'Gaz kaçağı varsa pencere aç, mum yakma',
      'Hasarlı binayı terk et',
      'Toplanma alanına git',
      '112\'yi ara -- yardım beklenen yerleri bildir',
      'Artçı sarsıntılara hazırlıklı ol',
    ],
  },
  {
    id: 'yangin',
    titleTr: 'Yangın Sırasında',
    titleEn: 'During Fire',
    icon: '🔥',
    steps: [
      '110\'u ara -- adresi tam söyle',
      'Kapıyı elinle yokla -- sıcaksa açma',
      'Eğilerek ilerle -- duman yükseklerde birikir',
      'Ağzını ve burnunu ıslak bezle kapat',
      'Asansörü KULLANMA',
      'Kıyafetlerin yanıyorsa: DUR, YUVARLAN, SÜRÜN',
    ],
  },
  {
    id: 'sel',
    titleTr: 'Sel Baskını Sırasında',
    titleEn: 'During Flood',
    icon: '🌊',
    steps: [
      'Yüksek bir yere çık',
      'Akan suda yürüme -- 15 cm düşmeye yeter',
      'Aracınla sel suyuna girme -- 30 cm aracı sürükler',
      'Elektrik hatlarından uzak dur',
      '112\'yi ara',
      'Suyla temas ettikten sonra ellerini yıka',
    ],
  },
  {
    id: 'ilk-yardim',
    titleTr: 'Temel İlk Yardım',
    titleEn: 'Basic First Aid',
    icon: '🩹',
    steps: [
      'Güvenlik -- önce kendi güvenliğini sağla',
      '112\'yi ara -- durumu açıkla',
      'Kanama varsa -- temiz bezle baskı uygula',
      'Bilinçsiz hastayı yan çevirmeden hareket ettirme',
      'Solunum kontrol et -- yoksa kalp masajı yap',
      'Şok pozisyonu: sırtüstü yatır, ayakları yukarı kaldır',
    ],
  },
  {
    id: 'gaz-kacagi',
    titleTr: 'Gaz Kaçağı Durumu',
    titleEn: 'Gas Leak',
    icon: '💨',
    steps: [
      'Pencere ve kapıları aç -- havalandır',
      'Elektrik anahtarlarına DOKUNMA -- kıvılcım çıkarır',
      'Mum, çakmak, kibrit KULLANMA',
      'Gaz vanasını kapat (mümkünse)',
      'Binayı terk et',
      'Dışarıdan 110\'u ara (İtfaiye)',
    ],
  },
];

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut: press "S" for SOS
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          setIsOpen((prev) => !prev);
        }
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-red-400/30 bg-red-600 text-xl font-bold text-white shadow-lg shadow-red-700/30 transition-all duration-200 hover:scale-105 hover:bg-red-700"
        aria-label="Acil Durum Paneli"
        title="Acil Durum (S)"
        data-tour="sos"
      >
        SOS
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setIsOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-nomad-bg border border-red-900/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-red-900/30 bg-nomad-bg p-4 z-10">
              <div>
                <h2 className="text-2xl font-bold text-red-400">Acil Durum</h2>
                <p className="text-sm text-nomad-slate">Çevrimdışı İletişim ve Prosedürler</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-nomad-slate hover:bg-nomad-surface hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Emergency Numbers -- LARGE, TAP-TARGETS */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Acil Numaralar</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {EMERGENCY_NUMBERS.map((num) => (
                    <a
                      key={num.number}
                      href={`tel:${num.number}`}
                      className={`${num.color} flex flex-col items-center gap-1 rounded-xl p-4 text-white transition-transform hover:scale-105 active:scale-95`}
                    >
                      <num.icon className="h-6 w-6" />
                      <span className="text-3xl font-bold">{num.number}</span>
                      <span className="text-xs opacity-90">{num.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Reference Cards */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Hızlı Başvuru Kartları</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {QUICK_CARDS.map((card) => (
                    <QuickCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuickCard({ card }: { card: typeof QUICK_CARDS[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-nomad-border bg-nomad-surface overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-nomad-card transition-colors"
      >
        <span className="text-3xl">{card.icon}</span>
        <div className="flex-1">
          <span className="font-semibold text-white">{card.titleTr}</span>
          <span className="block text-xs text-nomad-slate">{card.titleEn}</span>
        </div>
        <span className="text-nomad-slate text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-nomad-border p-4">
          <ol className="space-y-2">
            {card.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nomad-green/20 text-nomad-green font-bold text-xs">
                  {i + 1}
                </span>
                <span className="text-nomad-slate-light">{step}</span>
              </li>
            ))}
          </ol>
          <button
            onClick={() => window.print()}
            className="mt-3 w-full rounded-lg bg-nomad-surface border border-nomad-border px-3 py-2 text-sm text-nomad-slate hover:text-white transition-colors"
          >
            Bu Kartı Yazdır
          </button>
        </div>
      )}
    </div>
  );
}
