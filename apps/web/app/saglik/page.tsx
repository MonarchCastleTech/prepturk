'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Heart,
  Pill,
  Phone,
  Stethoscope,
  Printer,
  Plus,
  Trash2,
  Save,
  Info,
  Shield,
  FileText,
} from 'lucide-react';

interface HealthProfile {
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  medications: { name: string; dosage: string; schedule: string; time: string }[];
  doctors: { name: string; specialty: string; phone: string }[];
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  notes: string;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMMON_ALLERGIES = [
  'Penisilin',
  'Aspirin',
  'Kontrast madde',
  'Lateks',
  'Arı sokması',
  'Yer fıstığı',
  'Süt ürünleri',
  'Yumurta',
  'Kabuklu deniz ürünleri',
  'Polen',
  'Toz akarı',
  'Diğer',
];

const COMMON_CONDITIONS = [
  'Diyabet',
  'Hipertansiyon',
  'Astım',
  'KOAH',
  'Kalp yetmezliği',
  'Epilepsi',
  'Migren',
  'Hipotiroidi',
  'Böbrek yetmezliği',
  'Depresyon',
  'Anksiyete',
  'Diğer',
];

const MEDICATION_SCHEDULES = [
  'Her gün',
  'Günde bir',
  'Günde iki',
  'Günde üç',
  'Haftada bir',
  'İhtiyaç halinde',
  'Sabah aç karnına',
  'Akşam tok karnına',
];

const STORAGE_KEY = 'prepturk:healthProfile';

const EMPTY_PROFILE: HealthProfile = {
  bloodType: '',
  allergies: [],
  chronicConditions: [],
  medications: [],
  doctors: [],
  emergencyContacts: [],
  notes: '',
};

function loadProfile(): HealthProfile {
  if (typeof window === 'undefined') {
    return EMPTY_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    return EMPTY_PROFILE;
  }

  return EMPTY_PROFILE;
}

function saveProfile(profile: HealthProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function TagSelector({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const [custom, setCustom] = useState('');

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((entry) => entry !== option));
      return;
    }

    onChange([...selected, option]);
  };

