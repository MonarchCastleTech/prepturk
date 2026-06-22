'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Zap, Battery, BatteryCharging, Sun, Lightbulb, Monitor, Radio,
  Refrigerator, Droplets, AlertTriangle, Info, Save, MapPin
} from 'lucide-react';

interface PowerSetup {
  panelCount: number;
  panelWattage: number;
  batteryAh: number;
  batteryVoltage: number;
  inverterWattage: number;
  inverterEfficiency: number;
}

interface Device {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  watts: number;
  hoursPerDay: number;
  dailyWh: number;
  runtimeHours: number;
  canRun: boolean;
}

const PROVINCE_SUN_HOURS: Record<string, number> = {
  'Istanbul': 5, 'Ankara': 5.5, 'Izmir': 7, 'Antalya': 8, 'Bursa': 5,
  'Adana': 7, 'Konya': 6, 'Gaziantep': 6.5, 'Mersin': 7.5, 'Diyarbakir': 6.5,
  'Erzurum': 4.5, 'Trabzon': 4, 'Samsun': 5, 'Kayseri': 5.5, 'Eskisehir': 5.5,
};

const DEVICE_TEMPLATES = [
  { id: 'phone', name: 'Telefon Şarjı', nameEn: 'Phone Charging', icon: <Battery className="h-5 w-5 text-green-400" />, watts: 5 },
  { id: 'led', name: 'LED Ampul', nameEn: 'LED Light', icon: <Lightbulb className="h-5 w-5 text-yellow-400" />, watts: 10 },
  { id: 'laptop', name: 'Laptop', nameEn: 'Laptop', icon: <Monitor className="h-5 w-5 text-blue-400" />, watts: 45 },
  { id: 'radio', name: 'Radyo', nameEn: 'Radio', icon: <Radio className="h-5 w-5 text-purple-400" />, watts: 5 },
  { id: 'fridge', name: 'Mini Buzdolabı', nameEn: 'Mini Fridge', icon: <Refrigerator className="h-5 w-5 text-cyan-400" />, watts: 80 },
  { id: 'pump', name: 'Su Pompası', nameEn: 'Water Pump', icon: <Droplets className="h-5 w-5 text-blue-400" />, watts: 200 },
];

const STORAGE_KEY = 'prepturk:powerSetup';

const DEFAULT_SETUP: PowerSetup = {
  panelCount: 2,
  panelWattage: 100,
  batteryAh: 100,
  batteryVoltage: 12,
  inverterWattage: 1000,
  inverterEfficiency: 85,
};

function loadSetup(): PowerSetup {
  if (typeof window === 'undefined') return DEFAULT_SETUP;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SETUP;
  } catch { return DEFAULT_SETUP; }
}

function saveSetup(setup: PowerSetup) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
}

