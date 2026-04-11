'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun, Battery, BatteryCharging, BatteryFull, Clock, Thermometer,
  Cloud, CloudSun, CloudRain, Calendar, TrendingUp, MapPin, Info, Save, Trash2, ArrowLeft, Zap, Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

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

const BATTERY_TYPES = [
  { label: 'Telefon', capacity: '3000-5000 mAh' },
  { label: 'Powerbank', capacity: '10000-20000 mAh' },
  { label: 'Dizüstü Bilgisayar', capacity: '40000-60000 mAh' },
  { label: 'Akü / Güç İstasyonu', capacity: '100000+ mAh' },
];

const WEATHER_FACTORS: Record<string, { label: string; icon: React.ReactNode; factor: number }> = {
  gunesli: { label: 'Güneşli', icon: <Sun className="h-4 w-4 text-yellow-400" />, factor: 1.0 },
  bulutlu: { label: 'Parçalı Bulutlu', icon: <CloudSun className="h-4 w-4 text-slate-400" />, factor: 0.4 },
  kapali: { label: 'Kapalı / Yağmurlu', icon: <CloudRain className="h-4 w-4 text-blue-400" />, factor: 0.15 },
};

const PROVINCE_SUN_DATA = [
  { name: 'İstanbul', monthlySunHours: [3, 3.5, 4.5, 5.5, 7, 8, 8.5, 7.5, 6, 4.5, 3, 2.5] },
  { name: 'Ankara', monthlySunHours: [3, 4, 5, 6, 7.5, 8.5, 9, 8, 7, 5.5, 3.5, 2.5] },
  { name: 'İzmir', monthlySunHours: [3.5, 4, 5.5, 7, 8.5, 10, 11, 10, 8, 6, 4, 3] },
  { name: 'Antalya', monthlySunHours: [4, 5, 6, 7.5, 9.5, 10.5, 11, 10.5, 9, 7, 5, 3.5] },
];

const STORAGE_KEY = 'prepturk:solarSessions';
const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export default function GunesSarjPage() {
  const [sessions, setSessions] = useState<SolarSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [panelWattage, setPanelWattage] = useState('20');
  const [weather, setWeather] = useState<'gunesli' | 'bulutlu' | 'kapali'>('gunesli');
  const [selectedProvince, setSelectedProvince] = useState('İstanbul');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setSessions(JSON.parse(raw));
  }, []);

  const saveToStorage = (newSessions: SolarSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  };

  const totalMah = sessions.reduce((sum, s) => sum + s.estimatedMah, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
            <Printer className="h-4 w-4 mr-2" />
            Rapor Al
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <BatteryCharging className="h-4 w-4 mr-2" />
            {showForm ? 'Kapat' : 'Oturum Ekle'}
          </Button>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Sun className="h-8 w-8 text-yellow-400" />
          Güneş Enerjisi Takibi
        </h1>
        <p className="text-slate-400">Panel verimliliği ve cihaz şarj sürelerini optimize edin.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <BatteryFull className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Toplam Üretim</p>
                <p className="text-2xl font-bold text-white">{(totalMah / 1000).toFixed(1)} Ah</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Panel Gücü</p>
                <p className="text-2xl font-bold text-white">{panelWattage}W</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kayıtlı Oturum</p>
                <p className="text-2xl font-bold text-white">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Yeni Şarj Kaydı</CardTitle>
            <CardDescription>Gerçekleşen şarj verilerini girerek istatistik oluşturun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-white">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Panel Gücü (Watt)</label>
                <input 
                  type="number" value={panelWattage} onChange={(e) => setPanelWattage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Hava Durumu</label>
                <div className="flex gap-2">
                  {Object.entries(WEATHER_FACTORS).map(([key, val]) => (
                    <button 
                      key={key} onClick={() => setWeather(key as any)}
                      className={`flex-1 p-2 rounded-xl border text-[10px] transition-all ${weather === key ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'}`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 rounded-xl">
              Veriyi İşle ve Kaydet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Advice Section */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-emerald-400" />
            Verimlilik İpuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white">Açı Optimizasyonu</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paneli güneşe tam dik (90°) açıyla konumlandırın. Türkiye için kışın daha eğik, yazın daha dik açı verimlidir.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white">Isı Yönetimi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Güneş panelleri ısındıkça verimi düşer. Panelin arkasında hava akışı olmasını sağlayın.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl text-center">
        <AlertTriangle className="h-8 w-8 text-red-500/40 mx-auto mb-3" />
        <h3 className="text-red-200 font-bold mb-1 uppercase tracking-tight">Kritik Uyarı</h3>
        <p className="text-xs text-red-200/60 max-w-lg mx-auto">
          Batarya seviyesinin %20'nin altına düşmesine izin vermeyin. Acil durumlarda iletişimi kesmemek için %50 seviyesinde koruyucu kullanım moduna geçin.
        </p>
      </div>
    </div>
  );
}