  const addCustom = () => {
    const value = custom.trim();
    if (!value || selected.includes(value)) {
      return;
    }

    onChange([...selected, value]);
    setCustom('');
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={
              selected.includes(option)
                ? 'rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-sm text-rose-100'
                : 'rounded-full border border-white/8 bg-black/15 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white'
            }
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="Özel kayıt ekle"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addCustom();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addCustom}>
          Ekle
        </Button>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1">
              {item}
              <button type="button" onClick={() => onChange(selected.filter((entry) => entry !== item))}>
                x
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HealthPage() {
  const [profile, setProfile] = useState<HealthProfile>(loadProfile);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'contacts'>('overview');

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const updateProfile = (updates: Partial<HealthProfile>) => {
    setProfile((previous) => ({ ...previous, ...updates }));
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addMedication = () => {
    updateProfile({
      medications: [...profile.medications, { name: '', dosage: '', schedule: 'Her gün', time: '08:00' }],
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const medications = [...profile.medications];
    medications[index] = { ...medications[index], [field]: value };
    updateProfile({ medications });
  };

  const removeMedication = (index: number) => {
    updateProfile({ medications: profile.medications.filter((_, itemIndex) => itemIndex !== index) });
  };

  const addDoctor = () => {
    updateProfile({
      doctors: [...profile.doctors, { name: '', specialty: '', phone: '' }],
    });
  };

  const updateDoctor = (index: number, field: string, value: string) => {
    const doctors = [...profile.doctors];
    doctors[index] = { ...doctors[index], [field]: value };
    updateProfile({ doctors });
  };

  const removeDoctor = (index: number) => {
    updateProfile({ doctors: profile.doctors.filter((_, itemIndex) => itemIndex !== index) });
  };

  const addEmergencyContact = () => {
    updateProfile({
      emergencyContacts: [...profile.emergencyContacts, { name: '', relationship: '', phone: '' }],
    });
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const emergencyContacts = [...profile.emergencyContacts];
    emergencyContacts[index] = { ...emergencyContacts[index], [field]: value };
    updateProfile({ emergencyContacts });
  };

  const removeEmergencyContact = (index: number) => {
    updateProfile({
      emergencyContacts: profile.emergencyContacts.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const summaryAllergies = profile.allergies.slice(0, 2).join(', ') || 'Kayıt bekliyor';
  const summaryConditions = profile.chronicConditions.slice(0, 2).join(', ') || 'Kayıt bekliyor';

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-6 shadow-panel sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <Shield className="h-3.5 w-3.5 text-emerald-300" />
              Yerel Sağlık Kayıtları
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Sağlık Dosyası
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Yerel sağlık özeti, ilaç planı, doktor kayıtları ve acil iletişim bilgileri tek dosyada tutulur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" />
              Yazdır
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-1 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Yerel sağlık özeti</p>
            <p className="mt-3 text-xl font-semibold text-white">{profile.bloodType || 'Kan grubu eklenmedi'}</p>
            <p className="mt-2 text-sm text-slate-300">{summaryAllergies}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-100/80">Acil iletişim halkası</p>
            <p className="mt-3 text-xl font-semibold text-white">{profile.emergencyContacts.length} kişi</p>
            <p className="mt-2 text-sm text-rose-50/80">İlk aranacak yakın çevre kayıtları</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">İlaç planı</p>
            <p className="mt-3 text-xl font-semibold text-white">{profile.medications.length} kayıt</p>
            <p className="mt-2 text-sm text-slate-300">{summaryConditions}</p>
          </div>
        </div>

        {saved && (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Sağlık dosyası yerel belleğe kaydedildi.
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Genel dosya', icon: FileText },
          { id: 'medications', label: 'İlaç planı', icon: Pill },
          { id: 'contacts', label: 'İletişim ve doktorlar', icon: Phone },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'overview' | 'medications' | 'contacts')}
            className={
              activeTab === tab.id
                ? 'inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100'
                : 'inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white'
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
          <div className="space-y-6">
            <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 text-rose-300" />
                  Temel sağlık bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Kan grubu</label>
                  <select
                    value={profile.bloodType}
                    onChange={(event) => updateProfile({ bloodType: event.target.value })}
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 text-sm text-white"
                  >
                    <option value="">Seçiniz</option>
                    {BLOOD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <TagSelector
                  label="Alerjiler"
                  options={COMMON_ALLERGIES}
                  selected={profile.allergies}
                  onChange={(value) => updateProfile({ allergies: value })}
                />

                <TagSelector
                  label="Kronik durumlar"
                  options={COMMON_CONDITIONS}
                  selected={profile.chronicConditions}
                  onChange={(value) => updateProfile({ chronicConditions: value })}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Ek notlar</label>
                  <textarea
                    value={profile.notes}
                    onChange={(event) => updateProfile({ notes: event.target.value })}
                    rows={5}
                    placeholder="Operasyon sırasında bilinmesi gereken sağlık notları"
                    className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Info className="h-5 w-5 text-sky-300" />
                  Hazır referans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <p>Dosyaya alerji, ilaç ve kritik iletişim kayıtları eklenmeden bırakılmamalıdır.</p>
                <p>Yazdırılmış sürüm aile bireylerinin erişebileceği bir noktada tutulmalıdır.</p>
                <p>Kan grubu ve sürekli ilaç alanları boşsa ilk fırsatta tamamlayın.</p>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Stethoscope className="h-5 w-5 text-emerald-300" />
                  Doktor kayıtları
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addDoctor}>
                  <Plus className="mr-1 h-4 w-4" />
                  Ekle
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.doctors.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center text-sm text-slate-400">
                    Doktor kaydı eklenmedi.
                  </div>
                )}
                {profile.doctors.map((doctor, index) => (
                  <div key={index} className="space-y-3 rounded-2xl border border-white/8 bg-black/15 p-4">
                    <div className="grid gap-3">
                      <Input
                        value={doctor.name}
                        onChange={(event) => updateDoctor(index, 'name', event.target.value)}
                        placeholder="Doktor adı"
                      />
                      <Input
                        value={doctor.specialty}
                        onChange={(event) => updateDoctor(index, 'specialty', event.target.value)}
                        placeholder="Uzmanlık alanı"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={doctor.phone}
                          onChange={(event) => updateDoctor(index, 'phone', event.target.value)}
                          placeholder="Telefon"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeDoctor(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Pill className="h-5 w-5 text-amber-300" />
              İlaç planı
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addMedication}>
              <Plus className="mr-1 h-4 w-4" />
              İlaç ekle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.medications.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-10 text-center text-sm text-slate-400">
                Henüz ilaç planı girilmedi.
              </div>
            )}
            {profile.medications.map((medication, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">İlaç #{index + 1}</p>
                  <Button variant="ghost" size="icon" onClick={() => removeMedication(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={medication.name}
                    onChange={(event) => updateMedication(index, 'name', event.target.value)}
                    placeholder="İlaç adı"
                  />
                  <Input
                    value={medication.dosage}
                    onChange={(event) => updateMedication(index, 'dosage', event.target.value)}
                    placeholder="Doz bilgisi"
                  />
                  <select
                    value={medication.schedule}
                    onChange={(event) => updateMedication(index, 'schedule', event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/15 px-3 text-sm text-white"
                  >
                    {MEDICATION_SCHEDULES.map((schedule) => (
                      <option key={schedule} value={schedule}>
                        {schedule}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="time"
                    value={medication.time}
                    onChange={(event) => updateMedication(index, 'time', event.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'contacts' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Phone className="h-5 w-5 text-emerald-300" />
                Acil iletişim halkası
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addEmergencyContact}>
                <Plus className="mr-1 h-4 w-4" />
                Kişi ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.emergencyContacts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-10 text-center text-sm text-slate-400">
                  Acil iletişim kaydı eklenmedi.
                </div>
              )}
              {profile.emergencyContacts.map((contact, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-white/8 bg-black/15 p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input
                      value={contact.name}
                      onChange={(event) => updateEmergencyContact(index, 'name', event.target.value)}
                      placeholder="Ad soyad"
                    />
                    <Input
                      value={contact.relationship}
                      onChange={(event) => updateEmergencyContact(index, 'relationship', event.target.value)}
                      placeholder="Yakınlık"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={contact.phone}
                        onChange={(event) => updateEmergencyContact(index, 'phone', event.target.value)}
                        placeholder="Telefon"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeEmergencyContact(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-rose-300" />
                Acil numaralar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: 'Ambulans', number: '112' },
                { label: 'İtfaiye', number: '110' },
                { label: 'Polis', number: '155' },
                { label: 'Jandarma', number: '156' },
                { label: 'Zehir Danışma', number: '114' },
                { label: 'ALO Sağlık', number: '184' },
              ].map((item) => (
                <div key={item.number} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/15 px-3 py-2">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold text-white">{item.number}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
