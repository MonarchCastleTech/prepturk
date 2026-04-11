'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Droplets, Package, Pill, Battery, Fuel, Banknote, Plus, Trash2, Minus, Printer, AlertTriangle, Check, X, Info, PackageSearch } from 'lucide-react';

// Types
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  threshold: number;
  notes?: string;
  addedAt: string;
}

interface InventoryData {
  items: InventoryItem[];
  householdSize: number;
  waterPerPersonPerDay: number;
}

const INVENTORY_KEY = 'prepturk:inventory';

const CATEGORIES = [
  { id: 'su', label: 'Su', labelEn: 'Water', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-950/30' },
  { id: 'yiyecek', label: 'Yiyecek', labelEn: 'Food', icon: Package, color: 'text-amber-400', bg: 'bg-amber-950/30' },
  { id: 'ilac', label: 'Ilac', labelEn: 'Medications', icon: Pill, color: 'text-red-400', bg: 'bg-red-950/30' },
  { id: 'enerji', label: 'Pil/Enerji', labelEn: 'Batteries/Energy', icon: Battery, color: 'text-yellow-400', bg: 'bg-yellow-950/30' },
  { id: 'yakit', label: 'Yakit', labelEn: 'Fuel', icon: Fuel, color: 'text-orange-400', bg: 'bg-orange-950/30' },
  { id: 'nakit', label: 'Nakit', labelEn: 'Cash', icon: Banknote, color: 'text-green-400', bg: 'bg-green-950/30' },
  { id: 'diger', label: 'Diger', labelEn: 'Other', icon: PackageSearch, color: 'text-purple-400', bg: 'bg-purple-950/30' },
];

const FOOD_SUBCATEGORIES = [
  { value: 'konserve', label: 'Konserve' },
  { value: 'kuru', label: 'Kuru Yemis' },
  { value: 'un', label: 'Un/Unlu Mamuller' },
  { value: 'seker', label: 'Seker/Tatli' },
  { value: 'icicek', label: 'Icecek' },
  { value: 'bebek', label: 'Bek Maması' },
  { value: 'diger', label: 'Diger' },
];

const BATTERY_TYPES = [
  { value: 'AA', label: 'AA' },
  { value: 'AAA', label: 'AAA' },
  { value: 'D', label: 'D' },
  { value: '9V', label: '9V' },
  { value: 'powerbank', label: 'Powerbank' },
  { value: 'diger', label: 'Diger' },
];

const FUEL_TYPES = [
  { value: 'tup', label: 'Tup Gaz' },
  { value: 'odun', label: 'Odun' },
  { value: 'komur', label: 'Komur' },
  { value: 'benzin', label: 'Benzin' },
  { value: 'diger', label: 'Diger' },
];

const URGENCY_LEVELS = [
  { value: 'kritik', label: 'KRITIK (hayati)', color: 'text-red-400' },
  { value: 'onemli', label: 'Onemli', color: 'text-amber-400' },
  { value: 'normal', label: 'Normal', color: 'text-green-400' },
];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadInventory(): InventoryData {
  if (typeof window === 'undefined') {
    return { items: [], householdSize: 4, waterPerPersonPerDay: 3 };
  }
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { items: [], householdSize: 4, waterPerPersonPerDay: 3 };
}

function saveInventory(data: InventoryData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(data));
}

function daysRemaining(item: InventoryItem, householdSize: number): number | null {
  if (item.category === 'su') {
    return Math.floor(item.quantity / (householdSize * 3));
  }
  return null;
}

