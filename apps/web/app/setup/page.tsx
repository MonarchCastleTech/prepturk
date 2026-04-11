'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useSetupStore } from '../../lib/stores';
import {
  Brain, CheckCircle, ChevronLeft, ChevronRight, Zap, Monitor, Wifi, Check
} from 'lucide-react';

const steps = [
  { num: 1, label: 'Sistem' },
  { num: 2, label: 'Cihaz' },
  { num: 3, label: 'Modüller' },
  { num: 4, label: 'Depolama' },
  { num: 5, label: 'Yapay Zekâ' },
  { num: 6, label: 'İçerik' },
  { num: 7, label: 'İl İçeriği' },
  { num: 8, label: 'Özet' },
];

const modules = [
  { id: 'documents', label: 'Belge Yonetimi', desc: 'Mevzuat ve dokuman arşivi' },
  { id: 'search', label: 'Tam Metin Arama', desc: 'Turkce karakter destekli arama' },
  { id: 'ai', label: 'AI Asistan', desc: 'Yerel RAG destekli asistan' },
  { id: 'education', label: 'Egitim Rafi', desc: 'Ilkokul, lise kaynaklari' },
  { id: 'maps', label: 'Haritalar', desc: 'Cevrimdisi harita goruntuleyici' },
  { id: 'vault', label: 'Kisisel Kasa', desc: 'Sifreli dosya depolama' },
  { id: 'notes', label: 'Notlar', desc: 'Acil durum notlari' },
  { id: 'province-packs', label: 'İl Paketleri', desc: 'Kurulumla gelen il içerikleri' },
];

const storageOptions = [
  { id: '10gb', label: '10 GB', desc: 'Temel mevzuat' },
  { id: '50gb', label: '50 GB', desc: 'Mevzuat + belgeler' },
  { id: '200gb', label: '200 GB', desc: 'Tam arşiv' },
  { id: 'unlimited', label: 'Sinirsiz', desc: 'Tum icerikler' },
];

const aiProfiles = [
  { id: 'local', label: 'Yerel Dengeli', desc: 'Tamamen çevrimdışı, günlük kullanım için dengeli profil' },
  { id: 'hybrid', label: 'Yerel Güçlü', desc: 'Geniş belge taraması için daha güçlü yerel profil' },
  { id: 'cloud', label: 'Yerel Hızlı', desc: 'Düşük donanımda daha hızlı çalışan yerel profil' },
];

const contentPacks = [
  { id: 'mevzuat', label: 'Resmi Mevzuat', desc: 'Kanun, yonetmelik, genelge' },
  { id: 'egitim', label: 'Egitim Materyalleri', desc: 'MEB kaynaklari' },
  { id: 'saglik', label: 'Saglik Rehberleri', desc: 'Acil tip bilgileri' },
  { id: 'afet', label: 'Afet & Acil Durum', desc: 'Deprem, sel, yangin rehberleri' },
];

const provinces = [
  { code: '34', name: 'Istanbul' },
  { code: '06', name: 'Ankara' },
  { code: '35', name: 'Izmir' },
  { code: '16', name: 'Bursa' },
  { code: '07', name: 'Antalya' },
  { code: '01', name: 'Adana' },
];

