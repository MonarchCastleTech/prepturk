'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Link from 'next/link';
import {
  getDistrictsForProvince,
  getNeighborhoodsForDistrict,
  getAssemblyPoints,
  haversineDistance,
  TYPE_LABELS,
  ASSEMBLY_POINTS,
  PROVINCES,
} from '../../lib/assembly-points';
import {
  MapPin, Navigation, Printer, Users, Info,
  Search, ChevronRight, AlertTriangle, ArrowLeft, X
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  park: 'text-emerald-400 bg-emerald-900/30 border-emerald-700',
  school: 'text-blue-400 bg-blue-900/30 border-blue-700',
  stadium: 'text-purple-400 bg-purple-900/30 border-purple-700',
  square: 'text-amber-400 bg-amber-900/30 border-amber-700',
  cemetery: 'text-slate-400 bg-slate-900/30 border-slate-700',
};

export default function ToplanmaPage() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [results, setResults] = useState<typeof ASSEMBLY_POINTS>([]);
  const [useLocation, setUseLocation] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});

  const districts = selectedProvince ? getDistrictsForProvince(selectedProvince) : [];
  const neighborhoods = (selectedProvince && selectedDistrict)
    ? getNeighborhoodsForDistrict(selectedProvince, selectedDistrict)
    : [];

  const handleSearch = () => {
    if (useLocation && userLat !== null && userLng !== null) {
      const sorted = ASSEMBLY_POINTS.map((p) => ({
        ...p,
        _dist: haversineDistance(userLat, userLng, p.lat, p.lng),
      }))
        .sort((a, b) => (a as any)._dist - (b as any)._dist)
        .slice(0, 15);

      setResults(sorted as any);
      const distMap: Record<string, number> = {};
      sorted.forEach((p) => {
        distMap[p.id] = (p as any)._dist;
      });
      setDistances(distMap);
      return;
    }

    let filtered = getAssemblyPoints(selectedProvince, selectedDistrict || undefined, selectedNeighborhood || undefined);
    setResults(filtered);
    setDistances({});
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Konum özelliği tarayıcınızda desteklenmiyor.');
      return;
    }
    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        handleSearch();
      },
      () => {
        alert('Konum alınamadı. Lütfen manuel seçim yapın.');
        setUseLocation(false);
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
          <Printer className="h-4 w-4 mr-2" />
          Listeyi Yazdır
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <MapPin className="h-8 w-8 text-red-500" />
          Acil Toplanma Alanları
        </h1>
        <p className="text-slate-400">Afet sonrası güvenli bekleme ve buluşma noktaları.</p>
      </header>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-tight">Çevrimdışı Kullanım Notu</h3>
              <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
                GPS tabanlı konumlandırma internet gerektirebilir. Çevrimdışıysanız lütfen İl ve İlçe seçerek manuel arama yapın.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search Sidebar */}
        <aside className="space-y-4">
          <Card className="border-white/8 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-base">Konum Belirle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleUseMyLocation} 
                variant={useLocation ? "default" : "outline"}
                className="w-full justify-start gap-3 h-12 rounded-xl border-white/10"
              >
                <Navigation className={`h-4 w-4 ${useLocation ? 'animate-pulse text-white' : 'text-emerald-400'}`} />
                <span className="text-xs font-medium">{useLocation ? 'Konum Alınıyor...' : 'Mevcut Konumumu Kullan'}</span>
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-slate-500 bg-transparent px-2">veya manuel seçin</div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">İl</label>
                  <select 
                    value={selectedProvince}
                    onChange={(e) => { setSelectedProvince(e.target.value); setUseLocation(false); }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">İl Seçin</option>
                    {PROVINCES.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">İlçe</label>
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-30"
                  >
                    <option value="">İlçe Seçin</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={!selectedProvince && !useLocation}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 rounded-xl"
              >
                <Search className="h-4 w-4 mr-2" />
                Noktaları Listele
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Results Main */}
        <div className="lg:col-span-2 space-y-4">
          {results.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center p-8">
              <MapPin className="h-10 w-10 text-slate-600 mb-4" />
              <h3 className="text-white font-medium">Arama Bekleniyor</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Lütfen sol taraftaki panelden konum seçin veya mevcut konumunuzu kullanın.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {results.length} Toplanma Noktası Bulundu
                </p>
              </div>
              <div className="grid gap-3">
                {results.map((point) => {
                  const dist = distances[point.id];
                  const colorClass = TYPE_COLORS[point.type] || TYPE_COLORS.square;
                  
                  return (
                    <Card key={point.id} className="group border-white/8 bg-white/[0.02] hover:border-emerald-500/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center">
                              <MapPin className="h-5 w-5 text-emerald-400" />
                              {dist !== undefined && (
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{dist.toFixed(1)}km</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-white truncate">{point.name}</h3>
                              <Badge variant="outline" className={`text-[9px] uppercase tracking-tighter border ${colorClass}`}>
                                {TYPE_LABELS[point.type]}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-3 leading-snug">{point.address}</p>
                            
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>Kapasite: {point.capacity}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5" />
                                <span>{point.district}</span>
                              </div>
                            </div>

                            {point.notes && (
                              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-200/70 leading-relaxed italic">
                                "{point.notes}"
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0 self-center">
                            <Link 
                              href={`/maps?lat=${point.lat}&lng=${point.lng}&name=${encodeURIComponent(point.name)}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                            >
                              <Navigation className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
