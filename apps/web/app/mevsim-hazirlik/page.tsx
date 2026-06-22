'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Calendar, CheckSquare, Square, Sun, Snowflake, CloudRain, Wind,
  Droplets, Flame, Leaf, ThermometerSun, Info, Save
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  notes: string;
}

interface MonthData {
  monthIndex: number;
  weather: string;
  weatherIcon: React.ReactNode;
  risks: string[];
  checklist: ChecklistItem[];
}

const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function getMonthChecklist(month: number): string[] {
  const checklists: Record<number, string[]> = {
    0: [ // January
      'Isıtma yakıtı kontrolü', 'Boru izolasyonu kontrolü', 'Kış acil durum kitini hazırla', 'Pilleri kontrol et',
      'Kalın giysileri hazırla', 'Buz kırıcılar hazır mı', 'Acil ısıtma alternatifleri (mum, battaniye)', 'Su donması önlemi',
    ],
    1: [ // February
      'Isıtma yakıtı kontrolü', 'Boru izolasyonu', 'İlkbahar planlamasına başla', 'Pilleri kontrol et',
      'Kış acil durum kitine devam', 'Yedek ısıtma kaynakları', 'Su deposu donma kontrolü', 'İlaçları kontrol et',
    ],
    2: [ // March
      'Kış-ilkbahar geçişi hazırlıkları', 'Sel riski değerlendirmesi', 'Acil durum malzemelerini yenile', 'Pilleri kontrol et',
      'Yağmur suyu toplama hazırlıkları', 'Dışarı su borularını kontrol et', 'Çatı oluklarını temizle', 'Acil durum planını güncelle',
    ],
    3: [ // April
      'İlkbahar hazırlıkları', 'Sel bölgelerini kontrol et', 'Bahçe planlaması', 'Acil durum kitini güncelle',
      'İlaç dolabını kontrol et', 'Su depolarını temizle', 'Çatı ve cephe kontrolü', 'Yangın söndürücü kontrolü',
    ],
    4: [ // May
      'Şiddetli hava hazırlıkları', 'Çatı kontrolü', 'Yaz için su stokla', 'Sivrisinek koruma hazırla',
      'Güneş koruma ürünleri kontrol et', 'Su tüketimini artırmaya başla', 'İlaç stoklarını kontrol et', 'Alternatif su kaynakları belirle',
    ],
    5: [ // June
      'Sıcaklık hazırlıkları', 'Soğutma sistemlerini kontrol et', 'Güneş koruma hazırla', 'Su tüketimini artır',
      'Gıda saklama kontrolü (bozulma riski)', 'Elektrik sistemlerini kontrol et', 'Yangın söndürücü kontrol et', 'Acil durum kitini sıcak hava için güncelle',
    ],
    6: [ // July
      'Orman yangını riski değerlendirmesi', 'Sıcak çarpması önleme', 'Su koruma uygulamaları', 'Gıda soğutma önlemleri',
      'Yangın çıkış yolları belirle', 'Serin barınak alanı hazırla', 'Elektrolit stokla', 'Güneş kremlerini kontrol et',
    ],
    7: [ // August
      'Malzemeleri devam ettir', 'Sonbahar hazırlıklarına başla', 'Su stoklarını kontrol et', 'Isıtma sistemlerini planla',
      'Okul hazırlıkları', 'İlaç dolabını kontrol et', 'Acil durum planını güncelle', 'Pilleri yenile',
    ],
    8: [ // September
      'Okula dönüş hazırlıkları', 'Sonbahar geçişi', 'Isıtma sistemlerini kontrol et', 'Acil durum kitini yenile',
      'Yağmur mevsimi hazırlıkları', 'Borularda donma kontrolü', 'Yedek yakıt stokla', 'Kalın battaniye ve giysileri çıkar',
    ],
    9: [ // October
      'Isıtma sistemi bakımı', 'Kış hazırlıkları', 'Malzemeleri yenile', 'Yakıt stokla',
      'Boru izolasyonu', 'Acil durum kitini yenile', 'Pilleri kontrol et', 'Kış lastikleri ve zincir hazırla',
    ],
    10: [ // November
      'Kış hazırlıkları tamamla', 'Yakıt stokla', 'Boru izolasyonu tamamla', 'Acil durum kitini yenile',
      'Isıtma alternatifleri hazırla', 'Jeneratör varsa kontrol et', 'Gıda stoklarını artır', 'Su depolarını donmaya karşı koru',
    ],
    11: [ // December
      'Tam kış modu', 'Bayram hazırlıkları', 'Topluluk kontrolleri', 'Isıtma yakıtı kontrolü',
      'Acil durum kitini kontrol et', 'Pilleri yenile', 'Kalın giysileri hazırla', 'Komşuları kontrol et',
    ],
  };
  return checklists[month] || [];
}

