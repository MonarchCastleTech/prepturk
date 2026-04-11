'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  AlertTriangle,
  Compass,
  Flame,
  Hospital,
  Layers,
  MapPin,
  Navigation,
  Plus,
  Printer,
  School,
  Search,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Globe
} from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then((module) => module.MapContainer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((module) => module.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((module) => module.Popup), { ssr: false });

interface SavedPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  note?: string;
}

const emergencyTypes = [
  { id: 'hospital', label: 'Hastane', icon: Hospital, color: 'text-red-400', markerColor: '#ef4444' },
  { id: 'assembly', label: 'Toplanma Alanı', icon: MapPin, color: 'text-emerald-400', markerColor: '#10b981' },
  { id: 'school', label: 'Okul', icon: School, color: 'text-sky-400', markerColor: '#0ea5e9' },
  { id: 'fire', label: 'İtfaiye', icon: Flame, color: 'text-amber-400', markerColor: '#f59e0b' },
  { id: 'emergency', label: 'Acil Merkez', icon: AlertTriangle, color: 'text-rose-400', markerColor: '#f43f5e' },
];

const initialPlaces: SavedPlace[] = [
  { id: '1', name: 'Ankara Valiliği', lat: 39.9208, lng: 32.8541, type: 'emergency', note: 'İl acil durum merkezi' },
  { id: '2', name: 'Hacettepe Hastanesi', lat: 39.8739, lng: 32.8178, type: 'hospital', note: 'Travma kabul noktası' },
  { id: '3', name: 'Kızılay Toplanma Alanı', lat: 39.9199, lng: 32.8547, type: 'assembly', note: 'Güvenli buluşma noktası' },
];

export default function MapsPage() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(initialPlaces);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayers, setActiveLayers] = useState<string[]>(emergencyTypes.map((item) => item.id));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    type: 'emergency',
    note: '',
    lat: '39.0000',
    lng: '35.0000',
  });

  const visiblePlaces = savedPlaces.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayer = activeLayers.includes(place.type);
    return matchesSearch && matchesLayer;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="border-white/10 text-slate-400">
            <Plus className="h-4 w-4 mr-2" />
            Nokta Ekle
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-slate-400">
            <Printer className="h-4 w-4 mr-2" />
            Haritayı Yazdır
          </Button>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Navigation className="h-8 w-8 text-sky-400" />
          Saha Haritaları
        </h1>
        <p className="text-slate-400">Kritik noktalar ve koordinatlar. Tamamen çevrimdışı çalışır.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <aside className="space-y-4">
          <Card className="border-white/8 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Arama & Filtre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nokta ara..."
                className="bg-black/40 border-white/10 h-10 text-sm"
              />
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Katmanlar</p>
                {emergencyTypes.map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayers(prev => prev.includes(layer.id) ? prev.filter(i => i !== layer.id) : [...prev, layer.id])}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${activeLayers.includes(layer.id) ? 'border-emerald-500/30 bg-emerald-500/5 text-white' : 'border-white/5 bg-transparent text-slate-500'}`}
                  >
                    <div className="flex items-center gap-2">
                      <layer.icon className={`h-4 w-4 ${activeLayers.includes(layer.id) ? layer.color : 'text-slate-600'}`} />
                      <span className="text-xs font-medium">{layer.label}</span>
                    </div>
                    {activeLayers.includes(layer.id) && <Check className="h-3 w-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-200/70 leading-relaxed">
                  <strong>Yerel Sunucu:</strong> Harita verileri cihazınızdaki Tileserver-GL üzerinden sunulmaktadır. Dış ağa ihtiyaç duyulmaz.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Map View */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative rounded-3xl border border-white/10 bg-black/40 overflow-hidden h-[600px] shadow-2xl">
            <MapContainer
              center={[39.9208, 32.8541]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
            >
              {visiblePlaces.map((place) => {
                const type = emergencyTypes.find(t => t.id === place.type);
                const color = type?.markerColor || '#94a3b8';
                return (
                  <CircleMarker
                    key={place.id}
                    center={[place.lat, place.lng]}
                    radius={12}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <h4 className="font-bold text-slate-900">{place.name}</h4>
                        <p className="text-xs text-slate-600 mt-1">{place.note}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">{place.lat}, {place.lng}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
            
            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="bg-white/10 backdrop-blur-md border-white/10 h-10 w-10 text-white hover:bg-white/20">
                <Compass className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="bg-white/10 backdrop-blur-md border-white/10 h-10 w-10 text-white hover:bg-white/20">
                <Globe className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Places List Card */}
          <Card className="border-white/8 bg-white/[0.02]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Kayıtlı Noktalar ({visiblePlaces.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {visiblePlaces.map(place => {
                  const type = emergencyTypes.find(t => t.id === place.type);
                  return (
                    <div key={place.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 group hover:border-sky-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-black/40 ${type?.color}`}>
                          {type && <type.icon className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-none">{place.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
