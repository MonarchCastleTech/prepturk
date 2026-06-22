'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Scale, Droplets, Wheat, AlertTriangle, Printer, BookOpen, Check, Info, TrendingUp, TrendingDown } from 'lucide-react';

interface BarterItem {
  name: string;
  nameEn: string;
  baselinePriceTL: number;
  waterEquivalent: number;
  unit: string;
  icon: string;
}

interface PriceLog {
  item: string;
  price: number;
  date: string;
  note: string;
}

interface CommunityPrice {
  item: string;
  price: number;
  unit: string;
  agreedBy: string;
  date: string;
}

const BARTER_ITEMS: BarterItem[] = [
  { name: 'Su (1L)', nameEn: 'Water (1L)', baselinePriceTL: 5, waterEquivalent: 1, unit: '1L', icon: 'droplet' },
  { name: 'Ekmek (1kg)', nameEn: 'Bread (1kg)', baselinePriceTL: 10, waterEquivalent: 0.5, unit: '1kg', icon: 'wheat' },
  { name: 'Pirinç (1kg)', nameEn: 'Rice (1kg)', baselinePriceTL: 30, waterEquivalent: 0.167, unit: '1kg', icon: 'rice' },
  { name: 'Yağ (1L)', nameEn: 'Cooking Oil (1L)', baselinePriceTL: 60, waterEquivalent: 0.083, unit: '1L', icon: 'oil' },
  { name: 'Şeker (1kg)', nameEn: 'Sugar (1kg)', baselinePriceTL: 25, waterEquivalent: 0.2, unit: '1kg', icon: 'sugar' },
  { name: 'Kibrit (1 kutu)', nameEn: 'Matches (1 box)', baselinePriceTL: 5, waterEquivalent: 1, unit: '1 kutu', icon: 'match' },
  { name: 'Pil (1 AA)', nameEn: 'Battery (1 AA)', baselinePriceTL: 15, waterEquivalent: 0.333, unit: '1 adet', icon: 'battery' },
  { name: 'Benzin (1L)', nameEn: 'Gasoline (1L)', baselinePriceTL: 40, waterEquivalent: 0.125, unit: '1L', icon: 'fuel' },
];

const STORAGE_KEY = 'prepturk:barterPrices';
const PRICE_LOG_KEY = 'prepturk:priceLog';
const COMMUNITY_KEY = 'prepturk:communityPrices';

function loadPriceLog(): PriceLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PRICE_LOG_KEY) || '[]');
  } catch { return []; }
}

function loadCommunityPrices(): CommunityPrice[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(COMMUNITY_KEY) || '[]');
  } catch { return []; }
}

function ItemIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'droplet': return <Droplets className={className} />;
    case 'wheat': return <Wheat className={className} />;
    case 'battery': return <span className={className}>🔋</span>;
    case 'match': return <span className={className}>🔥</span>;
    case 'oil': return <span className={className}>🫗</span>;
    case 'rice': return <span className={className}>🍚</span>;
    case 'sugar': return <span className={className}>&#x1F36C;</span>;
    case 'fuel': return <span className={className}>&#x26FD;</span>;
    default: return <Scale className={className} />;
  }
}

