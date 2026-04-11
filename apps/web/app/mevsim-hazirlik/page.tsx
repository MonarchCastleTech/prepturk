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

const MONTH_NAMES = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];

function getMonthChecklist(month: number): string[] {
  const checklists: Record<number, string[]> = {
    0: [ // January
      'Isitma yakiti kontrolu', 'Boru izolasyonu kontrolu', 'Kis acil durum kitini hazirla', 'Pilleri kontrol et',
      'Kalin giysileri hazirla', 'Buz kiricilar hazir mi', 'Acil isitma alternatifleri (mum, battaniye)', 'Su donmasi onlemi',
    ],
    1: [ // February
      'Isitma yakiti kontrolu', 'Boru izolasyonu', 'Ilkbahar planlamasi basla', 'Pilleri kontrol et',
      'Kis acil durum kitini devam', 'Yedek isitma kaynaklari', 'Su deposu donma kontrolu', 'Ilaclari kontrol et',
    ],
    2: [ // March
      'Kis-ilkbahar gecisi hazirliklari', 'Sel riski degerlendirmesi', 'Acil durum malzemelerini yenile', 'Pilleri kontrol et',
      'Yagmur suyu toplama hazirliklari', 'Disari su borularini kontrol et', 'Cati oluklarini temizle', 'Acil durum planini guncelle',
    ],
    3: [ // April
      'Ilkbahar hazirliklari', 'Sel bolgelerini kontrol et', 'Bahce planlamasi', 'Acil durum kitini guncelle',
      'Ilac dolabini kontrol et', 'Su depolarini temizle', 'Cati ve cephe kontrolu', 'Yangin son durucu kontrolu',
    ],
    4: [ // May
      'Siddetli hava hazirliklari', 'Cati kontrolu', 'Yaz icin su stokla', 'Sivrisinek koruma hazirla',
      'Gunes koruma urunleri kontrol et', 'Su tuketimini artirmaya basla', 'Ilac stoklarini kontrol et', 'Alternatif su kaynaklari belirle',
    ],
    5: [ // June
      'Sicaklik hazirliklari', 'Sogutma sistemlerini kontrol et', 'Gunes koruma hazirla', 'Su tuketimini artir',
      'Gida saklama kontrolu (bozulma riski)', 'Elektrik sistemlerini kontrol et', 'Yangin son durucu kontrol et', 'Acil durum kitini sicak hava icin guncelle',
    ],
    6: [ // July
      'Orman yangini riski degerlendirmesi', 'Sicak carpmasi onleme', 'Su koruma uygulamalari', 'Gida sogutma onlemleri',
      'Yangin cikis yollari belirle', 'Serin barinak alani hazirla', 'Elektrolit stokla', 'Gunes kremlerini kontrol et',
    ],
    7: [ // August
      'Malzemeleri devam ettir', 'Sonbahar hazirliklarina basla', 'Su stoklarini kontrol et', 'Isitma sistemlerini planla',
      'Okul hazirliklari', 'Ilac dolabini kontrol et', 'Acil durum planini guncelle', 'Pilleri yenile',
    ],
    8: [ // September
      'Okula donus hazirliklari', 'Sonbahar gecisi', 'Isitma sistemlerini kontrol et', 'Acil durum kitini yenile',
      'Yagmur mevsimi hazirliklari', 'Borularda donma kontrolu', 'Yedek yakit stokla', 'Kalin battaniye ve giysileri cikar',
    ],
    9: [ // October
      'Isitma sistemi bakimi', 'Kis hazirliklari', 'Malzemeleri yenile', 'Yakit stokla',
      'Boru izolasyonu', 'Acil durum kitini yenile', 'Pilleri kontrol et', 'Kis lastikleri ve zincir hazirla',
    ],
    10: [ // November
      'Kis hazirliklari tamamla', 'Yakit stokla', 'Boru izolasyonu tamamla', 'Acil durum kitini yenile',
      'Isitma alternatifleri hazirla', 'Jenerator varsa kontrol et', 'Gida stoklarini artir', 'Su depolarini donmaya karsi koru',
    ],
    11: [ // December
      'Tam kis modu', 'Bayram hazirliklari', 'Topluluk kontrolleri', 'Isitma yakiti kontrolu',
      'Acil durum kitini kontrol et', 'Pilleri yenile', 'Kalin giysileri hazirla', 'Komlari kontrol et',
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
    'Soguk, karli bolgeler. Sıcaklık -10C ila 10C.',
    'Soguk devam, kar riski. Sicaklık -5C ila 12C.',
    'Kis-ilkbahar gecisi. Yagmur ve sel riski. Sicaklık 0C ila 18C.',
    'Ilkbahar, yagmurlu. Sel riski artar. Sicaklık 5C ila 22C.',
    'Ilık, yagmurlu. Siddetli hava riski. Sicaklık 10C ila 28C.',
    'Sicak basliyor. Gunesli gunler artar. Sicaklık 15C ila 35C.',
    'Cok sicak. Kuraklik ve orman yangini riski. Sicaklık 20C ila 40C+.',
    'Sicak devam, sonbahara gecis basliyor. Sicaklık 18C ila 38C.',
    'Serinliyor, yagmur artar. Ruzgarli gunler. Sicaklık 10C ila 28C.',
    'Serin, yagmurlu. Isitma sistemlerini calistir. Sicaklık 5C ila 20C.',
    'Soguyor, ilk don riski. Kis hazirliklari tamamla. Sicaklık 0C ila 15C.',
    'Soguk, karli bolgeler. Tam kis modu. Sicaklık -10C ila 10C.',
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
            Mevsim Hazirlik Takvimi
          </h1>
          <p className="text-nomad-slate text-sm">Seasonal Preparedness Calendar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <CheckSquare className="h-4 w-4 mr-1" />
            Yazdir
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
            <h4 className="text-sm font-medium">Nasil Kullani / How to Use</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Her ay icin ozel hazirlik listesi vardir. O gune ait gorevleri tamamlayin ve notlar ekleyin.
            Tum veriler yerel olarak saklanir (localStorage). Yazdir butonu ile kontrol listesini yazdirabilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getMonthRisks(month: number): string[] {
  const risks: Record<number, string[]> = {
    0: ['Don', 'Kar', 'Buzlanma', 'Soguk', 'Boru donmasi', 'Isitma arizasi'],
    1: ['Don', 'Kar', 'Buzlanma', 'Soguk', 'Grip sezonu'],
    2: ['Sel', 'Siddetli yagmur', 'Don', 'Ruzgar', 'Toprak kaymasi'],
    3: ['Sel', 'Siddetli yagmur', 'Dolu', 'Ruzgar', 'Yildirim'],
    4: ['Siddetli firtina', 'Dolu', 'Sel', 'Yildirim', 'Sicak hava baslamasi'],
    5: ['Sicak carpmasi', 'Kuraklik', 'Orman yangini', 'Siddetli sicaklik'],
    6: ['Orman yangini', 'Sicak carpmasi', 'Kuraklik', 'Su kitligi', 'Siddetli sicaklik'],
    7: ['Sicak carpmasi', 'Orman yangini', 'Kuraklik', 'Ani firtina'],
    8: ['Siddetli yagmur', 'Sel', 'Ruzgar', 'Sicakligin dusmesi'],
    9: ['Soguk hava', 'Yagmur', 'Ruzgar', 'Ilk don riski', 'Sel'],
    10: ['Don', 'Kar', 'Soguk', 'Buzlanma', 'Firtina'],
    11: ['Don', 'Kar', 'Soguk', 'Buzlanma', 'Ulasim sorunlari'],
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
