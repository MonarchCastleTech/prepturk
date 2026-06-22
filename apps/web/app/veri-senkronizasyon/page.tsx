'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Download, Upload, Usb, FileJson, Database, AlertTriangle, CheckCircle,
  ArrowRightLeft, Eye, Loader2, Info, Shield, Layers
} from 'lucide-react';

const STORAGE_KEYS = [
  'prepturk:healthProfile',
  'prepturk:familyPlan',
  'prepturk:neighborhood',
  'prepturk:buildingDirectory',
  'prepturk:inventory',
  'prepturk:qrMessages',
  'prepturk:studyProgress',
  'prepturk:notes',
  'prepturk:communityResources',
  'prepturk:solarSessions',
  'prepturk:powerSetup',
  'prepturk:checklistState',
  'prepturk:chronicExpanded',
];

const KEY_LABELS: Record<string, { tr: string; en: string }> = {
  'prepturk:healthProfile': { tr: 'Sağlık Profili', en: 'Health Profile' },
  'prepturk:familyPlan': { tr: 'Aile Planı', en: 'Family Plan' },
  'prepturk:neighborhood': { tr: 'Mahalle Verileri', en: 'Neighborhood Data' },
  'prepturk:buildingDirectory': { tr: 'Bina Rehberi', en: 'Building Directory' },
  'prepturk:inventory': { tr: 'Envanter', en: 'Inventory' },
  'prepturk:qrMessages': { tr: 'QR Mesajları', en: 'QR Messages' },
  'prepturk:studyProgress': { tr: 'Çalışma İlerlemesi', en: 'Study Progress' },
  'prepturk:notes': { tr: 'Notlar', en: 'Notes' },
  'prepturk:communityResources': { tr: 'Topluluk Kaynakları', en: 'Community Resources' },
  'prepturk:solarSessions': { tr: 'Güneş Şarj Kayıtları', en: 'Solar Charging Logs' },
  'prepturk:powerSetup': { tr: 'Güç Kurulumu', en: 'Power Setup' },
  'prepturk:checklistState': { tr: 'Kontrol Listesi', en: 'Checklist State' },
  'prepturk:chronicExpanded': { tr: 'Kronik Durum', en: 'Chronic Condition' },
};

interface ImportPreview {
  key: string;
  label: { tr: string; en: string };
  hasData: boolean;
  dataSize: string;
  type: string;
}

type ImportMode = 'merge' | 'replace';
type Step = 'idle' | 'previewing' | 'importing' | 'done' | 'error';

