'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Sun, Battery, BatteryCharging, BatteryFull, Clock, Thermometer,
  Cloud, CloudSun, CloudRain, Calendar, TrendingUp, MapPin, Info, Save, Trash2
} from 'lucide-react';

interface SolarSession {
  id: string;
  startTime: string;
  endTime: string;
  panelWattage: number;
  batteryType: string;
  weather: 'gunesli' | 'bulutlu' | 'kapali';
  estimatedMah: number;
  date: string;
}

interface ProvinceSunData {
  name: string;
  monthlySunHours: number[];
}

const BATTERY_TYPES = [
  { label: 'Telefon / Phone', capacity: '3000-5000 mAh' },
  { label: 'Powerbank', capacity: '10000-20000 mAh' },
  { label: 'Laptop', capacity: '40000-60000 mAh' },
  { label: 'Akü / Battery Pack', capacity: '100000+ mAh' },
];

const WEATHER_FACTORS: Record<string, { label: string; icon: React.ReactNode; factor: number }> = {
  gunesli: { label: 'Gunesli / Sunny', icon: <Sun className="h-4 w-4 text-yellow-400" />, factor: 1.0 },
  bulutlu: { label: 'Bulutlu / Cloudy', icon: <CloudSun className="h-4 w-4 text-gray-400" />, factor: 0.4 },
  kapali: { label: 'Kapali / Overcast', icon: <CloudRain className="h-4 w-4 text-blue-400" />, factor: 0.15 },
};

const PROVINCE_SUN_DATA: ProvinceSunData[] = [
  { name: 'Istanbul', monthlySunHours: [3, 3.5, 4.5, 5.5, 7, 8, 8.5, 7.5, 6, 4.5, 3, 2.5] },
  { name: 'Ankara', monthlySunHours: [3, 4, 5, 6, 7.5, 8.5, 9, 8, 7, 5.5, 3.5, 2.5] },
  { name: 'Izmir', monthlySunHours: [3.5, 4, 5.5, 7, 8.5, 10, 11, 10, 8, 6, 4, 3] },
  { name: 'Antalya', monthlySunHours: [4, 5, 6, 7.5, 9.5, 10.5, 11, 10.5, 9, 7, 5, 3.5] },
  { name: 'Bursa', monthlySunHours: [3, 3.5, 4.5, 5.5, 7, 8, 8.5, 7.5, 6, 4.5, 3, 2.5] },
  { name: 'Adana', monthlySunHours: [3.5, 4.5, 5.5, 7, 9, 10, 10.5, 10, 8.5, 6.5, 4.5, 3.5] },
  { name: 'Konya', monthlySunHours: [3, 4, 5.5, 6.5, 8, 9, 9.5, 8.5, 7.5, 5.5, 3.5, 2.5] },
  { name: 'Gaziantep', monthlySunHours: [3.5, 4.5, 5.5, 7, 8.5, 9.5, 10, 9.5, 8, 6, 4, 3] },
  { name: 'Mersin', monthlySunHours: [4, 4.5, 6, 7, 9, 10, 10.5, 10, 8.5, 6.5, 4.5, 3.5] },
  { name: 'Diyarbakir', monthlySunHours: [3.5, 4, 5.5, 6.5, 8.5, 9.5, 10, 9.5, 8, 6, 4, 3] },
  { name: 'Erzurum', monthlySunHours: [2.5, 3.5, 4.5, 5.5, 7, 8, 8.5, 8, 6.5, 5, 3, 2] },
  { name: 'Trabzon', monthlySunHours: [2.5, 3, 4, 5, 6, 6.5, 7, 6.5, 5.5, 4, 3, 2] },
  { name: 'Samsun', monthlySunHours: [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8, 7, 6, 4.5, 3, 2.5] },
  { name: 'Kayseri', monthlySunHours: [3, 4, 5, 6, 7.5, 8.5, 9, 8.5, 7.5, 5.5, 3.5, 2.5] },
  { name: 'Eskisehir', monthlySunHours: [3, 3.5, 5, 6, 7.5, 8.5, 9, 8, 7, 5, 3.5, 2.5] },
];

const STORAGE_KEY = 'prepturk:solarSessions';

const MONTH_NAMES = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];

function loadSessions(): SolarSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: SolarSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function calculateEstimatedMah(wattage: number, hours: number, weather: string): number {
  const weatherFactor = WEATHER_FACTORS[weather]?.factor || 0.75;
  const efficiency = 0.75;
  const wattHours = wattage * hours * efficiency * weatherFactor;
  // Rough conversion: 1 Wh ≈ 270 mAh at 3.7V (typical battery)
  return Math.round(wattHours * 270);
}

