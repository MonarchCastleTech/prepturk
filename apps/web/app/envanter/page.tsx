'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { 
  Droplets, Package, Pill, Battery, Fuel, Banknote, Plus, Trash2, 
  Minus, Printer, AlertTriangle, Check, X, Info, PackageSearch, ArrowLeft,
  ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react';

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
}

const INVENTORY_KEY = 'prepturk:inventory';

const CATEGORIES = [
  { id: 'su', label: 'Su Deposu', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-950/30' },
  { id: 'yiyecek', label: 'Gıda Stoğu', icon: Package, color: 'text-amber-400', bg: 'bg-amber-950/30' },
  { id: 'ilac', label: 'İlaç & Tıbbi', icon: Pill, color: 'text-red-400', bg: 'bg-red-950/30' },
  { id: 'enerji', label: 'Enerji & Pil', icon: Battery, color: 'text-yellow-400', bg: 'bg-yellow-950/30' },
  { id: 'yakit', label: 'Yakıt & Isınma', icon: Fuel, color: 'text-orange-400', bg: 'bg-orange-950/30' },
  { id: 'nakit', label: 'Nakit Rezervi', icon: Banknote, color: 'text-green-400', bg: 'bg-green-950/30' },
];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function EnvanterPage() {
  const [data, setData] = useState<InventoryData>({ items: [], householdSize: 4 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['su', 'yiyecek']));

  useEffect(() => {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (raw) setData(JSON.parse(raw));
  }, []);

  const save = (newData: InventoryData) => {
    setData(newData);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(newData));
  };

  const toggleCat = (id: string) => {
    const next = new Set(expandedCats);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedCats(next);
  };

  const waterTotal = data.items.filter(i => i.category === 'su').reduce((s, i) => s + i.quantity, 0);
  const waterDays = Math.floor(waterTotal / (data.householdSize * 3));

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
            Envanteri Yazdır
          </Button>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ekle
          </Button>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Package className="h-8 w-8 text-emerald-400" />
          Stok ve Envanter Takibi
        </h1>
        <p className="text-slate-400">Acil durum kaynaklarınızın miktar ve son kullanma tarihlerini yönetin.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Su Rezervi</p>
                  <p className="text-2xl font-bold text-white">{waterTotal} Litre</p>
                </div>
              </div>
              <Badge variant="outline" className={waterDays > 7 ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}>
                {waterDays} Günlük
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hane Halkı</p>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => save({...data, householdSize: Math.max(1, data.householdSize - 1)})} className="text-slate-500 hover:text-white">-</button>
                  <span className="text-2xl font-bold text-white">{data.householdSize} Kişi</span>
                  <button onClick={() => save({...data, householdSize: data.householdSize + 1})} className="text-slate-500 hover:text-white">+</button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="grid gap-4">
        {CATEGORIES.map((cat) => {
          const items = data.items.filter(i => i.category === cat.id);
          const isExpanded = expandedCats.has(cat.id);
          
          return (
            <Card key={cat.id} className="border-white/8 bg-white/[0.02] overflow-hidden">
              <button 
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${cat.bg} ${cat.color}`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{cat.label}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{items.length} Kalem Kayıtlı</p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
              </button>
              
              {isExpanded && (
                <CardContent className="pt-0 pb-6 px-6">
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-600 italic py-4">Bu kategoride henüz kayıt yok.</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.quantity} {item.unit}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="p-6 rounded-3xl bg-amber-600/10 border border-amber-500/20">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200/70 leading-relaxed">
            <strong>Kritik Hatırlatma:</strong> Envanterinizdeki son kullanma tarihlerini düzenli kontrol edin. 
            Su stoklarını her 6 ayda bir tazeleyin. Pilleri cihazların içinde bırakmayın (akma riski).
          </p>
        </div>
      </div>
    </div>
  );
}
