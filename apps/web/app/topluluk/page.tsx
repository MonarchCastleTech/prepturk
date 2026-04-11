'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { generateId } from '../../lib/utils';
import {
  Users, Home, Phone, MapPin, Building2, Printer, Plus, Trash2, Save,
  Heart, AlertTriangle, FileText, Download, ClipboardList, CheckCircle
} from 'lucide-react';

// ========================
// TYPES
// ========================

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  schoolWorkAddress: string;
}

interface FamilyPlan {
  members: FamilyMember[];
  homeMeetingPoint: string;
  schoolMeetingPoint: string;
  neighborhoodMeetingPoint: string;
  hospitalMeetingPoint: string;
  emergencyContacts: { name: string; phone: string; relation: string }[];
  createdAt: string;
}

interface VulnerableNeighbor {
  id: string;
  name: string;
  apartment: string;
  conditions: string[];
  emergencyContact: string;
  emergencyPhone: string;
}

interface ResourceItem {
  type: string;
  quantity: string;
  location: string;
  condition: string;
}

interface Neighborhood {
  vulnerableNeighbors: VulnerableNeighbor[];
  resources: ResourceItem[];
  checkInList: { name: string; status: string; lastChecked: string }[];
}

interface BuildingApartment {
  id: string;
  apartmentNumber: string;
  residents: { name: string; phone: string; medicalConditions: string }[];
}

interface Building {
  apartments: BuildingApartment[];
  buildingAddress: string;
  buildingManager: string;
  managerPhone: string;
}

// ========================
// STORAGE KEYS & HELPERS
// ========================