export default function GunesSarjPage() {
  const [sessions, setSessions] = useState<SolarSession[]>(loadSessions);
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Form state
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return now.toTimeString().slice(0, 5);
  });
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2, 0, 0);
    return now.toTimeString().slice(0, 5);
  });
  const [panelWattage, setPanelWattage] = useState('20');
  const [batteryType, setBatteryType] = useState('Telefon / Phone');
  const [weather, setWeather] = useState<'gunesli' | 'bulutlu' | 'kapali'>('gunesli');

  // Calculator state
  const [selectedProvince, setSelectedProvince] = useState('Istanbul');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const calculateHours = (): number => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let hours = (eh + em / 60) - (sh + sm / 60);
    if (hours < 0) hours += 24;
    return hours;
  };

  const estimatedMah = calculateEstimatedMah(parseFloat(panelWattage) || 0, calculateHours(), weather);

  const handleSubmit = () => {
    const wattage = parseFloat(panelWattage);
    if (!wattage || wattage <= 0) return;

    const hours = calculateHours();
    if (hours <= 0) return;

    const session: SolarSession = {
      id: Date.now().toString(),
      startTime,
      endTime,
      panelWattage: wattage,
      batteryType,
      weather,
      estimatedMah: calculateEstimatedMah(wattage, hours, weather),
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [session, ...sessions];
    setSessions(updated);
    saveSessions(updated);

    // Reset form
    const now = new Date();
    now.setMinutes(0, 0, 0);
    setStartTime(now.toTimeString().slice(0, 5));
    now.setHours(now.getHours() + 2, 0, 0);
    setEndTime(now.toTimeString().slice(0, 5));
    setShowForm(false);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
  };

  const totalMah = sessions.reduce((sum, s) => sum + s.estimatedMah, 0);
  const totalSessions = sessions.length;

  const provinceData = PROVINCE_SUN_DATA.find((p) => p.name === selectedProvince);
  const currentSunHours = provinceData?.monthlySunHours[selectedMonth] || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sun className="h-7 w-7 text-yellow-400" />
            Gunes Sarj Takibi
          </h1>
          <p className="text-nomad-slate text-sm">Solar Charging Session Tracker</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCalculator(!showCalculator)}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Hesaplayici
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <BatteryCharging className="h-4 w-4 mr-1" />
            Yeni Oturum
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-nomad-border">
          <CardContent className="p-4 text-center">
            <BatteryCharging className="h-6 w-6 text-nomad-green mx-auto mb-1" />
            <p className="text-2xl font-bold text-nomad-green">{totalSessions}</p>
            <p className="text-xs text-nomad-slate">Toplam Oturum</p>
          </CardContent>
        </Card>
        <Card className="border-nomad-border">
          <CardContent className="p-4 text-center">
            <BatteryFull className="h-6 w-6 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-400">{(totalMah / 1000).toFixed(0)}K</p>
            <p className="text-xs text-nomad-slate">Toplam mAh</p>
          </CardContent>
        </Card>
        <Card className="border-nomad-border">
          <CardContent className="p-4 text-center">
            <Sun className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-400">{currentSunHours}</p>
            <p className="text-xs text-nomad-slate">Gunluk Saat ({selectedProvince})</p>
          </CardContent>
        </Card>
        <Card className="border-nomad-border">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-400">{MONTH_NAMES[selectedMonth]}</p>
            <p className="text-xs text-nomad-slate">Aktif Ay</p>
          </CardContent>
        </Card>
      </div>

      {/* Calculator */}
      {showCalculator && provinceData && (
        <Card className="border-blue-700 bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Gunes Maruziyet Hesaplayici / Solar Exposure Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Eyalet Sec / Select Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  {PROVINCE_SUN_DATA.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ay / Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sun Hours Chart */}
            <div>
              <h4 className="text-sm font-medium mb-2">Aylik Ortalama Gunes Saatleri / Monthly Average Sun Hours</h4>
              <div className="flex items-end gap-1 h-32">
                {provinceData.monthlySunHours.map((hours, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-nomad-slate">{hours}</span>
                    <div
                      className={`w-full rounded-t ${i === selectedMonth ? 'bg-yellow-400' : 'bg-nomad-border'}`}
                      style={{ height: `${(hours / 12) * 100}%` }}
                    />
                    <span className="text-xs text-nomad-slate hidden md:block">{MONTH_NAMES[i].slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-yellow-950/30 border border-yellow-800 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-300 mb-2">Oneriler / Recommendations</h4>
              <ul className="space-y-1 text-sm text-yellow-200">
                {currentSunHours >= 7 && <li>{selectedProvince}'da {MONTH_NAMES[selectedMonth]} ayinda guzel gunlerde 7+ saat gunes var -- sabah 07:00 - ogleden sonra 16:00 arasi en iyi sarj zamani.</li>}
                {currentSunHours >= 4 && currentSunHours < 7 && <li>{selectedProvince}'da {MONTH_NAMES[selectedMonth]} ayinda ortalama {currentSunHours} saat gunes var. Sabah erken ve ogle arasi en verimli zamanlar.</li>}
                {currentSunHours < 4 && <li>{selectedProvince}'da {MONTH_NAMES[selectedMonth]} ayinda gunes saati dusuk ({currentSunHours} saat). Mumkunse daha gunesli bir bolgeye tasıyın veya buyuk panel kullanın.</li>}
                <li>En verimli saatler: 10:00 - 14:00 arasi</li>
                <li>Paneli gunese dik acida tutun</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Session Form */}
      {showForm && (
        <Card className="border-nomad-green/50 bg-nomad-green/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BatteryCharging className="h-5 w-5 text-nomad-green" />
              Yeni Sarj Oturumu / New Charging Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Baslangic Saati / Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bitis Saati / End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Panel Wattaji / Panel Wattage</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={panelWattage}
                    onChange={(e) => setPanelWattage(e.target.value)}
                    min="1"
                    className="w-24 h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  />
                  <span className="text-sm text-nomad-slate self-center">Watt</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Batarya Tipi / Battery Type</label>
                <select
                  value={batteryType}
                  onChange={(e) => setBatteryType(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  {BATTERY_TYPES.map((bt) => (
                    <option key={bt.label} value={bt.label}>{bt.label} ({bt.capacity})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weather Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Hava Durumu / Weather</label>
              <div className="flex gap-2">
                {(Object.entries(WEATHER_FACTORS) as [string, typeof WEATHER_FACTORS[keyof typeof WEATHER_FACTORS]][]).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setWeather(key as 'gunesli' | 'bulutlu' | 'kapali')}
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                      weather === key
                        ? 'border-nomad-green bg-nomad-green/10'
                        : 'border-nomad-border bg-nomad-bg hover:border-nomad-green/30'
                    }`}
                  >
                    <div className="flex justify-center mb-1">{value.icon}</div>
                    <p className="text-sm font-medium">{value.label}</p>
                    <p className="text-xs text-nomad-slate">{(value.factor * 100).toFixed(0)}% verim</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nomad-slate">Tahmini Kazanç / Estimated Gain</p>
                  <p className="text-3xl font-bold text-nomad-green">{estimatedMah.toLocaleString()} mAh</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-nomad-slate">Sure / Duration</p>
                  <p className="text-xl font-semibold">{calculateHours().toFixed(1)} saat</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Iptal
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Oturum Gecmisi / Session History
          </CardTitle>
          <CardDescription>{sessions.length} oturum kaydedildi</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-nomad-slate text-center py-8">
              Henuz sarj oturumu kaydedilmedi. "Yeni Oturum" butonuna tiklayarak baslayin.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-nomad-bg rounded-lg border border-nomad-border">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      {WEATHER_FACTORS[session.weather]?.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{session.batteryType}</p>
                      <p className="text-xs text-nomad-slate">
                        {session.date} | {session.startTime} - {session.endTime}
                      </p>
                      <p className="text-xs text-nomad-slate">
                        {session.panelWattage}W panel | {WEATHER_FACTORS[session.weather]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-nomad-green">+{session.estimatedMah.toLocaleString()}</p>
                      <p className="text-xs text-nomad-slate">mAh</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSession(session.id)}
                      className="h-8 w-8 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Battery Health Tracker */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5" />
            Batarya Sagligi / Battery Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-medium mb-2">Sarj Dongusu Tahminleri / Charge Cycle Estimates</h4>
            <ul className="space-y-1 text-sm text-nomad-slate">
              <li>Telefon bataryasi: ~500-800 dongu omru (2-3 yil)</li>
              <li>Powerbank: ~300-500 dongu omru (1-2 yil)</li>
              <li>Laptop bataryasi: ~300-1000 dongu omru (2-4 yil)</li>
              <li>Kursun-asit aku: ~200-300 dongu omru (2-3 yil)</li>
              <li>Lityum aku: ~2000-5000 dongu omru (5-10 yil)</li>
            </ul>
          </div>
          <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg">
            <h4 className="text-sm font-medium text-amber-300 mb-2">Batarya Omrunu Uzatma / Extend Battery Life</h4>
            <ul className="space-y-1 text-sm text-amber-200">
              <li>Asiri sicaktan koruyun (maksimum 45C)</li>
              <li>Tamamen bosaltmamaya calisin (minimum %20)</li>
              <li>%100'e kadar doldurmak yerine %80'de birakin</li>
              <li>Uzun sureli saklama icin %50 sarj seviyesinde tutun</li>
              <li>Duzenli kullanin -- hareketsizlik bataryaya zarar verir</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Nasil Hesaplanir / How It's Calculated</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Tahmini mAh = Panel Wattaji x Saat x Verim (0.75) x Hava Durumu Faktoru x 270
          </p>
          <p className="text-xs text-nomad-slate">
            (Estimated mAh = Panel Watts x Hours x Efficiency (0.75) x Weather Factor x 270 conversion factor at 3.7V)
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-nomad-slate mt-2">
            <div className="p-2 bg-nomad-surface rounded">
              <Sun className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
              <p>Gunesli: %100</p>
            </div>
            <div className="p-2 bg-nomad-surface rounded">
              <CloudSun className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p>Bulutlu: %40</p>
            </div>
            <div className="p-2 bg-nomad-surface rounded">
              <CloudRain className="h-4 w-4 mx-auto mb-1 text-blue-400" />
              <p>Kapali: %15</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
