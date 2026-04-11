'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePowerStore } from '../../lib/stores';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Battery, BatteryCharging, BatteryWarning, BatteryLow, Zap, Printer, Shield, Phone, Heart, Users, MapPin, AlertTriangle, Moon, Sun, Info } from 'lucide-react';
import Link from 'next/link';

// Emergency numbers for the "Before Battery Dies" summary
const EMERGENCY_NUMBERS = [
  { name: 'Acil Cagri', nameEn: 'Emergency Call', number: '112', icon: Phone, color: 'text-red-400' },
  { name: 'Polis', nameEn: 'Police', number: '155', icon: Shield, color: 'text-blue-400' },
  { name: 'Itfaiye', nameEn: 'Fire Department', number: '110', icon: AlertTriangle, color: 'text-amber-400' },
  { name: 'Ambulans', nameEn: 'Ambulance', number: '112', icon: Heart, color: 'text-red-400' },
  { name: 'Jandarma', nameEn: 'Gendarmerie', number: '156', icon: Shield, color: 'text-blue-400' },
  { name: 'Sahil Guvenlik', nameEn: 'Coast Guard', number: '158', icon: Shield, color: 'text-blue-400' },
  { name: 'AFAD', nameEn: 'Disaster Authority', number: '112', icon: Users, color: 'text-nomad-green' },
];

const HEALTH_PROFILE_KEY = 'prepturk:healthProfile';
const FAMILY_PLAN_KEY = 'prepturk:familyPlan';
const ASSEMBLY_KEY = 'prepturk:assemblyPoint';

interface HealthProfile {
  name?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: { name: string; dosage: string }[];
  conditions?: string[];
  emergencyContact?: string;
}

interface FamilyPlan {
  members?: { name: string; age: number; phone?: string }[];
  meetingPoint?: string;
}

function getBatteryColor(level: number): string {
  if (level > 60) return 'bg-green-500';
  if (level > 30) return 'bg-yellow-500';
  if (level > 15) return 'bg-orange-500';
  return 'bg-red-500';
}

function getBatteryTextColor(level: number): string {
  if (level > 60) return 'text-green-400';
  if (level > 30) return 'text-yellow-400';
  if (level > 15) return 'text-orange-400';
  return 'text-red-400';
}

function getEstimatedHours(level: number, charging: boolean): string {
  if (charging) return 'Sarj oluyor -- sure yok';
  const drainRate = 12; // percent per hour typical usage
  const hours = (level / drainRate);
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h <= 0) return `${m} dakika kaldi`;
  return `~${h} saat ${m} dakika tahmini sure`;
}

function loadHealthProfile(): HealthProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HEALTH_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadFamilyPlan(): FamilyPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FAMILY_PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadAssemblyPoint(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ASSEMBLY_KEY);
    return raw ? JSON.parse(raw)?.name || raw : null;
  } catch { return null; }
}

