'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Share2, FileDown, Wifi, ShieldAlert, Smartphone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export default function DosyaPaylasimPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'hotspot'>('qr');
  const sampleData = JSON.stringify({ type: 'first-aid', data: '1. Hava yolu ac. 2. Kalp masaji 30:2.' });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Share2 className="h-8 w-8 text-sky-400" />
          Digital Dead Drop
        </h1>
        <p className="text-slate-400">İnternet veya GSM şebekesi yokken yakınınızdaki kişilerle bilgi paylaşımı.</p>
      </header>

      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'qr' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          QR Kod ile Aktarım
        </button>
        <button
          onClick={() => setActiveTab('hotspot')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hotspot' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Yerel Wi-Fi (Hotspot)
        </button>
      </div>

      {activeTab === 'qr' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl mb-4">
                <QRCodeSVG value={sampleData} size={200} />
              </div>
              <h3 className="text-white font-bold mb-2">Örnek Paket: Temel İlkyardım</h3>
              <p className="text-sm text-slate-400 text-center">Bu QR kodu tarayan herhangi bir kamera uygulaması (internetsiz) içindeki metni okuyabilir.</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-white mb-4">QR Paketleme Nedir?</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kısa metinleri, adresleri veya acil durum notlarını yüksek yoğunluklu QR kodlara sıkıştırırız. Karşıdaki kişinin bir ağa bağlanmasına gerek kalmadan sadece kamerasını açarak bilgiyi almasını sağlar.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <p className="text-xs text-emerald-400 font-bold mb-1">Avantajı:</p>
                <p className="text-xs text-slate-400">Bluetooth veya Wi-Fi eşleşmesi gerektirmez. Tamamen pasif ve güvenli bir bilgi aktarımıdır.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'hotspot' && (
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
                <Wifi className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Yerel Ağ Paylaşımı (Ad-Hoc)</h3>
                <p className="text-sm text-slate-400">Telefonunuzu bir sunucuya dönüştürün.</p>
              </div>
            </div>

            <ol className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">1</span>
                <span>Telefonunuzun ayarlarından <strong>Kişisel Erişim Noktası (Hotspot)</strong>'nu açın.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">2</span>
                <span>Bilgiyi alacak kişi sizin Wi-Fi ağınıza bağlansın (İnternetinizin kapalı olması sorun değildir).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">3</span>
                <span>Diğer kişi tarayıcısına <strong className="text-white bg-black/40 px-2 py-0.5 rounded">192.168.43.1:3000</strong> (veya cihazınızın size atadığı yerel IP) yazarak doğrudan bu PrepTürk sayfasına erişebilir ve belgeleri indirebilir.</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