export default function TakasRehberiPage() {
  const [activeTab, setActiveTab] = useState<'reference' | 'calculator' | 'log' | 'community' | 'pledge'>('reference');
  const [calcFrom, setCalcFrom] = useState(0);
  const [calcAmount, setCalcAmount] = useState(1);
  const [priceLog, setPriceLog] = useState<PriceLog[]>(loadPriceLog);
  const [logItem, setLogItem] = useState(BARTER_ITEMS[0].name);
  const [logPrice, setLogPrice] = useState('');
  const [logNote, setLogNote] = useState('');
  const [communityPrices, setCommunityPrices] = useState<CommunityPrice[]>(loadCommunityPrices);
  const [commItem, setCommItem] = useState(BARTER_ITEMS[0].name);
  const [commPrice, setCommPrice] = useState('');
  const [commAgreedBy, setCommAgreedBy] = useState('');

  const tabs = [
    { id: 'reference' as const, label: 'Referans Fiyatlar' },
    { id: 'calculator' as const, label: 'Hesaplayıcı' },
    { id: 'log' as const, label: 'Fiyat Güncesi' },
    { id: 'community' as const, label: 'Toplum Fiyatları' },
    { id: 'pledge' as const, label: 'Adil Takas Sözü' },
  ];

  const addPriceLog = useCallback(() => {
    if (!logPrice) return;
    const entry: PriceLog = {
      item: logItem,
      price: parseFloat(logPrice),
      date: new Date().toISOString().split('T')[0],
      note: logNote,
    };
    const updated = [entry, ...priceLog];
    setPriceLog(updated);
    localStorage.setItem(PRICE_LOG_KEY, JSON.stringify(updated));
    setLogPrice('');
    setLogNote('');
  }, [logItem, logPrice, logNote, priceLog]);

  const addCommunityPrice = useCallback(() => {
    if (!commPrice || !commAgreedBy) return;
    const entry: CommunityPrice = {
      item: commItem,
      price: parseFloat(commPrice),
      unit: BARTER_ITEMS.find(i => i.name === commItem)?.unit || '',
      agreedBy: commAgreedBy,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [entry, ...communityPrices];
    setCommunityPrices(updated);
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updated));
    setCommPrice('');
    setCommAgreedBy('');
  }, [commItem, commPrice, commAgreedBy, communityPrices]);

  const calcFromItem = BARTER_ITEMS[calcFrom];
  const calcResults = BARTER_ITEMS
    .filter((_, i) => i !== calcFrom)
    .map(item => ({
      ...item,
      equivalent: (calcAmount * calcFromItem.waterEquivalent) / item.waterEquivalent,
    }));

  const printPledge = () => {
    const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
    <title>Adil Takas Sözü</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #000; text-align: center; }
      h1 { font-size: 28px; border-bottom: 4px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
      .pledge { font-size: 18px; line-height: 1.8; margin: 24px 0; padding: 20px; border: 3px solid #333; }
      .warning { background: #fff3cd; border: 2px solid #ffc107; padding: 16px; margin: 20px 0; font-size: 16px; font-weight: bold; }
      .footer { margin-top: 40px; font-size: 12px; color: #666; }
      .signature { margin-top: 40px; border-top: 2px solid #000; padding-top: 10px; display: inline-block; min-width: 200px; }
      @media print { body { margin: 20px; } }
    </style></head><body>
    <h1>ADİL TAKAS SÖZÜ</h1>
    <p style="font-size:14px;color:#666;">FAIR TRADE PLEDGE</p>
    <div class="pledge">
      <p>Kriz dönemlerinde adil takas toplumun gücüdür.</p>
      <p><em>Fair trade is the strength of community during crisis.</em></p>
      <hr style="margin:16px 0;">
      <p><strong>Söz veriyorum:</strong></p>
      <p style="text-align:left;margin-left:20px;">
        - İstismar yapmayacağım / I will not exploit others<br>
        - Adil fiyatlandırma kullanacağım / I will use fair pricing<br>
        - İstismara izin vermeyeceğim / I will not allow exploitation<br>
        - Topluluğumu koruyacağım / I will protect my community<br>
        - Paylaşımcı olacağım / I will be generous
      </p>
    </div>
    <div class="warning">
      UYARI: Kriz dönemlerinde adil takas önemlidir. İstismar yapmayın, istismara izin vermeyin.<br>
      <em>WARNING: Fair trade is important during crisis. Do not exploit, do not allow exploitation.</em>
    </div>
    <div class="signature">İmza / Signature: _________________</div>
    <div class="signature" style="margin-left:40px;">Tarih / Date: _________________</div>
    <div class="footer">PrepTürk -- Topluluk Hazırlık Programı</div>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Takas Rehberi / Barter &amp; Trade Guide</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Kriz dönemleri için adil takas fiyat referansları
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-nomad-green text-white'
                : 'bg-nomad-surface border border-nomad-border text-nomad-slate hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Critical Warning */}
      <Card className="border-amber-700 bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-bold text-amber-400">ADIL TAKAS UYARISI / FAIR TRADE WARNING</p>
              <p className="text-sm text-amber-300 mt-1">
                Kriz dönemlerinde adil takas önemlidir. İstismar yapmayın, istismara izin vermeyin.
              </p>
              <p className="text-xs text-nomad-slate mt-2">
                Fair trade is important during crisis. Do not exploit, do not allow exploitation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference Tab */}
      {activeTab === 'reference' && (
        <>
          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-nomad-green" />
                Kriz Öncesi Baz Fiyatlar (2024 TL)
              </CardTitle>
              <CardDescription>Pre-crisis baseline prices in Turkish Lira, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {BARTER_ITEMS.map((item, i) => (
                  <div key={i} className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                    <div className="flex items-center gap-2 mb-2">
                      <ItemIcon icon={item.icon} className="h-5 w-5 text-nomad-green" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <p className="text-xs text-nomad-slate">{item.nameEn}</p>
                    <p className="text-lg font-bold text-nomad-green mt-2">{item.baselinePriceTL} TL</p>
                    <p className="text-xs text-nomad-slate mt-1">Su eşdeğeri: {item.waterEquivalent <= 1 ? `1L su = ${(1/item.waterEquivalent).toFixed(1)} ${item.unit}` : `${item.waterEquivalent.toFixed(2)}L su = 1 ${item.unit}`}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-400" />
                Adil Takas Oranları / Fair Trade Ratios
              </CardTitle>
              <CardDescription>Su baz değeri = 1 / Water as baseline = 1</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-nomad-border">
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Ürün</th>
                      <th className="text-center py-2 px-2 text-nomad-slate font-medium">1L su karşılığı</th>
                      <th className="text-center py-2 px-2 text-nomad-slate font-medium">2L su karşılığı</th>
                      <th className="text-center py-2 px-2 text-nomad-slate font-medium">5L su karşılığı</th>
                      <th className="text-center py-2 px-2 text-nomad-slate font-medium">10L su karşılığı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BARTER_ITEMS.map((item, i) => (
                      <tr key={i} className="border-b border-nomad-border/50">
                        <td className="py-2 px-2 font-medium">{item.name}</td>
                        <td className="py-2 px-2 text-center text-nomad-slate">
                          {item.waterEquivalent <= 0.1
                            ? `${(item.waterEquivalent * 10).toFixed(1)} ${item.unit}`
                            : item.waterEquivalent === 1
                              ? `1 ${item.unit}`
                              : `${item.waterEquivalent.toFixed(2)} ${item.unit}`}
                        </td>
                        <td className="py-2 px-2 text-center text-nomad-slate">
                          {(item.waterEquivalent * 2).toFixed(2)} {item.unit}
                        </td>
                        <td className="py-2 px-2 text-center text-nomad-slate">
                          {(item.waterEquivalent * 5).toFixed(2)} {item.unit}
                        </td>
                        <td className="py-2 px-2 text-center text-nomad-slate">
                          {(item.waterEquivalent * 10).toFixed(2)} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-blue-950/20 border border-blue-800/30 rounded-lg">
                <p className="text-xs text-blue-300 flex items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  Bu oranlar 2024 Türkiye fiyatlarına göre hesaplanmıştır. Kriz döneminde fiyatlar değişebilir ancak oranlar kabaca korunur.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle>Takas Hesaplayıcı / Trade Calculator</CardTitle>
            <CardDescription>Bir ürün karşılığı ne kadar başka ürün alabileceğinizi hesaplayın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-nomad-slate mb-1 block">Elinizdeki ürün</label>
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(parseInt(e.target.value))}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                >
                  {BARTER_ITEMS.map((item, i) => (
                    <option key={i} value={i}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="text-sm text-nomad-slate mb-1 block">Miktar</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {calcResults.map((item, i) => (
                <div key={i} className="p-3 bg-nomad-bg rounded-lg border border-nomad-border">
                  <div className="flex items-center gap-2 mb-1">
                    <ItemIcon icon={item.icon} className="h-4 w-4 text-nomad-green" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <p className="text-xl font-bold text-nomad-green">{item.equivalent.toFixed(2)}</p>
                  <p className="text-xs text-nomad-slate">{item.nameEn}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Log Tab */}
      {activeTab === 'log' && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-400" />
              Fiyat Güncesi / Price Tracker
            </CardTitle>
            <CardDescription>Kriz öncesi ve sırasındaki fiyatları kaydedin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={logItem}
                onChange={(e) => setLogItem(e.target.value)}
                className="p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm flex-1"
              >
                {BARTER_ITEMS.map((item, i) => (
                  <option key={i} value={item.name}>{item.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Fiyat (TL)"
                value={logPrice}
                onChange={(e) => setLogPrice(e.target.value)}
                className="p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm w-32"
              />
              <input
                type="text"
                placeholder="Not (opsiyonel)"
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                className="p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm flex-1"
              />
              <Button size="sm" onClick={addPriceLog}>Kaydet</Button>
            </div>

            {priceLog.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-nomad-border">
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Tarih</th>
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Ürün</th>
                      <th className="text-right py-2 px-2 text-nomad-slate font-medium">Fiyat</th>
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceLog.map((entry, i) => (
                      <tr key={i} className="border-b border-nomad-border/50">
                        <td className="py-2 px-2 text-nomad-slate">{entry.date}</td>
                        <td className="py-2 px-2 font-medium">{entry.item}</td>
                        <td className="py-2 px-2 text-right text-nomad-green">{entry.price} TL</td>
                        <td className="py-2 px-2 text-nomad-slate text-xs">{entry.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {priceLog.length === 0 && (
              <p className="text-center text-nomad-slate py-8">Henüz fiyat kaydı yok. Yukarıdan ilk kaydınızı ekleyin.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Community Prices Tab */}
      {activeTab === 'community' && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Topluluk Adil Fiyat Panosu / Community Fair Price Board
            </CardTitle>
            <CardDescription>Mahalleniz için referans fiyatlar belirleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={commItem}
                onChange={(e) => setCommItem(e.target.value)}
                className="p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm flex-1"
              >
                {BARTER_ITEMS.map((item, i) => (
                  <option key={i} value={item.name}>{item.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Adil fiyat"
                value={commPrice}
                onChange={(e) => setCommPrice(e.target.value)}
                className="p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm w-32"
              />
              <input
                type="text"
                placeholder="Kim anlaştı"
                value={commAgreedBy}
                onChange={(e) => setCommAgreedBy(e.target.value)}
                className="p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm flex-1"
              />
              <Button size="sm" onClick={addCommunityPrice}>Ekle</Button>
            </div>

            {communityPrices.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-nomad-border">
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Ürün</th>
                      <th className="text-right py-2 px-2 text-nomad-slate font-medium">Fiyat</th>
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Birim</th>
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Anlaşan</th>
                      <th className="text-left py-2 px-2 text-nomad-slate font-medium">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communityPrices.map((entry, i) => (
                      <tr key={i} className="border-b border-nomad-border/50">
                        <td className="py-2 px-2 font-medium">{entry.item}</td>
                        <td className="py-2 px-2 text-right text-nomad-green">{entry.price}</td>
                        <td className="py-2 px-2 text-nomad-slate">{entry.unit}</td>
                        <td className="py-2 px-2 text-nomad-slate">{entry.agreedBy}</td>
                        <td className="py-2 px-2 text-nomad-slate text-xs">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pledge Tab */}
      {activeTab === 'pledge' && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-nomad-green" />
              Adil Takas Sözü / Fair Trade Pledge
            </CardTitle>
            <CardDescription>Topluluk panoları için yazdırılabilir poster</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-8 bg-nomad-bg rounded-lg border-2 border-nomad-green/50 text-center">
              <h2 className="text-3xl font-bold mb-2">ADİL TAKAS SÖZÜ</h2>
              <p className="text-sm text-nomad-slate mb-6">FAIR TRADE PLEDGE</p>
              <div className="max-w-md mx-auto space-y-4 text-left">
                <p className="text-lg"><strong>Söz veriyorum:</strong></p>
                <ul className="space-y-3">
                  {[
                    'İstismar yapmayacağım / I will not exploit others',
                    'Adil fiyatlandırma kullanacağım / I will use fair pricing',
                    'İstismara izin vermeyeceğim / I will not allow exploitation',
                    'Toplumumu koruyacağım / I will protect my community',
                    'Paylaşımcı olacağım / I will be generous',
                  ].map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-nomad-green flex-shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                <p className="font-bold text-amber-400">
                  Kriz dönemlerinde adil takas önemlidir.
                </p>
                <p className="text-sm text-amber-300 mt-1">
                  İstismar yapmayın, istismara izin vermeyin.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" onClick={printPledge}>
                <Printer className="h-4 w-4 mr-2" />
                Posteri Yazdır / Print Poster
              </Button>
            </div>

            <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Kullanım Talimatları / Usage Instructions
              </h4>
              <ul className="space-y-1 text-sm text-nomad-slate">
                <li>- Posteri yazdırın ve topluluk panosuna asın</li>
                <li>- Print the poster and hang it on the community board</li>
                <li>- Mahalle sakinleri ile adil fiyatlar konusunda anlaşın</li>
                <li>- Agree on fair prices with neighborhood residents</li>
                <li>- Herkesin bu sözü imzalamasını teşvik edin</li>
                <li>- Encourage everyone to sign this pledge</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