function getDaysColor(days: number): string {
  if (days > 7) return 'bg-green-500';
  if (days >= 3) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getDaysTextColor(days: number): string {
  if (days > 7) return 'text-green-400';
  if (days >= 3) return 'text-yellow-400';
  return 'text-red-400';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function daysUntilExpiry(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateReadinessScore(items: InventoryItem[], householdSize: number): { score: number; label: string; color: string; details: string[] } {
  let score = 0;
  const details: string[] = [];
  const maxScore = 100;

  // Water: 30 points
  const waterItems = items.filter((i) => i.category === 'su');
  const totalWater = waterItems.reduce((sum, i) => sum + i.quantity, 0);
  const waterDays = Math.floor(totalWater / (householdSize * 3));
  if (waterDays >= 14) { score += 30; details.push(`Su: ${totalWater}L -- ${waterDays} gun (30/30)`); }
  else if (waterDays >= 7) { score += 20; details.push(`Su: ${totalWater}L -- ${waterDays} gun (20/30)`); }
  else if (waterDays >= 3) { score += 10; details.push(`Su: ${totalWater}L -- ${waterDays} gun (10/30)`); }
  else { details.push(`Su: ${totalWater}L -- ${waterDays} gun (0/30)`); }

  // Food: 25 points
  const foodItems = items.filter((i) => i.category === 'yiyecek');
  if (foodItems.length >= 10) { score += 25; details.push(`Yiyecek: ${foodItems.length} kalem (25/25)`); }
  else if (foodItems.length >= 5) { score += 15; details.push(`Yiyecek: ${foodItems.length} kalem (15/25)`); }
  else if (foodItems.length >= 2) { score += 5; details.push(`Yiyecek: ${foodItems.length} kalem (5/25)`); }
  else { details.push(`Yiyecek: ${foodItems.length} kalem (0/25)`); }

  // Meds: 20 points
  const medItems = items.filter((i) => i.category === 'ilac');
  if (medItems.length >= 3) { score += 20; details.push(`Ilac: ${medItems.length} kalem (20/20)`); }
  else if (medItems.length >= 1) { score += 10; details.push(`Ilac: ${medItems.length} kalem (10/20)`); }
  else { details.push(`Ilac: 0 kalem (0/20)`); }

  // Energy: 10 points
  const energyItems = items.filter((i) => i.category === 'enerji');
  if (energyItems.length >= 3) { score += 10; details.push(`Enerji: ${energyItems.length} kalem (10/10)`); }
  else if (energyItems.length >= 1) { score += 5; details.push(`Enerji: ${energyItems.length} kalem (5/10)`); }
  else { details.push(`Enerji: 0 kalem (0/10)`); }

  // Fuel: 10 points
  const fuelItems = items.filter((i) => i.category === 'yakit');
  if (fuelItems.length >= 1) { score += 10; details.push(`Yakit: ${fuelItems.length} kalem (10/10)`); }
  else { details.push(`Yakit: 0 kalem (0/10)`); }

  // Cash: 5 points
  const cashItems = items.filter((i) => i.category === 'nakit');
  if (cashItems.length >= 1) { score += 5; details.push(`Nakit: mevcut (5/5)`); }
  else { details.push(`Nakit: yok (0/5)`); }

  let label = 'Yetersiz';
  let color = 'text-red-400';
  if (score >= 80) { label = 'Mukemmel'; color = 'text-green-400'; }
  else if (score >= 60) { label = 'Iyi'; color = 'text-green-400'; }
  else if (score >= 40) { label = 'Orta'; color = 'text-yellow-400'; }
  else if (score >= 20) { label = 'Zayif'; color = 'text-amber-400'; }

  return { score, label, color, details };
}

export default function EnvanterPage() {
  const [data, setData] = useState<InventoryData>(loadInventory);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // New item form state
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    unit: 'adet',
    category: 'diger',
    expiryDate: '',
    threshold: 1,
    notes: '',
  });

  useEffect(() => {
    saveInventory(data);
  }, [data]);

  const addItem = useCallback(() => {
    if (!newItem.name || !newItem.category) return;
    const item: InventoryItem = {
      id: uid(),
      name: newItem.name,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || 'adet',
      category: newItem.category,
      expiryDate: newItem.expiryDate || undefined,
      threshold: newItem.threshold || 1,
      notes: newItem.notes || '',
      addedAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ name: '', quantity: 1, unit: 'adet', category: 'diger', expiryDate: '', threshold: 1, notes: '' });
    setShowAddForm(false);
  }, [newItem]);

  const removeItem = useCallback((id: string) => {
    setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i),
    }));
  }, []);

  const updateHouseholdSize = useCallback((size: number) => {
    setData((prev) => ({ ...prev, householdSize: Math.max(1, size) }));
  }, []);

  const lowStockItems = useMemo(() => {
    return data.items.filter((i) => i.quantity <= i.threshold);
  }, [data.items]);

  const readiness = useMemo(() => calculateReadinessScore(data.items, data.householdSize), [data.items, data.householdSize]);

  const waterDays = useMemo(() => {
    const waterItems = data.items.filter((i) => i.category === 'su');
    const totalWater = waterItems.reduce((sum, i) => sum + i.quantity, 0);
    return Math.floor(totalWater / (data.householdSize * 3));
  }, [data.items, data.householdSize]);

  const expiredItems = useMemo(() => {
    return data.items.filter((i) => isExpired(i.expiryDate));
  }, [data.items]);

  const getCategoryIcon = useCallback((catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.icon : PackageSearch;
  }, []);

  const getCategoryColor = useCallback((catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.color : 'text-nomad-slate';
  }, []);

  const generatePrintList = useCallback(() => {
    let html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>PrepTurk Envanter</title>
<style>body{font-family:Arial,sans-serif;max-width:700px;margin:20px auto;padding:20px;color:#000}h1{font-size:22px;border-bottom:3px solid #000;padding-bottom:8px}h2{font-size:16px;margin-top:20px;border-bottom:1px solid #ccc;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #333;padding:6px 8px;text-align:left;font-size:13px}th{background:#e0e0e0}.footer{margin-top:24px;font-size:11px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>`;

    html += `<h1>PrepTurk -- Acil Durum Envanteri</h1>`;
    html += `<p>Tarih: ${new Date().toLocaleString('tr-TR')} | Hane: ${data.householdSize} kisi</p>`;

    for (const cat of CATEGORIES) {
      const catItems = data.items.filter((i) => i.category === cat.id);
      if (catItems.length === 0) continue;

      html += `<h2>${cat.label} / ${cat.labelEn}</h2>`;
      html += `<table><tr><th>Isim</th><th>Miktar</th><th>Birim</th><th>SKT</th><th>Not</th></tr>`;
      catItems.forEach((item) => {
        const expired = isExpired(item.expiryDate) ? ' [SURESİ GECTİ!]' : '';
        html += `<tr><td>${item.name}${expired}</td><td>${item.quantity}</td><td>${item.unit}</td><td>${formatDate(item.expiryDate || '')}</td><td>${item.notes || '-'}</td></tr>`;
      });
      html += `</table>`;
    }

    html += `<div class="footer">Hazirlanmislik: ${readiness.score}/100 (${readiness.label}) -- ${waterDays} gun su yeterli -- PrepTurk ${new Date().toLocaleString('tr-TR')}</div>`;
    html += `</body></html>`;

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
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 250);
    }
  }, [data, readiness, waterDays]);

  const totalItems = data.items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ev Envanteri / Household Inventory</h1>
          <p className="text-nomad-slate text-sm mt-1">
            Acil durum malzemelerinizi takip edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generatePrintList}>
            <Printer className="h-4 w-4 mr-1" />
            Yazdir
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Yeni Kalem
          </Button>
        </div>
      </div>

      {/* Readiness Score */}
      <Card className="border-nomad-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-nomad-slate">Toplam Hazirlik Puanı / Total Readiness</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className={`text-4xl font-bold ${readiness.color}`}>{readiness.score}/100</span>
                <span className={`text-lg font-semibold ${readiness.color}`}>{readiness.label}</span>
              </div>
              <p className="text-sm text-nomad-slate mt-2">
                {data.householdSize} kisi icin {waterDays} gun su yeterli -- {totalItems} kalem kayitli
              </p>
            </div>
            <div className="text-right">
              <div className="w-32 h-4 bg-nomad-bg rounded-full overflow-hidden border border-nomad-border">
                <div
                  className={`h-full transition-all duration-300 ${
                    readiness.score >= 60 ? 'bg-green-500' : readiness.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-700/50 bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">Azalan Malzemeler / Low Stock</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lowStockItems.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    const color = getCategoryColor(item.category);
                    return (
                      <Badge key={item.id} className="text-xs bg-nomad-bg text-nomad-slate border border-amber-700/30">
                        <Icon className={`h-3 w-3 mr-1 ${color}`} />
                        {item.name}: {item.quantity} {item.unit}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {expiredItems.length > 0 && (
        <Card className="border-red-700/50 bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Suresi Gecen Urunler / Expired</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {expiredItems.map((item) => (
                    <Badge key={item.id} variant="destructive" className="text-xs">
                      {item.name} -- SKT: {formatDate(item.expiryDate || '')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Household settings */}
      <Card className="border-nomad-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-slate" />
            Hane Bilgileri / Household Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-nomad-slate">Hane Kisi Sayisi:</label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => updateHouseholdSize(data.householdSize - 1)} className="h-8 w-8 p-0">
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-bold">{data.householdSize}</span>
                <Button variant="outline" size="sm" onClick={() => updateHouseholdSize(data.householdSize + 1)} className="h-8 w-8 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-nomad-slate">
              Gunluk su ihtiyaci: <strong className="text-foreground">{data.householdSize * 3}L/gun</strong> (3L x kisi)
            </div>
            <div className="text-sm text-nomad-slate">
              Toplam su: <strong className="text-foreground">{data.items.filter(i => i.category === 'su').reduce((s, i) => s + i.quantity, 0)}L</strong>
              {' '}-- <strong className={waterDays > 7 ? 'text-green-400' : waterDays >= 3 ? 'text-yellow-400' : 'text-red-400'}>{waterDays} gun</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item Form */}
      {showAddForm && (
        <Card className="border-nomad-green/50 bg-nomad-green/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Yeni Kalem Ekle / Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Isim / Name *</label>
                <Input
                  type="text"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Urun adi"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Kategori / Category *</label>
                <select
                  value={newItem.category || 'diger'}
                  onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                  className="input-field w-full"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label} ({c.labelEn})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Miktar</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Birim</label>
                  <select
                    value={newItem.unit || 'adet'}
                    onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="adet">Adet</option>
                    <option value="litre">Litre</option>
                    <option value="kg">Kg</option>
                    <option value="gram">Gram</option>
                    <option value="kutu">Kutu</option>
                    <option value="koli">Koli</option>
                    <option value="tl">TL</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Son Kul. Tarihi / Expiry</label>
                <input
                  type="date"
                  value={newItem.expiryDate || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Azalma Esigi / Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.threshold || 1}
                  onChange={(e) => setNewItem((p) => ({ ...p, threshold: parseInt(e.target.value) || 1 }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Not / Notes</label>
                <Input
                  type="text"
                  value={newItem.notes || ''}
                  onChange={(e) => setNewItem((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Opsiyonel"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem} disabled={!newItem.name} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Ekle
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Iptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category sections */}
      {CATEGORIES.map((cat) => {
        const catItems = data.items.filter((i) => i.category === cat.id);
        if (catItems.length === 0) return null;
        const Icon = cat.icon;
        const isExpanded = editingCategory === cat.id;

        return (
          <Card key={cat.id} className={`border-nomad-border`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cat.label}</CardTitle>
                    <CardDescription>{cat.labelEn} -- {catItems.length} kalem</CardDescription>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(isExpanded ? null : cat.id)}
                  className="text-xs text-nomad-slate hover:text-foreground"
                >
                  {isExpanded ? 'Gizle' : 'Detay'}
                </button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent>
                <div className="space-y-3">
                  {catItems.map((item) => {
                    const days = daysRemaining(item, data.householdSize);
                    const expiryDays = daysUntilExpiry(item.expiryDate);
                    const expired = isExpired(item.expiryDate);
                    const isLow = item.quantity <= item.threshold;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          expired ? 'border-red-700/50 bg-red-950/20' :
                          isLow ? 'border-amber-700/30 bg-amber-950/10' :
                          'border-nomad-border bg-nomad-bg'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            {expired && <Badge variant="destructive" className="text-xs flex-shrink-0">SKT gecti</Badge>}
                            {isLow && !expired && <Badge className="text-xs bg-amber-900 text-amber-300 border-amber-700 flex-shrink-0">Azaldi!</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-nomad-slate">
                              {item.quantity} {item.unit}
                            </span>
                            {item.expiryDate && (
                              <span className={`text-xs ${expired ? 'text-red-400' : expiryDays !== null && expiryDays < 30 ? 'text-amber-400' : 'text-nomad-slate'}`}>
                                SKT: {formatDate(item.expiryDate)}
                                {expiryDays !== null && expiryDays >= 0 && ` (${expiryDays} gun)`}
                              </span>
                            )}
                            {item.notes && <span className="text-xs text-nomad-slate truncate max-w-[150px]">{item.notes}</span>}
                          </div>
                          {/* Days remaining bar for water */}
                          {days !== null && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-nomad-slate">Kalan sure:</span>
                                <span className={`font-bold ${getDaysTextColor(days)}`}>{days} gun</span>
                              </div>
                              <div className="w-full bg-nomad-surface rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${getDaysColor(days)}`}
                                  style={{ width: `${Math.min((days / 14) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Empty state */}
      {data.items.length === 0 && (
        <Card className="border-nomad-border">
          <CardContent className="p-12 text-center">
            <PackageSearch className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Envanter bos</p>
            <p className="text-sm text-nomad-slate mt-2">Acil durum malzemelerinizi eklemeye baslayın</p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-1" /> Ilk Kalemi Ekle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Readiness details */}
      {data.items.length > 0 && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="text-base">Hazirlik Detayi / Readiness Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readiness.details.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-nomad-slate">
                  {d.includes('0/0') || d.includes('0 kalem') || d.includes('0/30') || d.includes('0/25') || d.includes('0/20') || d.includes('0/10') || d.includes('0/5')
                    ? <X className="h-3 w-3 text-red-400 flex-shrink-0" />
                    : <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                  }
                  {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
