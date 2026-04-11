'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
  Search, ChevronRight, AlertTriangle
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  park: 'text-green-400 bg-green-900/30 border-green-700',
  school: 'text-blue-400 bg-blue-900/30 border-blue-700',
  stadium: 'text-purple-400 bg-purple-900/30 border-purple-700',
  square: 'text-amber-400 bg-amber-900/30 border-amber-700',
  cemetery: 'text-gray-400 bg-gray-900/30 border-gray-700',
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
  const printRef = useRef<HTMLDivElement>(null);

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
        .sort((a, b) => (a as typeof ASSEMBLY_POINTS[0] & { _dist: number })._dist - (b as typeof ASSEMBLY_POINTS[0] & { _dist: number })._dist)
        .slice(0, 10);

      setResults(sorted as typeof ASSEMBLY_POINTS);
      const distMap: Record<string, number> = {};
      sorted.forEach((p) => {
        distMap[p.id] = (p as typeof ASSEMBLY_POINTS[0] & { _dist: number })._dist;
      });
      setDistances(distMap);
      return;
    }

    let filtered = getAssemblyPoints(selectedProvince, selectedDistrict || undefined, selectedNeighborhood || undefined);

    if (selectedProvince && !selectedDistrict) {
      filtered = getAssemblyPoints(selectedProvince);
    }

    setResults(filtered);
    setDistances({});
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Konum ozelligi tarayicinizda desteklenmiyor.');
      return;
    }
    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedNeighborhood('');
      },
      () => {
        alert('Konum alinamadi. Lutfen manuel secim yapin.');
        setUseLocation(false);
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Offline warning for GPS */}
      <div className="rounded-lg border border-amber-900/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
        <strong>Cevrimdisi Uyarisi:</strong> GPS konumlandirma internet baglantisi gerektirir.
        Cevrimdisi durumda il/ilce/mahalle secimini manuel olarak yapin.
        <span className="block text-xs text-amber-400/70 mt-1">
          GPS requires internet. Use manual province/district selection when offline.
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-7 w-7 text-red-400" />
            Toplanma Alani Bulucu
          </h1>
          <p className="text-nomad-slate text-sm">Assembly Point Finder -- En yakin toplanma alanlarini bulun</p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Yazdir
        </Button>
      </div>

      {/* Search Controls */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-nomad-green" />
            Konum Secimi
          </CardTitle>
          <CardDescription>
            Il, ilce ve mahalle secerek veya konumunuzu kullanarak toplanma alanlarini bulun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Use my location button */}
          <Button
            variant={useLocation ? 'default' : 'outline'}
            size="sm"
            onClick={handleUseMyLocation}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            {useLocation ? 'Konumum kullaniliyor...' : 'Konumumu Kullan'}
          </Button>

          {!useLocation && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Province Selector */}
              <div className="space-y-1">
                <label className="text-xs text-nomad-slate">Il / Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict('');
                    setSelectedNeighborhood('');
                    setResults([]);
                  }}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  <option value="">Il secin...</option>
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* District Selector */}
              <div className="space-y-1">
                <label className="text-xs text-nomad-slate">Ilce / District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedNeighborhood('');
                    setResults([]);
                  }}
                  disabled={!selectedProvince}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Ilce secin...</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Neighborhood Selector */}
              <div className="space-y-1">
                <label className="text-xs text-nomad-slate">Mahalle / Neighborhood</label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => {
                    setSelectedNeighborhood(e.target.value);
                    setResults([]);
                  }}
                  disabled={!selectedDistrict}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Mahalle secin...</option>
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button onClick={handleSearch} className="gap-2" disabled={useLocation ? (userLat === null) : !selectedProvince}>
            <Search className="h-4 w-4" />
            Ara
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length === 0 && (
        <Card className="border-nomad-border">
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-nomad-slate mx-auto mb-3" />
            <p className="text-nomad-slate">
              Toplanma alani bulmak icin yukaridaki formu kullanin
            </p>
            <p className="text-xs text-nomad-slate mt-1">
              Ornek: Ankara &gt; Cankaya &gt; Kizilay veya Istanbul &gt; Kadikoy &gt; Moda
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-nomad-slate">
              <strong className="text-foreground">{results.length}</strong> toplanma alani bulundu
            </p>
          </div>

          {/* Printable list */}
          <div ref={printRef} className="hidden print:block bg-white text-black p-6 rounded-lg">
            <h1 className="text-xl font-bold mb-4">Toplanma Alanlari Listesi</h1>
            <table className="w-full text-xs border">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left p-1">#</th>
                  <th className="text-left p-1">Ad</th>
                  <th className="text-left p-1">Tur</th>
                  <th className="text-left p-1">Adres</th>
                  <th className="text-left p-1">Kapasite</th>
                </tr>
              </thead>
              <tbody>
                {results.map((point, i) => (
                  <tr key={point.id} className="border-b">
                    <td className="p-1">{i + 1}</td>
                    <td className="p-1 font-bold">{point.name}</td>
                    <td className="p-1">{TYPE_LABELS[point.type]}</td>
                    <td className="p-1">{point.address}</td>
                    <td className="p-1">{point.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 print:hidden">
            {results.map((point, i) => {
              const dist = distances[point.id];
              const colorClass = TYPE_COLORS[point.type] || TYPE_COLORS.square;

              return (
                <Card key={point.id} className="border-nomad-border hover:border-nomad-green/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Index / Distance */}
                      <div className="flex-shrink-0 text-center">
                        <div className="w-10 h-10 rounded-full bg-nomad-green/10 border border-nomad-green/30 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-nomad-green" />
                        </div>
                        {dist !== undefined && dist > 0 && (
                          <p className="text-xs text-nomad-slate mt-1">{dist.toFixed(1)} km</p>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{point.name}</h3>
                          <Badge variant="outline" className={`text-xs border ${colorClass}`}>
                            {TYPE_LABELS[point.type]}
                          </Badge>
                        </div>

                        <p className="text-sm text-nomad-slate mb-2">{point.address}</p>

                        <div className="flex flex-wrap gap-4 text-xs text-nomad-slate">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Kapasite: {point.capacity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            <span>{point.district}, {point.province}</span>
                          </div>
                        </div>

                        {point.notes && (
                          <div className="mt-2 p-2 bg-amber-950/20 border border-amber-700/30 rounded text-xs text-amber-300">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {point.notes}
                          </div>
                        )}

                        {/* Action buttons - OFFLINE ONLY, no external links */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              window.location.href = `/maps?lat=${point.lat}&lng=${point.lng}&name=${encodeURIComponent(point.name)}`;
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-nomad-green/10 text-nomad-green rounded-md text-xs font-medium hover:bg-nomad-green/20 transition-colors border border-nomad-green/30"
                          >
                            <Navigation className="h-3 w-3" />
                            Haritada gor
                          </button>
                        </div>
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
  );
}
