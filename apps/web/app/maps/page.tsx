'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  { id: 'hospital', label: 'Hastane', icon: Hospital, color: 'text-red-300', markerColor: '#f87171' },
  { id: 'assembly', label: 'Toplanma Alani', icon: MapPin, color: 'text-emerald-300', markerColor: '#34d399' },
  { id: 'school', label: 'Okul', icon: School, color: 'text-sky-300', markerColor: '#38bdf8' },
  { id: 'fire', label: 'Itfaiye', icon: Flame, color: 'text-amber-300', markerColor: '#f59e0b' },
  { id: 'emergency', label: 'Acil Merkez', icon: AlertTriangle, color: 'text-rose-300', markerColor: '#fb7185' },
];

const initialPlaces: SavedPlace[] = [
  { id: '1', name: 'Ankara Valiligi', lat: 39.9208, lng: 32.8541, type: 'emergency', note: 'Il acil durum merkezi' },
  { id: '2', name: 'Hacettepe Hastanesi', lat: 39.8739, lng: 32.8178, type: 'hospital', note: 'Travma kabul noktasi' },
  { id: '3', name: 'Kizilay Toplanma Alani', lat: 39.9199, lng: 32.8547, type: 'assembly', note: 'Guvenli bulusma noktasi' },
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

  const handleSavePlace = () => {
    const lat = Number(newPlace.lat);
    const lng = Number(newPlace.lng);

    if (!newPlace.name.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }

    setSavedPlaces((previous) => [
      ...previous,
      {
        id: Date.now().toString(),
        name: newPlace.name.trim(),
        type: newPlace.type,
        note: newPlace.note.trim() || undefined,
        lat,
        lng,
      },
    ]);

    setNewPlace({
      name: '',
      type: 'emergency',
      note: '',
      lat: '39.0000',
      lng: '35.0000',
    });
    setShowAddForm(false);
  };

  const handleDeletePlace = (id: string) => {
    setSavedPlaces((previous) => previous.filter((place) => place.id !== id));
  };

  return (
    <div className="space-y-6 text-white">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.96),rgba(10,13,17,0.92))] p-5 shadow-panel sm:p-6">
          <p className="shell-kicker">Saha haritasi</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Haritalar</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Kritik noktalar, katmanlar ve kayitli koordinatlar tek saha gorunumunde toplaniyor.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm((current) => !current)}>
                <Plus className="mr-1 h-4 w-4" />
                Nokta ekle
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-1 h-4 w-4" />
                Yazdir
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Kayitli noktalar</p>
            <p className="mt-2 text-3xl font-semibold text-white">{savedPlaces.length}</p>
            <p className="mt-2 text-sm text-slate-300">Saha uzerinde izlenen koordinatlar</p>
          </div>
          <div className="rounded-[1.5rem] border border-sky-500/20 bg-sky-500/10 px-4 py-4">
            <p className="shell-muted-label">Aktif katmanlar</p>
            <p className="mt-2 text-3xl font-semibold text-white">{activeLayers.length}</p>
            <p className="mt-2 text-sm text-sky-100/80">Gorunurluk filtreleri acik</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Harita modu</p>
            <p className="mt-2 text-xl font-semibold text-white">Bos zemin + isaretci</p>
            <p className="mt-2 text-sm text-slate-300">Dis karo sunuculari olmadan calisir</p>
          </div>
        </div>
      </section>

      {showAddForm && (
        <section className="rounded-[1.7rem] border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(20,30,27,0.95),rgba(12,18,16,0.95))] p-5 shadow-panel sm:p-6">
          <div className="flex items-center gap-2 text-base font-semibold text-white">
            <Plus className="h-5 w-5 text-emerald-300" />
            Yeni saha noktasi
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              value={newPlace.name}
              onChange={(event) => setNewPlace((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nokta adi"
            />
            <select
              value={newPlace.type}
              onChange={(event) => setNewPlace((current) => ({ ...current, type: event.target.value }))}
              className="h-11 rounded-xl border border-white/10 bg-black/15 px-3 text-sm text-white"
            >
              {emergencyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <Input
              value={newPlace.lat}
              onChange={(event) => setNewPlace((current) => ({ ...current, lat: event.target.value }))}
              placeholder="Enlem"
            />
            <Input
              value={newPlace.lng}
              onChange={(event) => setNewPlace((current) => ({ ...current, lng: event.target.value }))}
              placeholder="Boylam"
            />
            <Input
              value={newPlace.note}
              onChange={(event) => setNewPlace((current) => ({ ...current, note: event.target.value }))}
              placeholder="Kisa not"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSavePlace}>Noktayi kaydet</Button>
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-4 shadow-panel sm:p-5">
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Cevrimdisi katmanlar yalnizca kayitli noktalar ve koordinatlari gosterir.
          </div>
          <div className="h-[560px] overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(50,70,92,0.18),transparent_50%),linear-gradient(180deg,rgba(12,17,21,0.96),rgba(8,12,16,0.98))]">
            <MapContainer
              center={[39.0, 35.0]}
              zoom={6}
              scrollWheelZoom={false}
              zoomControl={false}
              attributionControl={false}
              style={{ height: '100%', width: '100%', background: 'transparent' }}
            >
              {visiblePlaces.map((place) => {
                const placeType = emergencyTypes.find((item) => item.id === place.type);
                const markerColor = placeType?.markerColor ?? '#e2e8f0';

                return (
                  <CircleMarker
                    key={place.id}
                    center={[place.lat, place.lng]}
                    radius={10}
                    pathOptions={{
                      color: markerColor,
                      fillColor: markerColor,
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div>
                        <strong>{place.name}</strong>
                        {place.note && <p className="mt-1 text-xs text-gray-600">{place.note}</p>}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(20,27,34,0.95),rgba(12,17,21,0.95))] shadow-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-white">
                <Search className="h-4 w-4 text-sky-300" />
                Nokta ara
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Kurum veya alan adi ara"
                className="h-10"
              />
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(20,27,34,0.95),rgba(12,17,21,0.95))] shadow-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-white">
                <Layers className="h-4 w-4 text-emerald-300" />
                Cevrimdisi katmanlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {emergencyTypes.map((layer) => (
                <label key={layer.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/15 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(layer.id)}
                      onChange={() => {
                        setActiveLayers((previous) =>
                          previous.includes(layer.id)
                            ? previous.filter((entry) => entry !== layer.id)
                            : [...previous, layer.id]
                        );
                      }}
                      className="rounded border-white/20 bg-black/15"
                    />
                    <layer.icon className={`h-4 w-4 ${layer.color}`} />
                    <span className="text-sm text-slate-200">{layer.label}</span>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(20,27,34,0.95),rgba(12,17,21,0.95))] shadow-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-white">
                <Navigation className="h-4 w-4 text-amber-300" />
                Kayitli kritik noktalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {visiblePlaces.map((place) => {
                  const type = emergencyTypes.find((item) => item.id === place.type);
                  return (
                    <div
                      key={place.id}
                      className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/15 p-3"
                    >
                      {type && <type.icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${type.color}`} />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{place.name}</p>
                        <p className="text-xs text-slate-400">
                          {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                        </p>
                        {place.note && <p className="mt-1 text-xs text-slate-300">{place.note}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(place.id)}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                        aria-label={`${place.name} kaydini sil`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                {visiblePlaces.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-slate-400">
                    Secili katmanlar altinda gorunur nokta yok.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