export default function VeriSenkronizasyonPage() {
  const [step, setStep] = useState<Step>('idle');
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [importPreview, setImportPreview] = useState<ImportPreview[]>([]);
  const [importData, setImportData] = useState<Record<string, unknown> | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [exportSize, setExportSize] = useState('');
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const collectAllData = (): Record<string, unknown> => {
    const data: Record<string, unknown> = {};
    for (const key of STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          data[key] = JSON.parse(raw);
        }
      } catch { /* skip corrupt data */ }
    }
    data['prepturk:exportDate'] = new Date().toISOString();
    data['prepturk:version'] = '1.0.0';
    return data;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleExport = () => {
    const data = collectAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `prepturk-backup-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportSize(formatFileSize(blob.size));
    setStep('done');
    setTimeout(() => { setStep('idle'); setExportSize(''); }, 5000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setImportData(data);

        const preview: ImportPreview[] = [];
        for (const key of STORAGE_KEYS) {
          if (data[key] !== undefined && data[key] !== null) {
            const val = data[key];
            let type = 'object';
            let dataSize = '';
            if (Array.isArray(val)) {
              type = 'array';
              dataSize = `${val.length} öge`;
            } else if (typeof val === 'string') {
              type = 'string';
              dataSize = `${val.length} karakter`;
            } else if (typeof val === 'object') {
              type = 'object';
              dataSize = `${Object.keys(val).length} alan`;
            }
            preview.push({
              key,
              label: KEY_LABELS[key] || { tr: key, en: key },
              hasData: true,
              dataSize,
              type,
            });
          }
        }
        setImportPreview(preview);
        setStep('previewing');
        setError('');
      } catch {
        setError('Dosya okunamadı. Geçerli bir JSON dosyası seçtiğinizden emin olun.');
        setStep('error');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) return;
    setConfirmDialog(false);
    setStep('importing');
    setImportProgress(0);

    const keys = Object.keys(importData).filter((k) => k !== 'prepturk:exportDate' && k !== 'prepturk:version');
    const total = keys.length;

    for (let i = 0; i < total; i++) {
      const key = keys[i];
      try {
        if (importMode === 'merge') {
          const existing = localStorage.getItem(key);
          if (existing) {
            const existingData = JSON.parse(existing);
            const newData = importData[key];

            if (Array.isArray(existingData) && Array.isArray(newData)) {
              const merged = [...existingData];
              for (const item of newData) {
                if (!merged.some((e) => JSON.stringify(e) === JSON.stringify(item))) {
                  merged.push(item);
                }
              }
              localStorage.setItem(key, JSON.stringify(merged));
            } else if (typeof existingData === 'object' && typeof newData === 'object') {
              localStorage.setItem(key, JSON.stringify({ ...existingData, ...newData }));
            } else {
              localStorage.setItem(key, JSON.stringify(newData));
            }
          } else {
            localStorage.setItem(key, JSON.stringify(importData[key]));
          }
        } else {
          localStorage.setItem(key, JSON.stringify(importData[key]));
        }
      } catch { /* skip errors */ }

      setImportProgress(((i + 1) / total) * 100);
      await new Promise((r) => setTimeout(r, 100));
    }

    setStep('done');
    setTimeout(() => {
      setStep('idle');
      setImportData(null);
      setImportPreview([]);
      setImportProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 5000);
  };

  const openImportDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-7 w-7 text-nomad-green" />
          Veri Senkronizasyon
        </h1>
        <p className="text-nomad-slate text-sm">P2P Data Synchronization -- USB Dışa/İçe Aktarma</p>
      </div>

      {/* Offline indicator */}
      <Card className="border-nomad-green/30 bg-nomad-green/5">
        <CardContent className="p-3 flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-nomad-green flex-shrink-0" />
          <span className="text-nomad-slate">
            Tüm veriler cihazınızda saklanır. USB ile başka cihaza aktarabilirsiniz.
          </span>
          <span className="text-nomad-slate text-xs">(All data stored locally -- transferable via USB)</span>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-nomad-green" />
              Tüm Verileri Dışa Aktar
            </CardTitle>
            <CardDescription>Export All Data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-nomad-slate">
              Tüm PrepTürk verilerinizi JSON dosyası olarak indirin. Bu dosya başka bir cihaza aktarılabilir.
            </p>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar / Export
            </Button>
            {exportSize && (
              <p className="text-xs text-nomad-slate text-center">
                Dosya boyutu: {exportSize}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Verileri İçe Aktar
            </CardTitle>
            <CardDescription>Import Data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-nomad-slate">
              Daha önce dışa aktarılan JSON dosyasını yükleyin ve verilerinizi geri yükleyin.
            </p>
            <Button variant="outline" onClick={openImportDialog} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Dosya Seç / Select File
            </Button>
          </CardContent>
        </Card>

        {/* USB Backup Card */}
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Usb className="h-5 w-5 text-purple-400" />
              USB'den Yedekle
            </CardTitle>
            <CardDescription>USB Backup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-nomad-slate">
              Verilerinizi USB sürücüye yedeklemek için öncelikle dışa aktarım yapın, sonra dosyayı USB'ye kopyalayın.
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Adımlar / Steps:</h4>
              <ol className="space-y-1 text-sm text-nomad-slate">
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>"Tüm Verileri Dışa Aktar" butonuna tıklayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>İndirilen JSON dosyasını USB sürücüye kopyalayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>USB'yi başka bir cihaza takın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-nomad-green/20 text-nomad-green flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span>O cihazda "Verileri İçe Aktar" ile dosyayı yükleyin</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Seed Kit Card */}
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-400" />
              Seed Kit Bilgisi
            </CardTitle>
            <CardDescription>Seed Kit Information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-nomad-slate">
              Seed Kit: Bir USB sürücüye tüm verileri yükleyin -- başka bir kullanıcı kendi PrepTürk'üne yükleyebilir.
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">İçerik / Contents:</h4>
              <ul className="space-y-1 text-sm text-nomad-slate">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-nomad-green flex-shrink-0" />
                  <span>Temel belgeler listesi (core documents)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-nomad-green flex-shrink-0" />
                  <span>Eyalet paketleri (province packs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-nomad-green flex-shrink-0" />
                  <span>AI model dosyalari (offline reference data)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-nomad-green flex-shrink-0" />
                  <span>Acil durum dokümanları</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-nomad-green flex-shrink-0" />
                  <span>Sağlık rehberleri</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg">
              <p className="text-xs text-amber-200">
                Seed Kit oluşturmak için tüm verileri dışa aktarın ve USB sürücüye kaydedin.
                Diğer kullanıcılar bu dosyayı kendi PrepTürk'lerine içe aktarabilir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Preview */}
      {step === 'previewing' && importData && (
        <Card className="border-blue-700 bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              İçe Aktarma Önizleme / Import Preview
            </CardTitle>
            <CardDescription>Aşağıdaki veriler içe aktarılacak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setImportMode('merge')}
                className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                  importMode === 'merge'
                    ? 'border-nomad-green bg-nomad-green/10 text-nomad-green'
                    : 'border-nomad-border bg-nomad-bg text-nomad-slate hover:border-nomad-green/50'
                }`}
              >
                <ArrowRightLeft className="h-4 w-4 mx-auto mb-1" />
                <div className="font-medium">Birleştir / Merge</div>
                <div className="text-xs text-nomad-slate mt-1">Mevcut verileri koru + yenilerini ekle</div>
              </button>
              <button
                onClick={() => setImportMode('replace')}
                className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                  importMode === 'replace'
                    ? 'border-red-600 bg-red-900/20 text-red-300'
                    : 'border-nomad-border bg-nomad-bg text-nomad-slate hover:border-red-600/50'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                <div className="font-medium">Değiştir / Replace</div>
                <div className="text-xs text-nomad-slate mt-1">Mevcut verilerin üzerine yaz</div>
              </button>
            </div>

            {/* Data Categories */}
            <div className="space-y-2">
              {importPreview.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-2 bg-nomad-bg rounded-lg border border-nomad-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-nomad-green" />
                    <div>
                      <p className="text-sm font-medium">{item.label.tr}</p>
                      <p className="text-xs text-nomad-slate">{item.label.en}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-nomad-slate">{item.dataSize}</p>
                    <p className="text-xs text-nomad-slate">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep('idle'); setImportData(null); setImportPreview([]); }} className="flex-1">
                İptal
              </Button>
              <Button onClick={() => setConfirmDialog(true)} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                İçe Aktar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {step === 'importing' && (
        <Card className="border-nomad-green/50 bg-nomad-green/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-nomad-green animate-spin" />
              <div>
                <p className="font-medium">Veriler içe aktarılıyor...</p>
                <p className="text-sm text-nomad-slate">Importing data...</p>
              </div>
            </div>
            <div className="w-full bg-nomad-surface rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-nomad-green transition-all duration-300 rounded-full"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <p className="text-xs text-nomad-slate text-center">%{Math.round(importProgress)} tamamlandı</p>
          </CardContent>
        </Card>
      )}

      {/* Done State */}
      {step === 'done' && (
        <Card className="border-nomad-green bg-nomad-green/10">
          <CardContent className="p-6 text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-nomad-green mx-auto" />
            <p className="text-lg font-semibold text-nomad-green">İşlem başarılı!</p>
            <p className="text-sm text-nomad-slate">
              {exportSize ? `Dışa aktarma tamamlandı. Dosya boyutu: ${exportSize}` : 'İçe aktarma tamamlandı. Verileriniz yüklendi.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {step === 'error' && error && (
        <Card className="border-red-700 bg-red-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">Hata / Error</p>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-nomad-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Onay / Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                {importMode === 'merge'
                  ? 'Mevcut verileriniz korunacak ve yeni veriler eklenecek. Devam etmek istiyor musunuz?'
                  : 'DİKKAT: Mevcut tüm verileriniz silinecek ve yedek verilerle değiştirilecek. Bu işlem geri alınamaz!'}
              </p>
              <p className="text-xs text-nomad-slate">
                {importMode === 'merge'
                  ? '(Existing data will be preserved and new data will be added.)'
                  : '(WARNING: All existing data will be deleted and replaced with backup data. This cannot be undone!)'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmDialog(false)} className="flex-1">
                  İptal / Cancel
                </Button>
                <Button variant={importMode === 'replace' ? 'destructive' : 'default'} onClick={handleImport} className="flex-1">
                  Onayla / Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Nasıl Çalışır / How It Works</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            PrepTürk tüm verilerinizi tarayıcınızın yerel deposunda (localStorage) saklar. İnternet bağlantısı olmadan da çalışır.
            "Dışa Aktar" butonu tüm verilerinizi bir JSON dosyasına paketler. Bu dosyayı USB, bluetooth veya herhangi bir yöntemle
            başka bir cihaza aktarabilirsiniz. "İçe Aktar" butonu ile başka bir cihazdan gelen JSON dosyasını yükleyebilirsiniz.
          </p>
          <p className="text-xs text-nomad-slate">
            (PrepTürk stores all data in your browser's localStorage. It works without internet. Export packs all data into a JSON file
            that can be transferred via USB, Bluetooth, or any method. Import loads JSON backups from other devices.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