export default function GucHesaplayiciPage() {
  const [setup, setSetup] = useState<PowerSetup>(loadSetup);
  const [selectedProvince, setSelectedProvince] = useState('Istanbul');
  const [deviceHours, setDeviceHours] = useState<Record<string, number>>({
    phone: 2, led: 6, laptop: 4, radio: 8, fridge: 8, pump: 0.5,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSetup(loadSetup());
  }, []);

  const updateSetup = (field: keyof PowerSetup, value: number) => {
    setSetup((prev) => {
      const updated = { ...prev, [field]: value };
      saveSetup(updated);
      return updated;
    });
  };

  const handleSave = () => {
    saveSetup(setup);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Calculations
  const sunHours = PROVINCE_SUN_HOURS[selectedProvince] || 5;
  const dailyGeneration = setup.panelCount * setup.panelWattage * sunHours * 0.75; // Wh
  const batteryStorage = setup.batteryAh * setup.batteryVoltage * 0.8; // Wh (80% depth of discharge)
  const availableEnergy = dailyGeneration + batteryStorage;
  const inverterLoss = setup.inverterWattage * (1 - setup.inverterEfficiency / 100);

  const devices: Device[] = DEVICE_TEMPLATES.map((template) => {
    const hours = deviceHours[template.id] || 0;
    const dailyWh = template.watts * hours;
    const runtimeHours = template.watts > 0 ? availableEnergy / template.watts : 0;
    return {
      ...template,
      hoursPerDay: hours,
      dailyWh,
      runtimeHours: Math.round(runtimeHours * 10) / 10,
      canRun: template.watts <= setup.inverterWattage,
    };
  });

  const totalDeviceConsumption = devices.reduce((sum, d) => sum + d.dailyWh, 0);
  const surplus = availableEnergy - totalDeviceConsumption;
  const coveragePercent = availableEnergy > 0 ? Math.min((totalDeviceConsumption / availableEnergy) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-7 w-7 text-yellow-400" />
            Güç Hesaplayıcı
          </h1>
          <p className="text-nomad-slate text-sm">Offline Power Calculator -- "Kurdumla ne çalıştırabilirim?"</p>
        </div>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          {saved ? 'Kaydedildi' : 'Kaydet'}
        </Button>
      </div>

      {/* Reality Check Warning */}
      <Card className="border-amber-700 bg-amber-950/30">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Gerçek Kontrolü / Reality Check</p>
            <p className="text-amber-200 text-sm mt-1">
              Pazarlama iddiaları iyimserdir -- dereceli kapasitenin %60-75'ini bekleyin.
              Güneş panelleri etiket değerinden daha az enerji üretir.
            </p>
            <p className="text-amber-200/70 text-xs mt-1">
              (Marketing claims are optimistic -- expect 60-75% of rated capacity.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Setup Configuration */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BatteryCharging className="h-5 w-5 text-nomad-green" />
            Kurulum Yapılandırması / Setup Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Province Selection */}
          <div>
            <label className="text-sm font-medium mb-1 block flex items-center gap-2">
              <MapPin className="h-4 w-4 text-nomad-green" />
              Eyalet / Province
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
            >
              {Object.keys(PROVINCE_SUN_HOURS).map((p) => (
                <option key={p} value={p}>{p} ({PROVINCE_SUN_HOURS[p]} saat/gün)</option>
              ))}
            </select>
          </div>

          {/* Solar Panels */}
          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-400" />
              Güneş Panelleri / Solar Panels
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Panel Sayısı / Count</label>
                <input
                  type="number"
                  value={setup.panelCount}
                  onChange={(e) => updateSetup('panelCount', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Panel Wattajı / Wattage Each</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={setup.panelWattage}
                    onChange={(e) => updateSetup('panelWattage', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-20 h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  />
                  <span className="text-sm text-nomad-slate self-center">W</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-nomad-slate mt-2">
              Toplam: {setup.panelCount} x {setup.panelWattage}W = {setup.panelCount * setup.panelWattage}W
            </p>
          </div>

          {/* Battery Bank */}
          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Battery className="h-4 w-4 text-blue-400" />
              Akü Bankası / Battery Bank
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Kapasite / Capacity</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={setup.batteryAh}
                    onChange={(e) => updateSetup('batteryAh', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-20 h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  />
                  <span className="text-sm text-nomad-slate self-center">Ah</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Voltaj / Voltage</label>
                <select
                  value={setup.batteryVoltage}
                  onChange={(e) => updateSetup('batteryVoltage', parseInt(e.target.value))}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  <option value={12}>12V</option>
                  <option value={24}>24V</option>
                  <option value={48}>48V</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-nomad-slate mt-2">
              Depolama: {setup.batteryAh}Ah x {setup.batteryVoltage}V x 0.8 = {(setup.batteryAh * setup.batteryVoltage * 0.8).toFixed(0)}Wh
            </p>
          </div>

          {/* Inverter */}
          <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              İnverter
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Watt Değeri / Wattage</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={setup.inverterWattage}
                    onChange={(e) => updateSetup('inverterWattage', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-24 h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  />
                  <span className="text-sm text-nomad-slate self-center">W</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Verim / Efficiency</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={setup.inverterEfficiency}
                    onChange={(e) => updateSetup('inverterEfficiency', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="w-16 h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  />
                  <span className="text-sm text-nomad-slate self-center">%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Summary */}
      <Card className="border-nomad-green/50 bg-nomad-green/5">
        <CardHeader>
          <CardTitle>Günlük Enerji Özeti / Daily Energy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Sun className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-400">{Math.round(dailyGeneration)}</p>
              <p className="text-xs text-nomad-slate">Üretim Wh/gün</p>
              <p className="text-xs text-nomad-slate">Generation Wh/day</p>
            </div>
            <div className="text-center">
              <Battery className="h-6 w-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-400">{Math.round(batteryStorage)}</p>
              <p className="text-xs text-nomad-slate">Depolama Wh</p>
              <p className="text-xs text-nomad-slate">Storage Wh</p>
            </div>
            <div className="text-center">
              <Zap className="h-6 w-6 text-nomad-green mx-auto mb-1" />
              <p className="text-2xl font-bold text-nomad-green">{Math.round(availableEnergy)}</p>
              <p className="text-xs text-nomad-slate">Kullanılabilir</p>
              <p className="text-xs text-nomad-slate">Available Wh</p>
            </div>
            <div className="text-center">
              <AlertTriangle className={`h-6 w-6 mx-auto mb-1 ${surplus >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <p className={`text-2xl font-bold ${surplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {surplus >= 0 ? '+' : ''}{Math.round(surplus)}
              </p>
              <p className="text-xs text-nomad-slate">Kalan Wh</p>
              <p className="text-xs text-nomad-slate">Remaining Wh</p>
            </div>
          </div>

          {/* Usage Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-nomad-slate mb-1">
              <span>Kullanım / Usage: %{coveragePercent.toFixed(0)}</span>
              <span>{Math.round(totalDeviceConsumption)} / {Math.round(availableEnergy)} Wh</span>
            </div>
            <div className="w-full bg-nomad-surface rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  coveragePercent > 90 ? 'bg-red-500' : coveragePercent > 70 ? 'bg-amber-500' : 'bg-nomad-green'
                }`}
                style={{ width: `${Math.min(coveragePercent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Run Times */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle>Neler Çalıştırabilirsiniz? / What Can You Run?</CardTitle>
          <CardDescription>Gerçekçi süreler, pazarlama değil / Realistic runtimes, not marketing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {device.icon}
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-nomad-slate">{device.nameEn} -- {device.watts}W</p>
                    </div>
                  </div>
                  {!device.canRun && (
                    <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                      İnverter aşırı yüklenme
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <label className="text-xs text-nomad-slate">Günlük kullanım saati:</label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="0.5"
                    value={device.hoursPerDay}
                    onChange={(e) => setDeviceHours((prev) => ({ ...prev, [device.id]: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{device.hoursPerDay} saat</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-nomad-slate">Günlük tüketim / Daily: <span className="text-foreground font-medium">{device.dailyWh} Wh</span></p>
                  </div>
                  <div>
                    <p className="text-nomad-slate">Çalışma süresi / Runtime: <span className={`font-bold ${device.runtimeHours < 4 ? 'text-red-400' : device.runtimeHours < 12 ? 'text-amber-400' : 'text-nomad-green'}`}>{device.runtimeHours} saat</span></p>
                  </div>
                </div>

                {/* Reality check */}
                {device.runtimeHours < 2 && device.hoursPerDay > 0 && (
                  <p className="text-xs text-red-400 mt-2">
                    Uyarı: Bu cihaz mevcut güçle gerçekçi olarak {device.runtimeHours.toFixed(1)} saat çalışır. Günlük {device.hoursPerDay} saat kullanmak için daha fazla panel veya akü gerekir.
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Province Sun Hours Reference */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-nomad-green" />
            Eyalet Güneş Saatleri / Province Sun Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(PROVINCE_SUN_HOURS).sort((a, b) => b[1] - a[1]).map(([name, hours]) => (
              <div
                key={name}
                className={`flex items-center justify-between p-2 rounded ${
                  name === selectedProvince ? 'bg-nomad-green/20 border border-nomad-green/50' : 'bg-nomad-surface'
                }`}
              >
                <span>{name}</span>
                <span className="font-medium">{hours} saat</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-nomad-border">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Hesaplama Formülleri / Calculation Formulas</h4>
          </div>
          <div className="space-y-1 text-xs text-nomad-slate">
            <p><span className="text-foreground">Panel üretimi:</span> Panel Sayısı x Watt x Güneş Saati x 0.75 verim</p>
            <p><span className="text-foreground">Akü depolama:</span> Ah x Voltaj x 0.8 (boşaltma derinliği)</p>
            <p><span className="text-foreground">Kullanılabilir:</span> Üretim + Depolama - Kayıplar</p>
            <p><span className="text-foreground">Cihaz çalışma süresi:</span> Kullanılabilir Enerji / Cihaz Wattajı</p>
          </div>
          <p className="text-xs text-nomad-slate mt-2">
            Not: Gerçek değerler hava durumu, panel yaşı, sıcaklık ve gölgeye bağlı olarak %10-20 değişebilir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