export default function SetupPage() {
  const store = useSetupStore();
  const router = useRouter();
  const [selectedModules, setSelectedModules] = useState<string[]>(store.selectedModules);
  const [selectedPacks, setSelectedPacks] = useState<string[]>(store.contentPacks);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      store.setSelectedModules(next);
      return next;
    });
  };

  const togglePack = (id: string) => {
    setSelectedPacks((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      store.setContentPacks(next);
      return next;
    });
  };

  const handleFinish = async () => {
    store.markCompleted();
    router.push('/');
  };

  const renderStep = () => {
    switch (store.step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sistem Ayarlari</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Dil</label>
              <select
                value={store.language}
                onChange={(e) => store.setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-nomad-surface border border-nomad-border rounded-lg text-foreground"
              >
                <option value="tr">Turkce</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sunucu Adresi</label>
              <Input value={store.hostname} onChange={(e) => store.setHostname(e.target.value)} placeholder="localhost" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => store.setLanAccess(false)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                  !store.lanAccess ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border'
                }`}
              >
                <Monitor className="h-5 w-5 text-nomad-green" />
                <div className="text-left">
                  <div className="text-sm font-medium">Sadece Yerel</div>
                  <div className="text-xs text-nomad-slate">127.0.0.1</div>
                </div>
              </button>
              <button
                onClick={() => store.setLanAccess(true)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                  store.lanAccess ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border'
                }`}
              >
                <Wifi className="h-5 w-5 text-nomad-blue" />
                <div className="text-left">
                  <div className="text-sm font-medium">LAN Erisimi</div>
                  <div className="text-xs text-nomad-slate">192.168.x.x</div>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cihaz Profili</h3>
            <p className="text-sm text-nomad-slate">
              Bu adim hesap olusturmaz; cihazin yerel ya da LAN modu, hostname ve dil ayarlari onaylanir.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-nomad-border bg-nomad-bg p-4">
                <div className="text-xs uppercase tracking-wide text-nomad-slate">Dil</div>
                <div className="text-sm font-medium">{store.language === 'tr' ? 'Turkce' : 'English'}</div>
              </div>
              <div className="rounded-lg border border-nomad-border bg-nomad-bg p-4">
                <div className="text-xs uppercase tracking-wide text-nomad-slate">Hostname</div>
                <div className="text-sm font-medium">{store.hostname}</div>
              </div>
              <div className="rounded-lg border border-nomad-border bg-nomad-bg p-4 sm:col-span-2">
                <div className="text-xs uppercase tracking-wide text-nomad-slate">Ag Modu</div>
                <div className="text-sm font-medium">{store.lanAccess ? 'LAN erisimi acik' : 'Sadece yerel calisma'}</div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modul Secimi</h3>
            <p className="text-sm text-nomad-slate">Sisteminizde aktif olmasini istediginiz modulleri secin.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modules.map((mod) => {
                const active = selectedModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      active ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border hover:border-nomad-slate'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{mod.label}</span>
                      {active && <Check className="h-4 w-4 text-nomad-green" />}
                    </div>
                    <span className="text-xs text-nomad-slate">{mod.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Depolama Limiti</h3>
            <div className="grid grid-cols-2 gap-3">
              {storageOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => store.setStorageLimit(opt.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    store.storageLimit === opt.id ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border'
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs text-nomad-slate">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Yapay Zekâ Profili</h3>
            <div className="space-y-3">
              {aiProfiles.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => store.setAiModelProfile(prof.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    store.aiModelProfile === prof.id ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-nomad-green" />
                    <div>
                      <div className="text-sm font-medium">{prof.label}</div>
                      <div className="text-xs text-nomad-slate">{prof.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Başlangıç İçerikleri</h3>
            <div className="space-y-2">
              {contentPacks.map((pack) => {
                const active = selectedPacks.includes(pack.id);
                return (
                  <button
                    key={pack.id}
                    onClick={() => togglePack(pack.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors flex items-center justify-between ${
                      active ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">{pack.label}</div>
                      <div className="text-xs text-nomad-slate">{pack.desc}</div>
                    </div>
                    {active && <Check className="h-4 w-4 text-nomad-green" />}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İl İçeriğini Etkinleştir</h3>
            <p className="text-sm text-nomad-slate">
              Şehrinize ait içerik kurulumla birlikte hazır gelir. Kullanmak istediğiniz ili seçin.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {provinces.map((prov) => (
                <button
                  key={prov.code}
                  onClick={() => store.setProvincePack(prov.code)}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    store.provincePack === prov.code ? 'border-nomad-green bg-nomad-green/10' : 'border-nomad-border'
                  }`}
                >
                  <Badge variant={store.provincePack === prov.code ? 'default' : 'outline'}>
                    {prov.code}
                  </Badge>
                  <div className="text-xs mt-1">{prov.name}</div>
                </button>
              ))}
            </div>
            <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-nomad-green" />
                <span className="text-sm font-medium">Kurulumla Hazır İçerik</span>
              </div>
              <ul className="text-xs text-nomad-slate space-y-1">
                <li>- İl bazlı mevzuat özetleri</li>
                <li>- Yerel afet planları</li>
                <li>- Acil toplanma alanları</li>
                <li>- İlçe sağlık kurumları</li>
              </ul>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 text-nomad-green mx-auto" />
            <h3 className="text-xl font-semibold">Cihaz Hazırlığı Özeti</h3>
            <div className="text-left space-y-2 text-sm bg-nomad-bg p-4 rounded-lg border border-nomad-border">
              <div className="flex justify-between"><span className="text-nomad-slate">Dil:</span><span>{store.language === 'tr' ? 'Turkce' : 'English'}</span></div>
              <div className="flex justify-between"><span className="text-nomad-slate">Hostname:</span><span>{store.hostname}</span></div>
              <div className="flex justify-between"><span className="text-nomad-slate">Ag modu:</span><span>{store.lanAccess ? 'LAN' : 'Yerel'}</span></div>
              <div className="flex justify-between"><span className="text-nomad-slate">Moduller:</span><span>{selectedModules.length} adet</span></div>
              <div className="flex justify-between"><span className="text-nomad-slate">Depolama:</span><span>{store.storageLimit}</span></div>
              <div className="flex justify-between"><span className="text-nomad-slate">Yapay zekâ:</span><span>{store.aiModelProfile === 'local' ? 'Yerel Dengeli' : store.aiModelProfile === 'hybrid' ? 'Yerel Güçlü' : 'Yerel Hızlı'}</span></div>
              <div className="flex justify-between"><span className="text-nomad-slate">İçerik:</span><span>{selectedPacks.length} alan</span></div>
              {store.provincePack && (
                <div className="flex justify-between"><span className="text-nomad-slate">İl İçeriği:</span><span>{provinces.find(p => p.code === store.provincePack)?.name}</span></div>
              )}
              {store.completedAt && (
                <div className="flex justify-between">
                  <span className="text-nomad-slate">Tamamlanma:</span>
                  <span>{new Date(store.completedAt).toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>
            <Button onClick={handleFinish} size="lg" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Hazirligi Tamamla ve Ana Sayfaya Don
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-nomad-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-nomad-green" />
              <CardTitle>Kurulum Sihirbazi</CardTitle>
            </div>
            <span className="text-sm text-nomad-slate">{store.step} / 8</span>
          </div>

          <div className="flex items-center gap-1">
            {steps.map((s) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${
                    s.num <= store.step ? 'bg-nomad-green' : 'bg-nomad-border'
                  }`}
                />
              </div>
            ))}
          </div>
          <CardDescription>{steps[store.step - 1]?.label}</CardDescription>
        </CardHeader>

        <CardContent>
          {renderStep()}

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-nomad-border">
            <Button
              variant="secondary"
              onClick={() => store.step > 1 ? store.prev() : router.push('/')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {store.step === 1 ? 'Ana Sayfaya Don' : 'Geri'}
            </Button>

            {store.step < 8 && (
              <Button onClick={() => store.next()}>
                Ileri
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
