'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Printer, Plus, Trash2, IdCard, AlertTriangle, Info, Upload } from 'lucide-react';

interface ChildCard {
  id: string;
  photo: string;
  fullName: string;
  fullNameEn: string;
  dob: string;
  height: string;
  weight: string;
  hairColor: string;
  eyeColor: string;
  bloodType: string;
  medicalConditions: string;
  allergies: string;
  parentName1: string;
  parentPhone1: string;
  parentName2: string;
  parentPhone2: string;
  address: string;
  meetingPoint: string;
  createdAt: string;
}

const STORAGE_KEY = 'prepturk:childCards';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const HAIR_COLORS = ['Siyah/Black', 'Kahverengi/Brown', 'Sari/Blonde', 'Kizil/Red', 'Gri/Gray'];
const EYE_COLORS = ['Kahverengi/Brown', 'Mavi/Blue', 'Yesil/Green', 'Ela/Hazel', 'Siyah/Black', 'Gri/Gray'];

function loadCards(): ChildCard[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveCards(cards: ChildCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

const emptyCard = (): ChildCard => ({
  id: Date.now().toString(),
  photo: '',
  fullName: '',
  fullNameEn: '',
  dob: '',
  height: '',
  weight: '',
  hairColor: '',
  eyeColor: '',
  bloodType: '',
  medicalConditions: '',
  allergies: '',
  parentName1: '',
  parentPhone1: '',
  parentName2: '',
  parentPhone2: '',
  address: '',
  meetingPoint: '',
  createdAt: new Date().toISOString().split('T')[0],
});

function printChildCard(child: ChildCard) {
  const photoSection = child.photo
    ? `<img src="${child.photo}" style="width:80px;height:100px;object-fit:cover;border:1px solid #333;">`
    : `<div style="width:80px;height:100px;border:1px dashed #999;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">FOTO / PHOTO</div>`;

  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
  <title>Cocuk Kimlik Karti - ${child.fullName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .card { width: 86mm; height: 54mm; border: 2px solid #000; padding: 8px; box-sizing: border-box; position: relative; page-break-inside: avoid; }
    .header { font-size: 11px; font-weight: bold; text-align: center; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 5px; }
    .header-en { font-size: 8px; color: #666; }
    .content { display: flex; gap: 8px; }
    .photo { flex-shrink: 0; }
    .info { flex: 1; font-size: 8px; line-height: 1.4; }
    .info-row { margin-bottom: 2px; }
    .label { font-weight: bold; }
    .emergency { position: absolute; bottom: 5px; left: 8px; right: 8px; font-size: 7px; border-top: 1px solid #ccc; padding-top: 3px; }
    .cut-line { border-top: 2px dashed #999; margin: 15px 0; }
    @media print { body { margin: 10mm; } .cut-line { display: block; } }
    .no-print { display: none; }
  </style></head><body>
  <div class="card">
    <div class="header">
      COPUK KIMLIK KARTI / CHILD ID CARD
      <div class="header-en">If found, please take to: ${child.meetingPoint || '_______________'}</div>
    </div>
    <div class="content">
      <div class="photo">${photoSection}</div>
      <div class="info">
        <div class="info-row"><span class="label">Ad Soyad:</span> ${child.fullName}</div>
        <div class="info-row"><span class="label">Name:</span> ${child.fullNameEn || child.fullName}</div>
        <div class="info-row"><span class="label">Dogum Tarihi:</span> ${child.dob || '___'}</div>
        <div class="info-row"><span class="label">Boy/Kilo:</span> ${child.height || '___'} / ${child.weight || '___'}</div>
        <div class="info-row"><span class="label">Sac/Go:z:</span> ${child.hairColor || '___'} / ${child.eyeColor || '___'}</div>
        <div class="info-row"><span class="label">Kan Grubu:</span> ${child.bloodType || '___'}</div>
        <div class="info-row"><span class="label">Alerji:</span> ${child.allergies || 'Yok/None'}</div>
        <div class="info-row"><span class="label">Saglik:</span> ${child.medicalConditions || 'Yok/None'}</div>
      </div>
    </div>
    <div class="emergency">
      <strong>Anne-Baba / Parents:</strong><br>
      ${child.parentName1 || '_______________'}: ${child.parentPhone1 || '_______________'}<br>
      ${child.parentName2 || '_______________'}: ${child.parentPhone2 || '_______________'}<br>
      <strong>Adres:</strong> ${child.address || '_______________'}
    </div>
  </div>
  <div class="cut-line"></div>
  <div class="card">
    <div class="header">
      COPUK KIMLIK KARTI (Yedek) / CHILD ID CARD (Backup)
      <div class="header-en">If found, please take to: ${child.meetingPoint || '_______________'}</div>
    </div>
    <div class="content">
      <div class="photo">${photoSection}</div>
      <div class="info">
        <div class="info-row"><span class="label">Ad Soyad:</span> ${child.fullName}</div>
        <div class="info-row"><span class="label">Name:</span> ${child.fullNameEn || child.fullName}</div>
        <div class="info-row"><span class="label">Dogum Tarihi:</span> ${child.dob || '___'}</div>
        <div class="info-row"><span class="label">Boy/Kilo:</span> ${child.height || '___'} / ${child.weight || '___'}</div>
        <div class="info-row"><span class="label">Sac/Go:z:</span> ${child.hairColor || '___'} / ${child.eyeColor || '___'}</div>
        <div class="info-row"><span class="label">Kan Grubu:</span> ${child.bloodType || '___'}</div>
        <div class="info-row"><span class="label">Alerji:</span> ${child.allergies || 'Yok/None'}</div>
      </div>
    </div>
    <div class="emergency">
      <strong>Anne-Baba / Parents:</strong><br>
      ${child.parentName1 || '_______________'}: ${child.parentPhone1 || '_______________'}<br>
      ${child.parentName2 || '_______________'}: ${child.parentPhone2 || '_______________'}
    </div>
  </div>
  <div class="cut-line"></div>
  </body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

export default function CocukKimlikPage() {
  const [cards, setCards] = useState<ChildCard[]>(loadCards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChildCard>(emptyCard());

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  const startNew = useCallback(() => {
    setEditingId(null);
    setForm(emptyCard());
  }, []);

  const startEdit = useCallback((card: ChildCard) => {
    setEditingId(card.id);
    setForm({ ...card });
  }, []);

  const save = useCallback(() => {
    if (!form.fullName) return;
    setCards(prev => {
      const exists = prev.find(c => c.id === form.id);
      if (exists) return prev.map(c => c.id === form.id ? form : c);
      return [...prev, form];
    });
    setEditingId(null);
    setForm(emptyCard());
  }, [form]);

  const remove = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (editingId === id) { setEditingId(null); setForm(emptyCard()); }
  }, [editingId]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, photo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const update = useCallback((field: keyof ChildCard, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cocuk Kimlik Karti / Child ID Card</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Acil durumlar icin yazdirilabilir cocuk kimlik kartlari
        </p>
      </div>

      <Card className="border-blue-800/50 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                Kart kredi karti boyutundadir (86mm x 54mm). Laminasyon yapin veya bantla kaplayin.
              </p>
              <p className="text-xs text-nomad-slate mt-1">
                Card is credit card size (86mm x 54mm). Laminate or cover with tape for durability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-nomad-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-nomad-green" />
              {editingId ? 'Karti Duzenle / Edit Card' : 'Yeni Kart Olustur / Create New Card'}
            </CardTitle>
            {!editingId && (
              <Button size="sm" onClick={startNew}>
                <Plus className="h-4 w-4 mr-1" />
                Yeni / New
              </Button>
            )}
          </div>
        </CardHeader>
        {editingId !== null && (
          <CardContent className="space-y-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 bg-nomad-bg border border-nomad-border rounded flex items-center justify-center overflow-hidden">
                {form.photo ? (
                  <img src={form.photo} alt="Child" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-nomad-slate">Foto</span>
                )}
              </div>
              <div>
                <label className="text-sm text-nomad-slate mb-1 block">Cocuk Fotografi / Photo</label>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-nomad-surface border border-nomad-border rounded-md text-sm cursor-pointer hover:bg-nomad-border">
                  <Upload className="h-4 w-4" />
                  Yukle / Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Ad Soyad (Turkce) *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Full Name (English)</label>
                <input
                  value={form.fullNameEn}
                  onChange={(e) => update('fullNameEn', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Dogum Tarihi / Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Kan Grubu / Blood Type</label>
                <select
                  value={form.bloodType}
                  onChange={(e) => update('bloodType', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                >
                  <option value="">Seciniz</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Boy / Height</label>
                <input
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                  placeholder="120 cm"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Kilo / Weight</label>
                <input
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                  placeholder="25 kg"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Sac Rengi / Hair Color</label>
                <select
                  value={form.hairColor}
                  onChange={(e) => update('hairColor', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                >
                  <option value="">Seciniz</option>
                  {HAIR_COLORS.map(hc => <option key={hc} value={hc}>{hc}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Goz Rengi / Eye Color</label>
                <select
                  value={form.eyeColor}
                  onChange={(e) => update('eyeColor', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                >
                  <option value="">Seciniz</option>
                  {EYE_COLORS.map(ec => <option key={ec} value={ec}>{ec}</option>)}
                </select>
              </div>
            </div>

            {/* Medical */}
            <div>
              <label className="text-xs text-nomad-slate mb-1 block">Saglik Sorunlari / Medical Conditions</label>
              <textarea
                value={form.medicalConditions}
                onChange={(e) => update('medicalConditions', e.target.value)}
                className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                rows={2}
                placeholder="Astim, diyabet, epilepsi..."
              />
            </div>
            <div>
              <label className="text-xs text-nomad-slate mb-1 block">Alerjiler / Allergies</label>
              <textarea
                value={form.allergies}
                onChange={(e) => update('allergies', e.target.value)}
                className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                rows={2}
                placeholder="Fistik, penisilin..."
              />
            </div>

            {/* Parents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Anne-Baba 1 / Parent 1</label>
                <input
                  value={form.parentName1}
                  onChange={(e) => update('parentName1', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm mb-2"
                  placeholder="Ad Soyad"
                />
                <input
                  value={form.parentPhone1}
                  onChange={(e) => update('parentPhone1', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                  placeholder="Telefon / Phone"
                />
              </div>
              <div>
                <label className="text-xs text-nomad-slate mb-1 block">Anne-Baba 2 / Parent 2</label>
                <input
                  value={form.parentName2}
                  onChange={(e) => update('parentName2', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm mb-2"
                  placeholder="Ad Soyad"
                />
                <input
                  value={form.parentPhone2}
                  onChange={(e) => update('parentPhone2', e.target.value)}
                  className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                  placeholder="Telefon / Phone"
                />
              </div>
            </div>

            {/* Address & Meeting Point */}
            <div>
              <label className="text-xs text-nomad-slate mb-1 block">Adres / Address</label>
              <textarea
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                rows={2}
                placeholder="Mahalle, sokak, bina no..."
              />
            </div>
            <div>
              <label className="text-xs text-nomad-slate mb-1 block">Bulusma Noktasi / Meeting Point</label>
              <input
                value={form.meetingPoint}
                onChange={(e) => update('meetingPoint', e.target.value)}
                className="w-full p-2 bg-nomad-bg border border-nomad-border rounded-md text-sm"
                placeholder="Ornek: Park girisi, okul on..."
              />
              <p className="text-xs text-nomad-slate mt-1">Bulunursa buraya goturulsun / If found, please take to this location</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingId(null); setForm(emptyCard()); }}>Iptal</Button>
              <Button size="sm" onClick={save}>Kaydet / Save</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Saved Cards */}
      {cards.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Kayitli Kartlar / Saved Cards ({cards.length})</h2>
          <div className="space-y-3">
            {cards.map(card => (
              <Card key={card.id} className="border-nomad-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-14 bg-nomad-bg border border-nomad-border rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {card.photo ? (
                        <img src={card.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <IdCard className="h-6 w-6 text-nomad-slate" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{card.fullName}</p>
                      <p className="text-xs text-nomad-slate">
                        {card.dob || '---'} | {card.bloodType || '---'} | {card.height || '---'} / {card.weight || '---'}
                      </p>
                      <p className="text-xs text-nomad-slate">
                        {card.parentName1}: {card.parentPhone1 || '---'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => printChildCard(card)}>
                        <Printer className="h-3 w-3 mr-1" />
                        Yazdir
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(card)}>
                        Duzenle
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(card.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 && editingId === null && (
        <Card className="border-nomad-border">
          <CardContent className="pt-12 text-center">
            <IdCard className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
            <p className="text-nomad-slate mb-4">Henüz kimlik karti yok. Ilk kartinizi olusturun.</p>
            <p className="text-xs text-nomad-slate mb-4">No ID cards yet. Create your first card.</p>
            <Button onClick={startNew}>
              <Plus className="h-4 w-4 mr-1" />
              Yeni Kart Olustur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