function formatNow(): string {
  return new Date().toLocaleString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function DusukGucPage() {
  const { isLowPower, batteryLevel, isCharging, setLowPower, updateBattery } = usePowerStore();
  const [batterySupported, setBatterySupported] = useState(false);
  const [printData, setPrintData] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if ('getBattery' in navigator) {
      setBatterySupported(true);
      (navigator as any).getBattery().then((battery: any) => {
        updateBattery(Math.round(battery.level * 100), battery.charging);

        const handleChange = () => {
          updateBattery(Math.round(battery.level * 100), battery.charging);
        };
        battery.addEventListener('chargingchange', handleChange);
        battery.addEventListener('levelchange', handleChange);
        return () => {
          battery.removeEventListener('chargingchange', handleChange);
          battery.removeEventListener('levelchange', handleChange);
        };
      }).catch(() => setBatterySupported(false));
    }
  }, [updateBattery]);

  const handleToggleLowPower = useCallback(() => {
    setLowPower(!isLowPower);
    if (!isLowPower) {
      document.documentElement.classList.add('low-power-mode');
      document.body.classList.add('low-power-mode');
    } else {
      document.documentElement.classList.remove('low-power-mode');
      document.body.classList.remove('low-power-mode');
    }
  }, [isLowPower, setLowPower]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLowPower) {
      document.documentElement.classList.add('low-power-mode');
      document.body.classList.add('low-power-mode');
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('low-power-mode');
        document.body.classList.remove('low-power-mode');
      }
    };
  }, [isLowPower]);

  const generatePrintSummary = useCallback(() => {
    const health = loadHealthProfile();
    const family = loadFamilyPlan();
    const assembly = loadAssemblyPoint();
    const now = formatNow();

    let html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
    <title>PrepTurk - Kritik Bilgi Ozeti</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #000; }
      h1 { font-size: 24px; border-bottom: 3px solid #000; padding-bottom: 10px; }
      h2 { font-size: 18px; border-bottom: 1px solid #333; margin-top: 24px; padding-bottom: 4px; }
      .emergency { font-size: 28px; font-weight: bold; text-align: center; padding: 16px; background: #f0f0f0; border: 2px solid #000; margin: 16px 0; }
      .emergency span { margin: 0 12px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 14px; }
      th { background: #e0e0e0; }
      .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 12px 0; }
      .footer { margin-top: 32px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
      @media print { body { margin: 0; } }
    </style></head><body>`;

    html += `<h1>PrepTurk -- Kritik Bilgi Ozeti</h1>`;
    html += `<p>Olusturma tarihi: ${now}</p>`;

    html += `<div class="emergency"><strong>ACIL NUMARALAR / EMERGENCY NUMBERS</strong><br>`;
    html += `<span>112 Acil</span><span>155 Polis</span><span>110 Itfaiye</span><span>156 Jandarma</span><span>158 Sahil Guvenlik</span>`;
    html += `</div>`;

    if (health) {
      html += `<h2>Saglik Profili / Health Profile</h2>`;
      html += `<table>`;
      if (health.name) html += `<tr><th>Isim</th><td>${health.name}</td></tr>`;
      if (health.bloodType) html += `<tr><th>Kan Grubu</th><td>${health.bloodType}</td></tr>`;
      if (health.allergies && health.allergies.length > 0) html += `<tr><th>Alerjiler</th><td>${health.allergies.join(', ')}</td></tr>`;
      if (health.conditions && health.conditions.length > 0) html += `<tr><th>Rahatsizliklar</th><td>${health.conditions.join(', ')}</td></tr>`;
      if (health.medications && health.medications.length > 0) {
        html += `<tr><th>Ilaclar</th><td>${health.medications.map(m => `${m.name} (${m.dosage})`).join('; ')}</td></tr>`;
      }
      if (health.emergencyContact) html += `<tr><th>Acil Iletisim</th><td>${health.emergencyContact}</td></tr>`;
      html += `</table>`;
    }

    if (family) {
      html += `<h2>Aile Plani / Family Plan</h2>`;
      if (family.members && family.members.length > 0) {
        html += `<table><tr><th>Isim</th><th>Yas</th><th>Telefon</th></tr>`;
        family.members.forEach(m => {
          html += `<tr><td>${m.name}</td><td>${m.age}</td><td>${m.phone || '-'}</td></tr>`;
        });
        html += `</table>`;
      }
      if (family.meetingPoint) html += `<p><strong>Bulusma Noktasi:</strong> ${family.meetingPoint}</p>`;
    }

    if (assembly) {
      html += `<h2>Toplanma Bolgesi / Assembly Point</h2>`;
      html += `<p><strong>${assembly}</strong></p>`;
    }

    html += `<div class="warning"><strong>UYARI:</strong> Bu belge kritik bilgileri icerir. Guvenli bir yerde saklayin.</div>`;
    html += `<div class="footer">PrepTurk -- Turkiye Offline Komuta Merkezi -- ${now}</div>`;
    html += `</body></html>`;

    setPrintData(html);
  }, []);

  useEffect(() => {
    if (printData && printRef.current) {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printData);
        doc.close();
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 250);
      }
      setPrintData(null);
    }
  }, [printData]);

  const estimatedTime = getEstimatedHours(batteryLevel, isCharging);
  const batteryColor = getBatteryColor(batteryLevel);
  const batteryTextColor = getBatteryTextColor(batteryLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dusuk Guc Modu / Low Power Mode</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Pil durumunuzu izleyin ve kritik bilgileri pil bitmeden yazdirin
        </p>
      </div>

      {/* Battery Status Card */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCharging ? (
              <BatteryCharging className="h-6 w-6 text-nomad-green" />
            ) : batteryLevel > 60 ? (
              <Battery className="h-6 w-6 text-nomad-green" />
            ) : batteryLevel > 30 ? (
              <BatteryWarning className="h-6 w-6 text-yellow-400" />
            ) : (
              <BatteryLow className="h-6 w-6 text-red-400" />
            )}
            Pil Durumu / Battery Status
          </CardTitle>
          <CardDescription>
            {batterySupported ? 'Pil API algilandi -- otomatik takip' : 'Pil API desteklenmiyor -- manuel deger'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Battery Percentage */}
          <div className="text-center mb-6">
            <span className={`text-6xl font-bold ${batteryTextColor}`}>{batteryLevel}%</span>
            <p className="text-nomad-slate text-sm mt-2">{estimatedTime}</p>
            {isCharging && (
              <Badge className="mt-2 bg-green-900 text-green-300 border-green-700">
                <Zap className="h-3 w-3 mr-1" /> Sarj oluyor
              </Badge>
            )}
          </div>

          {/* Battery Bar */}
          <div className="w-full bg-nomad-bg rounded-full h-8 overflow-hidden border border-nomad-border">
            <div
              className={`h-full ${batteryColor} transition-all duration-500 rounded-full flex items-center justify-end pr-3`}
              style={{ width: `${Math.max(batteryLevel, 4)}%` }}
            >
              {batteryLevel > 15 && (
                <span className="text-white font-bold text-sm">{batteryLevel}%</span>
              )}
            </div>
          </div>

          {/* Manual battery adjustment (fallback) */}
          {!batterySupported && (
            <div className="mt-4 flex items-center gap-4">
              <label className="text-sm text-nomad-slate">Manuel Pil Seviyesi:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={batteryLevel}
                onChange={(e) => updateBattery(parseInt(e.target.value), isCharging)}
                className="flex-1 accent-green-500"
              />
              <span className={`text-sm font-bold ${batteryTextColor}`}>{batteryLevel}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Power Mode Toggle */}
      <Card className={`border-2 ${isLowPower ? 'border-nomad-green bg-nomad-green/5' : 'border-nomad-border'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLowPower ? (
                <Moon className="h-6 w-6 text-nomad-green" />
              ) : (
                <Sun className="h-6 w-6 text-nomad-slate" />
              )}
              <div>
                Dusuk Guc Modu
                <span className="block text-xs text-nomad-slate font-normal">Low Power Mode</span>
              </div>
            </div>
            <button
              onClick={handleToggleLowPower}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                isLowPower ? 'bg-nomad-green' : 'bg-nomad-border'
              }`}
              aria-label={isLowPower ? 'Dusuk guc modunu kapat' : 'Dusuk guc modunu ac'}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  isLowPower ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLowPower ? (
            <div className="space-y-3 text-sm text-nomad-slate">
              <p className="text-nomad-green font-medium">Dusuk Guc Modu AKTIF</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><span className="text-red-400">x</span> AI sohbet devre disi</li>
                <li className="flex items-center gap-2"><span className="text-red-400">x</span> Haritalar gizlendi</li>
                <li className="flex items-center gap-2"><span className="text-red-400">x</span> Gorseller karartildi</li>
                <li className="flex items-center gap-2"><span className="text-red-400">x</span> Animasyonlar durduruldu</li>
                <li className="flex items-center gap-2"><span className="text-nomad-green">+</span> Siyah-beyaz renk scheme</li>
                <li className="flex items-center gap-2"><span className="text-nomad-green">+</span> Sadece metin modu</li>
              </ul>
            </div>
          ) : (
            <p className="text-sm text-nomad-slate">
              Dusuk Guc Modu, pil omrunuzu uzatmak icin agir ozellikleri devre disi birakir ve metin tabli gorsele gecer.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Before Battery Dies Button */}
      <Card className="border-red-800/50 bg-red-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Pil Bitmeden Once / Before Battery Dies
          </CardTitle>
          <CardDescription>
            Kritik bilgileri tek bir yazdirilabilir sayfada olusturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-nomad-slate mb-4">
            Asagidaki buton, acil numaralarinizi, saglik bilgilerinizi, aile planinizi ve toplanma bolgenizi iceren
            yazdirilabilir bir ozet sayfa olusturur. Bu sayfayi pil bitmeden once yazdirin veya PDF olarak kaydedin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={generatePrintSummary} variant="destructive" size="lg">
              <Printer className="h-4 w-4 mr-2" />
              Kritik Bilgi Ozetini Yazdir
            </Button>
            <Button onClick={generatePrintSummary} variant="outline" size="lg">
              PDF Olarak Kaydet
            </Button>
          </div>

          {/* Preview of what will be printed */}
          <div className="mt-6 p-4 bg-nomad-bg rounded-lg border border-nomad-border">
            <p className="text-xs text-nomad-slate mb-2">Yazdirilacak icerik onizlemesi:</p>
            <ul className="text-sm space-y-1 text-foreground">
              <li>Acil numaralar (112, 155, 110, 156, 158)</li>
              {loadHealthProfile() && <li>Saglik profili ozeti</li>}
              {loadFamilyPlan() && <li>Aile plani ozeti</li>}
              {loadAssemblyPoint() && <li>Toplanma bolgesi bilgisi</li>}
              <li><span className="text-nomad-slate">(Varsa ek bilgiler dahil edilir)</span></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Numbers Quick Reference */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-400" />
            Acil Numaralar / Emergency Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMERGENCY_NUMBERS.map((num, i) => {
              const Icon = num.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-nomad-bg rounded-lg border border-nomad-border">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${num.color}`} />
                    <div>
                      <p className="text-sm font-medium">{num.name}</p>
                      <p className="text-xs text-nomad-slate">{num.nameEn}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-foreground">{num.number}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Info className="h-5 w-5" />
            Pil Tasarrufu Ipuclari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-nomad-slate">
            <li>Ekran parlakligini dusurun</li>
            <li>Bluetooth ve WiFi kapatin (kullanmiyorsaniz)</li>
            <li>Uygulamalari arka planda kapatma</li>
            <li>Ucak modunu dusunun (sadece acil numaralar icin)</li>
            <li>Gereksiz uygulamalari kapatın</li>
            <li>Kritik bilgileri bu sayfadan yazdirin</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/acil">
          <Button variant="outline" size="sm">Acil Numaralar</Button>
        </Link>
        <Link href="/saglik">
          <Button variant="outline" size="sm">Saglik Bilgilerim</Button>
        </Link>
        <Link href="/toplanma">
          <Button variant="outline" size="sm">Toplanma Bolgesi</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
