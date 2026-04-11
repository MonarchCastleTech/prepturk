'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Users, Radio, Zap, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function MahalleSavunmasiPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
          Rehberi Yazdır
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8 text-indigo-400" />
          Mahalle Savunması & Asayiş
        </h1>
        <p className="text-slate-400">Afet sonrası kolluk kuvvetlerine ulaşılamayan durumlarda mahalle güvenliği.</p>
      </header>

      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-tight">Kolektif Güvenlik</h3>
              <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                Afet sonrasında güvenlik en hızlı çöken sistemdir. Komşularınızla organize olmak, yağma ve tehlikelere karşı en güçlü caydırıcıdır. Bu rehber sivil dayanışmayı organize etmenizi sağlar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Nöbet Sistemi (Vardiya)</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Sokak/Apartman girişlerini kontrol altında tutun.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />2-3 kişilik gruplar halinde 4'er saatlik nöbetler planlayın (özellikle gece 02:00 - 06:00 arası).</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Düdük ve el feneri ile iletişim kurun.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Görsel Parola Sistemi</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Balkonlara asılacak renkli bezler ile sessiz iletişim kurun.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 font-bold">Yeşil/Beyaz:</span> Herkes iyi, güvendeyiz.</li>
              <li className="flex items-start gap-2"><span className="text-red-400 font-bold">Kırmızı:</span> Tıbbi acil durum veya güvenlik tehdidi var!</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.02] md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Faraday Kafesi (EMP Koruması)</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Olası bir elektromanyetik darbede (EMP) radyolarınızı ve telsizlerinizi korumak için:
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Cihazın pilini çıkarın.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Cihazı bir havluya veya kağıda sarın (yalıtım).</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Üzerini alüminyum folyo ile (boşluk kalmayacak şekilde) 2-3 kat sıkıca kaplayın.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />Kullanmanız gerektiğinde folyoyu açın.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