const STORAGE_KEY = 'prepturk:checklistState';

function loadChecklistState(): Record<string, Record<string, { checked: boolean; notes: string }>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveChecklistState(state: Record<string, Record<string, { checked: boolean; notes: string }>>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getWeatherIcon(month: number): React.ReactNode {
  if (month <= 1) return <Snowflake className="h-6 w-6 text-blue-300" />;
  if (month <= 3) return <CloudRain className="h-6 w-6 text-cyan-400" />;
  if (month <= 5) return <Leaf className="h-6 w-6 text-green-400" />;
  if (month <= 7) return <ThermometerSun className="h-6 w-6 text-orange-400" />;
  if (month <= 9) return <Wind className="h-6 w-6 text-amber-400" />;
  return <Snowflake className="h-6 w-6 text-blue-300" />;
}

function getWeatherDescription(month: number): string {
  const descs = [
    'Soğuk, karlı bölgeler. Sıcaklık -10C ila 10C.',
    'Soğuk devam, kar riski. Sıcaklık -5C ila 12C.',
    'Kış-ilkbahar geçişi. Yağmur ve sel riski. Sıcaklık 0C ila 18C.',
    'İlkbahar, yağmurlu. Sel riski artar. Sıcaklık 5C ila 22C.',
    'Ilık, yağmurlu. Şiddetli hava riski. Sıcaklık 10C ila 28C.',
    'Sıcak başlıyor. Güneşli günler artar. Sıcaklık 15C ila 35C.',
    'Çok sıcak. Kuraklık ve orman yangını riski. Sıcaklık 20C ila 40C+.',
    'Sıcak devam, sonbahara geçiş başlıyor. Sıcaklık 18C ila 38C.',
    'Serinliyor, yağmur artar. Rüzgarlı günler. Sıcaklık 10C ila 28C.',
    'Serin, yağmurlu. Isıtma sistemlerini çalıştır. Sıcaklık 5C ila 20C.',
    'Soğuyor, ilk don riski. Kış hazırlıkları tamamla. Sıcaklık 0C ila 15C.',
    'Soğuk, karlı bölgeler. Tam kış modu. Sıcaklık -10C ila 10C.',
  ];
  return descs[month] || '';
}

export default function MevsimHazirlikPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [checklistState, setChecklistState] = useState<Record<string, Record<string, { checked: boolean; notes: string }>>>(loadChecklistState);
  const [saved, setSaved] = useState(false);

  const currentItems = getMonthChecklist(selectedMonth);
  const monthKey = selectedMonth.toString();

  useEffect(() => {
    setChecklistState(loadChecklistState());
  }, []);

  const toggleItem = (itemId: string) => {
    const monthState = checklistState[monthKey] || {};
    const itemState = monthState[itemId] || { checked: false, notes: '' };
    monthState[itemId] = { ...itemState, checked: !itemState.checked };
    const updated = { ...checklistState, [monthKey]: monthState };
    setChecklistState(updated);
    saveChecklistState(updated);
  };

  const updateNotes = (itemId: string, notes: string) => {
    const monthState = checklistState[monthKey] || {};
    const itemState = monthState[itemId] || { checked: false, notes: '' };
    monthState[itemId] = { ...itemState, notes };
    const updated = { ...checklistState, [monthKey]: monthState };
    setChecklistState(updated);
    saveChecklistState(updated);
  };

  const checkedCount = currentItems.filter((id) => checklistState[monthKey]?.[id]?.checked).length;
  const totalCount = currentItems.length;
  const completionPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleSave = () => {
    saveChecklistState(checklistState);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-7 w-7 text-nomad-green" />
            Mevsim Hazırlık Takvimi
          </h1>
          <p className="text-nomad-slate text-sm">Seasonal Preparedness Calendar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <CheckSquare className="h-4 w-4 mr-1" />
            Yazdır
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            {saved ? 'Kaydedildi' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="border-nomad-border no-print">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {MONTH_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                className={`p-2 rounded-lg border text-center transition-colors text-sm ${
                  selectedMonth === i
                    ? 'border-nomad-green bg-nomad-green/20 text-nomad-green'
                    : 'border-nomad-border bg-nomad-bg hover:border-nomad-green/30 text-nomad-slate'
                }`}
              >
                <p className="font-medium">{name.slice(0, 3)}</p>
                {i === new Date().getMonth() && (
                  <span className="text-xs text-nomad-green">*</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month Info */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getWeatherIcon(selectedMonth)}
            <div>
              <span>{MONTH_NAMES[selectedMonth]}</span>
              <p className="text-sm text-nomad-slate font-normal">{getWeatherDescription(selectedMonth)}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seasonal Risks */}
          <div>
            <h3 className="text-sm font-semibold text-nomad-slate mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Mevsimsel Riskler / Seasonal Risks
            </h3>
            <div className="flex flex-wrap gap-2">
              {getMonthRisks(selectedMonth).map((risk, i) => (
                <Badge key={i} className="bg-amber-900/30 text-amber-300 border-amber-700 text-xs">{risk}</Badge>
              ))}
            </div>
          </div>

          {/* Completion Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-nomad-slate">Tamamlanma / Completion</span>
              <span className={`font-bold ${completionPercent === 100 ? 'text-nomad-green' : completionPercent > 50 ? 'text-amber-400' : 'text-nomad-slate'}`}>
                %{completionPercent} ({checkedCount}/{totalCount})
              </span>
            </div>
            <div className="w-full bg-nomad-surface rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${completionPercent === 100 ? 'bg-nomad-green' : completionPercent > 50 ? 'bg-amber-500' : 'bg-nomad-border'}`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-nomad-slate flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-nomad-green" />
              Kontrol Listesi / Checklist
            </h3>
            {currentItems.map((item, i) => {
              const itemState = checklistState[monthKey]?.[item] || { checked: false, notes: '' };
              return (
                <div key={i} className="p-3 bg-nomad-bg rounded-lg border border-nomad-border">
                  <button
                    onClick={() => toggleItem(item)}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    {itemState.checked ? (
                      <CheckSquare className="h-5 w-5 text-nomad-green flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-5 w-5 text-nomad-slate flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${itemState.checked ? 'line-through text-nomad-slate' : 'text-foreground'}`}>
                      {item}
                    </span>
                  </button>
                  <input
                    type="text"
                    value={itemState.notes}
                    onChange={(e) => updateNotes(item, e.target.value)}
                    placeholder="Not ekle..."
                    className="mt-2 w-full h-8 rounded-md border border-nomad-border bg-nomad-surface px-3 text-xs text-foreground placeholder:text-nomad-slate focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Nasıl Kullanılır / How to Use</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Her ay için özel hazırlık listesi vardır. O aya ait görevleri tamamlayın ve notlar ekleyin.
            Tüm veriler yerel olarak saklanır (localStorage). Yazdır butonu ile kontrol listesini yazdırabilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getMonthRisks(month: number): string[] {
  const risks: Record<number, string[]> = {
    0: ['Don', 'Kar', 'Buzlanma', 'Soğuk', 'Boru donması', 'Isıtma arızası'],
    1: ['Don', 'Kar', 'Buzlanma', 'Soğuk', 'Grip sezonu'],
    2: ['Sel', 'Şiddetli yağmur', 'Don', 'Rüzgar', 'Toprak kayması'],
    3: ['Sel', 'Şiddetli yağmur', 'Dolu', 'Rüzgar', 'Yıldırım'],
    4: ['Şiddetli fırtına', 'Dolu', 'Sel', 'Yıldırım', 'Sıcak hava başlaması'],
    5: ['Sıcak çarpması', 'Kuraklık', 'Orman yangını', 'Şiddetli sıcaklık'],
    6: ['Orman yangını', 'Sıcak çarpması', 'Kuraklık', 'Su kıtlığı', 'Şiddetli sıcaklık'],
    7: ['Sıcak çarpması', 'Orman yangını', 'Kuraklık', 'Ani fırtına'],
    8: ['Şiddetli yağmur', 'Sel', 'Rüzgar', 'Sıcaklığın düşmesi'],
    9: ['Soğuk hava', 'Yağmur', 'Rüzgar', 'İlk don riski', 'Sel'],
    10: ['Don', 'Kar', 'Soğuk', 'Buzlanma', 'Fırtına'],
    11: ['Don', 'Kar', 'Soğuk', 'Buzlanma', 'Ulaşım sorunları'],
  };
  return risks[month] || [];
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
      {children}
    </span>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