const FAMILY_PLAN_KEY = 'prepturk:familyPlan';
const NEIGHBORHOOD_KEY = 'prepturk:neighborhood';
const BUILDING_KEY = 'prepturk:building';

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function saveJSON(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

const FAMILY_ROLES = ['anne', 'baba', 'cocuk', 'buyukanne', 'buyukbaba', 'diger'];
const CONDITION_OPTIONS = ['yasli', 'engelli', 'kronik hastalik', 'hamile', 'bebek', 'hareket kisitliligi'];
const RESOURCE_TYPES = ['jenerator', 'motorlu testere', 'il yardim cantasi', 'battaniye', 'su', 'gida', 'el feneri', 'radyo', 'ilac'];
const MEETING_POINT_OPTIONS = ['Ev on', 'Okul bahcesi', 'Mahalle toplama alani', 'En yakin hastane', 'Park', 'Cami avlusu'];

const EMPTY_FAMILY_PLAN: FamilyPlan = {
  members: [],
  homeMeetingPoint: '',
  schoolMeetingPoint: '',
  neighborhoodMeetingPoint: '',
  hospitalMeetingPoint: '',
  emergencyContacts: [],
  createdAt: '',
};

const EMPTY_NEIGHBORHOOD: Neighborhood = {
  vulnerableNeighbors: [],
  resources: [],
  checkInList: [],
};

const EMPTY_BUILDING: Building = {
  apartments: [],
  buildingAddress: '',
  buildingManager: '',
  managerPhone: '',
};

// ========================
// TAB 1: FAMILY EMERGENCY PLAN
// ========================

function FamilyEmergencyPlanTab() {
  const [plan, setPlan] = useState<FamilyPlan>(loadJSON(FAMILY_PLAN_KEY, EMPTY_FAMILY_PLAN));
  const [saved, setSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlan(loadJSON(FAMILY_PLAN_KEY, EMPTY_FAMILY_PLAN));
  }, []);

  const updatePlan = (updates: Partial<FamilyPlan>) => {
    setPlan((prev) => ({ ...prev, ...updates }));
  };

  const addMember = () => {
    updatePlan({
      members: [...plan.members, { id: generateId(), name: '', role: 'cocuk', phone: '', schoolWorkAddress: '' }],
    });
  };

  const updateMember = (id: string, field: string, value: string) => {
    updatePlan({
      members: plan.members.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };

  const removeMember = (id: string) => {
    updatePlan({ members: plan.members.filter((m) => m.id !== id) });
  };

  const addEmergencyContact = () => {
    updatePlan({
      emergencyContacts: [...plan.emergencyContacts, { name: '', phone: '', relation: '' }],
    });
  };

  const updateEmergencyContact = (idx: number, field: string, value: string) => {
    const contacts = [...plan.emergencyContacts];
    contacts[idx] = { ...contacts[idx], [field]: value };
    updatePlan({ emergencyContacts: contacts });
  };

  const removeEmergencyContact = (idx: number) => {
    updatePlan({ emergencyContacts: plan.emergencyContacts.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    const planToSave = { ...plan, createdAt: new Date().toISOString() };
    saveJSON(FAMILY_PLAN_KEY, planToSave);
    setPlan(planToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Home className="h-5 w-5 text-nomad-green" />
            Aile Acil Durum Plani
          </h2>
          <p className="text-nomad-slate text-sm">Family Emergency Plan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Yazdir
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            {saved ? 'Kaydedildi!' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Family Members */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Aile Uyeleri
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addMember}>
              <Plus className="h-4 w-4 mr-1" />
              Uye Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.members.length === 0 && (
            <p className="text-sm text-nomad-slate text-center py-4">
              Henuz aile uyesi eklenmemis. Asagidaki butona tiklayarak ekleyin.
            </p>
          )}
          {plan.members.map((member) => (
            <div key={member.id} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Input
                  placeholder="Ad Soyad"
                  value={member.name}
                  onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                  className="h-9 text-sm"
                />
                <select
                  value={member.role}
                  onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                  className="h-9 rounded-md border border-nomad-border bg-nomad-surface px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  {FAMILY_ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                <Input
                  placeholder="Telefon"
                  value={member.phone}
                  onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Okul/Is adresi"
                  value={member.schoolWorkAddress}
                  onChange={(e) => updateMember(member.id, 'schoolWorkAddress', e.target.value)}
                  className="h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(member.id)}
                  className="h-9 w-9 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Meeting Points */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400" />
            Toplanma Noktalari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Ev Toplanma Noktasi', field: 'homeMeetingPoint' as const, icon: Home },
            { label: 'Okul Toplanma Noktasi', field: 'schoolMeetingPoint' as const, icon: Users },
            { label: 'Mahalle Toplanma Noktasi', field: 'neighborhoodMeetingPoint' as const, icon: MapPin },
            { label: 'Hastane', field: 'hospitalMeetingPoint' as const, icon: Heart },
          ].map(({ label, field, icon: Icon }) => (
            <div key={field} className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Icon className="h-4 w-4 text-nomad-slate" />
                {label}
              </label>
              <select
                value={plan[field]}
                onChange={(e) => updatePlan({ [field]: e.target.value })}
                className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
              >
                <option value="">Seciniz...</option>
                {MEETING_POINT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-400" />
              Acil Durum Iletisim Bilgileri
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addEmergencyContact}>
              <Plus className="h-4 w-4 mr-1" />
              Iletisim Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.emergencyContacts.map((contact, idx) => (
            <div key={idx} className="flex gap-2 items-center p-3 bg-nomad-bg rounded-lg border border-nomad-border">
              <Input
                placeholder="Ad / Kurum"
                value={contact.name}
                onChange={(e) => updateEmergencyContact(idx, 'name', e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Input
                placeholder="Yakinlik"
                value={contact.relation}
                onChange={(e) => updateEmergencyContact(idx, 'relation', e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Input
                placeholder="Telefon"
                value={contact.phone}
                onChange={(e) => updateEmergencyContact(idx, 'phone', e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEmergencyContact(idx)}
                className="h-9 w-9 text-red-400 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Printable Plan Preview */}
      {plan.members.length > 0 && (
        <Card className="border-nomad-green/30 bg-nomad-green/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-nomad-green" />
              Plan Onizleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={printRef} className="bg-white text-black p-6 rounded-lg border-2 border-black">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-xl font-bold">AILE ACIL DURUM PLANI</h1>
                <p className="text-sm text-gray-600">PrepTurk - {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
              <h2 className="font-bold text-sm mb-2">AILE UYELERI</h2>
              <table className="w-full text-xs mb-4 border">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="text-left p-1">Ad</th>
                    <th className="text-left p-1">Rol</th>
                    <th className="text-left p-1">Telefon</th>
                    <th className="text-left p-1">Adres</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.members.map((m) => (
                    <tr key={m.id} className="border-b">
                      <td className="p-1">{m.name}</td>
                      <td className="p-1">{m.role}</td>
                      <td className="p-1">{m.phone}</td>
                      <td className="p-1">{m.schoolWorkAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h2 className="font-bold text-sm mb-2">TOPLANMA NOKTALARI</h2>
              <ul className="text-xs mb-4 list-disc pl-5">
                {plan.homeMeetingPoint && <li><strong>Ev:</strong> {plan.homeMeetingPoint}</li>}
                {plan.schoolMeetingPoint && <li><strong>Okul:</strong> {plan.schoolMeetingPoint}</li>}
                {plan.neighborhoodMeetingPoint && <li><strong>Mahalle:</strong> {plan.neighborhoodMeetingPoint}</li>}
                {plan.hospitalMeetingPoint && <li><strong>Hastane:</strong> {plan.hospitalMeetingPoint}</li>}
              </ul>
              {plan.emergencyContacts.length > 0 && (
                <>
                  <h2 className="font-bold text-sm mb-2">ACIL ILTISIM</h2>
                  <ul className="text-xs list-disc pl-5">
                    {plan.emergencyContacts.map((c, i) => (
                      <li key={i}>{c.name} ({c.relation}) - {c.phone}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========================
// TAB 2: NEIGHBORHOOD MUTUAL AID
// ========================

function NeighborhoodAidTab() {
  const [data, setData] = useState<Neighborhood>(loadJSON(NEIGHBORHOOD_KEY, EMPTY_NEIGHBORHOOD));
  const [saved, setSaved] = useState(false);
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    setData(loadJSON(NEIGHBORHOOD_KEY, EMPTY_NEIGHBORHOOD));
  }, []);

  const updateData = (updates: Partial<Neighborhood>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const addVulnerableNeighbor = () => {
    updateData({
      vulnerableNeighbors: [...data.vulnerableNeighbors, {
        id: generateId(), name: '', apartment: '', conditions: [], emergencyContact: '', emergencyPhone: '',
      }],
    });
  };

  const updateVulnerableNeighbor = (id: string, field: string, value: string | string[]) => {
    updateData({
      vulnerableNeighbors: data.vulnerableNeighbors.map((n) =>
        n.id === id ? { ...n, [field]: value } : n
      ),
    });
  };

  const toggleCondition = (neighborId: string, condition: string) => {
    const neighbor = data.vulnerableNeighbors.find((n) => n.id === neighborId);
    if (!neighbor) return;
    const conditions = neighbor.conditions.includes(condition)
      ? neighbor.conditions.filter((c) => c !== condition)
      : [...neighbor.conditions, condition];
    updateVulnerableNeighbor(neighborId, 'conditions', conditions);
  };

  const removeVulnerableNeighbor = (id: string) => {
    updateData({ vulnerableNeighbors: data.vulnerableNeighbors.filter((n) => n.id !== id) });
  };

  const addResource = () => {
    updateData({
      resources: [...data.resources, { type: '', quantity: '', location: '', condition: 'Iyi' }],
    });
  };

  const updateResource = (idx: number, field: string, value: string) => {
    const resources = [...data.resources];
    resources[idx] = { ...resources[idx], [field]: value };
    updateData({ resources });
  };

  const removeResource = (idx: number) => {
    updateData({ resources: data.resources.filter((_, i) => i !== idx) });
  };

  const generateCheckInList = () => {
    const names = data.vulnerableNeighbors.map((n) => n.name).filter(Boolean);
    const list = names.map((name) => ({ name, status: 'beklemede', lastChecked: '' }));
    updateData({ checkInList: list });
  };

  const updateCheckIn = (idx: number, status: string) => {
    const list = [...data.checkInList];
    list[idx] = { ...list[idx], status, lastChecked: new Date().toISOString() };
    updateData({ checkInList: list });
  };

  const handleSave = () => {
    saveJSON(NEIGHBORHOOD_KEY, data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            Mahalle Dayanisma
          </h2>
          <p className="text-nomad-slate text-sm">Neighborhood Mutual Aid</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Yazdir
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            {saved ? 'Kaydedildi!' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Vulnerable Neighbors */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              Hassas Komsu Kaydi
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addVulnerableNeighbor}>
              <Plus className="h-4 w-4 mr-1" />
              Komsu Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.vulnerableNeighbors.length === 0 && (
            <p className="text-sm text-nomad-slate text-center py-4">
              Henuce hassas komsu kaydi yok. Afet durumunda ozellikle yardima ihtiyac olan kisileri buraya kaydedin.
            </p>
          )}
          {data.vulnerableNeighbors.map((neighbor) => (
            <div key={neighbor.id} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Ad Soyad"
                  value={neighbor.name}
                  onChange={(e) => updateVulnerableNeighbor(neighbor.id, 'name', e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Daire / Kat"
                  value={neighbor.apartment}
                  onChange={(e) => updateVulnerableNeighbor(neighbor.id, 'apartment', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-nomad-slate">Durum / Condition</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(neighbor.id, cond)}
                      className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                        neighbor.conditions.includes(cond)
                          ? 'bg-red-900/50 text-red-300 border-red-700'
                          : 'bg-nomad-surface text-nomad-slate border-nomad-border hover:border-amber-500/50'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Acil iletisim kisisi"
                  value={neighbor.emergencyContact}
                  onChange={(e) => updateVulnerableNeighbor(neighbor.id, 'emergencyContact', e.target.value)}
                  className="h-9 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Acil iletisim telefon"
                    value={neighbor.emergencyPhone}
                    onChange={(e) => updateVulnerableNeighbor(neighbor.id, 'emergencyPhone', e.target.value)}
                    className="h-9 text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVulnerableNeighbor(neighbor.id)}
                    className="h-9 w-9 text-red-400 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resource Inventory */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-400" />
              Kaynak Envanteri
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addResource}>
              <Plus className="h-4 w-4 mr-1" />
              Kaynak Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.resources.length === 0 && (
            <p className="text-sm text-nomad-slate text-center py-4">
              Mahallede mevcut kaynaklari buraya kaydedin (jenerator, il yardim cantasi, vb.)
            </p>
          )}
          {data.resources.map((res, idx) => (
            <div key={idx} className="flex gap-2 items-start p-3 bg-nomad-bg rounded-lg border border-nomad-border">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={res.type}
                  onChange={(e) => updateResource(idx, 'type', e.target.value)}
                  className="h-9 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  <option value="">Kaynak turi...</option>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Input
                  placeholder="Adet"
                  value={res.quantity}
                  onChange={(e) => updateResource(idx, 'quantity', e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Konum"
                  value={res.location}
                  onChange={(e) => updateResource(idx, 'location', e.target.value)}
                  className="h-9 text-sm"
                />
                <div className="flex gap-2">
                  <select
                    value={res.condition}
                    onChange={(e) => updateResource(idx, 'condition', e.target.value)}
                    className="h-9 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green flex-1"
                  >
                    <option value="Iyi">Iyi</option>
                    <option value="Orta">Orta</option>
                    <option value="Kotu">Kotu</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResource(idx)}
                    className="h-9 w-9 text-red-400 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Check-in List */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Afet Durumu Kontrol Listesi
            </CardTitle>
            <Button variant="outline" size="sm" onClick={generateCheckInList}>
              <FileText className="h-4 w-4 mr-1" />
              Liste Olustur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.checkInList.length === 0 && (
            <p className="text-sm text-nomad-slate text-center py-4">
              Yukaridaki butona tiklayarak hassas komsular icin kontrol listesi olusturun.
            </p>
          )}
          {data.checkInList.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-nomad-bg rounded-lg border border-nomad-border mb-2">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-4 w-4 ${item.status === 'guvenli' ? 'text-green-400' : item.status === 'yardim gerekli' ? 'text-red-400' : 'text-amber-400'}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.lastChecked && (
                  <span className="text-xs text-nomad-slate">
                    {new Date(item.lastChecked).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <select
                  value={item.status}
                  onChange={(e) => updateCheckIn(idx, e.target.value)}
                  className="h-8 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-nomad-green"
                >
                  <option value="beklemede">Beklemede</option>
                  <option value="guvenli">Guvenli</option>
                  <option value="yardim gerekli">Yardim Gerekli</option>
                  <option value="erisilemedi">Erisilemedi</option>
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ========================
// TAB 3: BUILDING DIRECTORY
// ========================

function BuildingDirectoryTab() {
  const [building, setBuilding] = useState<Building>(loadJSON(BUILDING_KEY, EMPTY_BUILDING));
  const [saved, setSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBuilding(loadJSON(BUILDING_KEY, EMPTY_BUILDING));
  }, []);

  const updateBuilding = (updates: Partial<Building>) => {
    setBuilding((prev) => ({ ...prev, ...updates }));
  };

  const addApartment = () => {
    updateBuilding({
      apartments: [...building.apartments, {
        id: generateId(),
        apartmentNumber: '',
        residents: [{ name: '', phone: '', medicalConditions: '' }],
      }],
    });
  };

  const updateApartmentNumber = (id: string, aptNum: string) => {
    updateBuilding({
      apartments: building.apartments.map((a) => (a.id === id ? { ...a, apartmentNumber: aptNum } : a)),
    });
  };

  const removeApartment = (id: string) => {
    updateBuilding({ apartments: building.apartments.filter((a) => a.id !== id) });
  };

  const addResident = (aptId: string) => {
    updateBuilding({
      apartments: building.apartments.map((a) =>
        a.id === aptId
          ? { ...a, residents: [...a.residents, { name: '', phone: '', medicalConditions: '' }] }
          : a
      ),
    });
  };

  const updateResident = (aptId: string, residentIdx: number, field: string, value: string) => {
    updateBuilding({
      apartments: building.apartments.map((a) => {
        if (a.id !== aptId) return a;
        const residents = [...a.residents];
        residents[residentIdx] = { ...residents[residentIdx], [field]: value };
        return { ...a, residents };
      }),
    });
  };

  const removeResident = (aptId: string, residentIdx: number) => {
    updateBuilding({
      apartments: building.apartments.map((a) => {
        if (a.id !== aptId) return a;
        return { ...a, residents: a.residents.filter((_, i) => i !== residentIdx) };
      }),
    });
  };

  const handleSave = () => {
    saveJSON(BUILDING_KEY, building);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            Bina Listesi
          </h2>
          <p className="text-nomad-slate text-sm">Building Directory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Yazdir
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            {saved ? 'Kaydedildi!' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Building Info */}
      <Card className="border-nomad-border">
        <CardHeader>
          <CardTitle>Bina Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-nomad-slate">Bina Adresi</label>
            <Input
              placeholder="Bina adresi..."
              value={building.buildingAddress}
              onChange={(e) => updateBuilding({ buildingAddress: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-nomad-slate">Bina Yoneticisi</label>
              <Input
                placeholder="Yonetici adi"
                value={building.buildingManager}
                onChange={(e) => updateBuilding({ buildingManager: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-nomad-slate">Yonetici Telefonu</label>
              <Input
                placeholder="Telefon"
                value={building.managerPhone}
                onChange={(e) => updateBuilding({ managerPhone: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apartments */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-nomad-green" />
              Daireler
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addApartment}>
              <Plus className="h-4 w-4 mr-1" />
              Daire Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {building.apartments.length === 0 && (
            <p className="text-sm text-nomad-slate text-center py-4">
              Henuz daire eklenmemis. Her daireyi ayri ayri kaydedin.
            </p>
          )}
          {building.apartments.map((apt) => (
            <div key={apt.id} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Daire No (orn: 1A, 2B)"
                  value={apt.apartmentNumber}
                  onChange={(e) => updateApartmentNumber(apt.id, e.target.value)}
                  className="h-9 text-sm max-w-[200px]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeApartment(apt.id)}
                  className="h-9 w-9 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Residents */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-nomad-slate font-medium">Sakinler</span>
                  <Button variant="ghost" size="sm" onClick={() => addResident(apt.id)} className="h-7 text-xs text-nomad-green">
                    <Plus className="h-3 w-3 mr-1" />
                    Sakin Ekle
                  </Button>
                </div>
                {apt.residents.map((res, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-nomad-surface rounded border border-nomad-border">
                    <Input
                      placeholder="Ad Soyad"
                      value={res.name}
                      onChange={(e) => updateResident(apt.id, rIdx, 'name', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Telefon"
                      value={res.phone}
                      onChange={(e) => updateResident(apt.id, rIdx, 'phone', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Saglik durumu"
                        value={res.medicalConditions}
                        onChange={(e) => updateResident(apt.id, rIdx, 'medicalConditions', e.target.value)}
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeResident(apt.id, rIdx)}
                        className="h-8 w-8 text-red-400 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Printable Emergency Contact Sheet */}
      {building.apartments.length > 0 && (
        <Card className="border-nomad-green/30 bg-nomad-green/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-nomad-green" />
              Acil Durum Iletisim Formu (Bina Lobby Icın)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={printRef} className="bg-white text-black p-6 rounded-lg border-2 border-black">
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h1 className="text-xl font-bold">BINA ACIL DURUM ILTISIM FORMU</h1>
                {building.buildingAddress && <p className="text-sm text-gray-600">{building.buildingAddress}</p>}
                {building.buildingManager && (
                  <p className="text-sm text-gray-600">Yonetici: {building.buildingManager} - {building.managerPhone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">PrepTurk - {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
              <table className="w-full text-xs border">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="text-left p-1">Daire</th>
                    <th className="text-left p-1">Sakin</th>
                    <th className="text-left p-1">Telefon</th>
                    <th className="text-left p-1">Saglik Notu</th>
                  </tr>
                </thead>
                <tbody>
                  {building.apartments.map((apt) =>
                    apt.residents.map((res, rIdx) => (
                      <tr key={`${apt.id}-${rIdx}`} className="border-b">
                        <td className="p-1 font-bold">{apt.apartmentNumber}</td>
                        <td className="p-1">{res.name}</td>
                        <td className="p-1">{res.phone}</td>
                        <td className="p-1">{res.medicalConditions}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========================
// MAIN PAGE
// ========================

export default function ToplulukPage() {
  const [activeTab, setActiveTab] = useState<'family' | 'neighborhood' | 'building'>('family');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-amber-400" />
          Topluluk / Community
        </h1>
        <p className="text-nomad-slate text-sm">Aile, mahalle ve bina duzeyinde afet hazirlik planlamasi</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-nomad-surface rounded-lg p-1 border border-nomad-border">
        <button
          onClick={() => setActiveTab('family')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'family' ? 'bg-nomad-green text-white' : 'text-nomad-slate hover:text-foreground'
          }`}
        >
          <Home className="h-4 w-4" />
          Aile Acil Durum
        </button>
        <button
          onClick={() => setActiveTab('neighborhood')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'neighborhood' ? 'bg-nomad-green text-white' : 'text-nomad-slate hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Mahalle Dayanisma
        </button>
        <button
          onClick={() => setActiveTab('building')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'building' ? 'bg-nomad-green text-white' : 'text-nomad-slate hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Bina Listesi
        </button>
      </div>

      {activeTab === 'family' && <FamilyEmergencyPlanTab />}
      {activeTab === 'neighborhood' && <NeighborhoodAidTab />}
      {activeTab === 'building' && <BuildingDirectoryTab />}
    </div>
  );
}
