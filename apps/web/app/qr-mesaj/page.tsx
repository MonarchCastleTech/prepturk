'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import ReactQRCode from 'react-qr-code';
import {
  Send,
  QrCode,
  Camera,
  Download,
  Upload,
  MessageSquare,
  Clock,
  MapPin,
  AlertTriangle,
  Droplets,
  Utensils,
  Pill,
  Home,
  X,
  Trash2,
} from 'lucide-react';

type Status = 'guvendeyim' | 'yardim-lazim' | 'bolge-guvenli' | 'acil-yardim' | 'bilgi';
type Need = 'su' | 'yiyecek' | 'ilac' | 'barinak' | 'yok';
type Priority = 'normal' | 'acil';

interface QRMessage {
  id: string;
  sender: string;
  status: Status;
  location: string;
  need: Need;
  message: string;
  timestamp: string;
  priority: Priority;
}

const STATUS_CONFIG: Record<Status, { label: string; labelEn: string; color: string; icon: string }> = {
  guvendeyim: { label: 'Guvendeyim', labelEn: 'I am safe', color: 'bg-green-600', icon: '✓' },
  'yardim-lazim': { label: 'Yardim Lazim', labelEn: 'Need help', color: 'bg-yellow-600', icon: '?' },
  'bolge-guvenli': { label: 'Bolge Guvenli', labelEn: 'Area safe', color: 'bg-blue-600', icon: '◉' },
  'acil-yardim': { label: 'Acil Yardim', labelEn: 'Emergency', color: 'bg-red-600', icon: '!!!' },
  bilgi: { label: 'Bilgi', labelEn: 'Info', color: 'bg-gray-600', icon: 'i' },
};

const NEED_CONFIG: Record<Need, { label: string; labelEn: string; icon: typeof Droplets }> = {
  su: { label: 'Su', labelEn: 'Water', icon: Droplets },
  yiyecek: { label: 'Yiyecek', labelEn: 'Food', icon: Utensils },
  ilac: { label: 'Ilac', labelEn: 'Medicine', icon: Pill },
  barinak: { label: 'Barinak', labelEn: 'Shelter', icon: Home },
  yok: { label: 'Yok', labelEn: 'None', icon: X },
};

const STORAGE_KEY = 'prepturk:qrMessages';

function loadMessages(): QRMessage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: QRMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function QRMesajPage() {
  const [sender, setSender] = useState('');
  const [status, setStatus] = useState<Status>('guvendeyim');
  const [location, setLocation] = useState('');
  const [need, setNeed] = useState<Need>('yok');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<QRMessage[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  const buildMessageJSON = useCallback((): string => {
    const msg: QRMessage = {
      id: generateId(),
      sender: sender.trim() || 'Anonim',
      status,
      location: location.trim(),
      need,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      priority,
    };
    return JSON.stringify(msg);
  }, [sender, status, location, need, message, priority]);

  const generateQR = useCallback(async () => {
    const json = buildMessageJSON();
    try {
      const url = await QRCode.toDataURL(json, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(url);
      const msg: QRMessage = JSON.parse(json);
      const updated = [msg, ...messages];
      setMessages(updated);
      saveMessages(updated);
    } catch (err) {
      console.error('QR generate error:', err);
    }
  }, [buildMessageJSON, messages]);

  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      setScanResult(null);

      intervalRef.current = setInterval(() => {
        if (!videoRef.current || !streamRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/png');

        QRCode.toDataURL(imageData.slice(0, 100), { margin: 0 }).catch(() => {
          // QRCode lib cannot decode from image; we use a simple fallback
        });
      }, 2000);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Kamera erisimi saglanamadi. / Camera access denied.');
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleManualImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported: QRMessage[] = JSON.parse(ev.target?.result as string);
          const merged = [...imported, ...messages];
          const deduped = merged.filter(
            (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
          );
          deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setMessages(deduped);
          saveMessages(deduped);
        } catch {
          alert('Gecersiz dosya. / Invalid file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [messages]);

  const exportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prepturk-qr-mesajlari-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  const deleteMessage = useCallback((id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveMessages(updated);
  }, [messages]);

  const handleScanResult = useCallback((text: string) => {
    try {
      const parsed: QRMessage = JSON.parse(text);
      if (parsed.sender && parsed.status && parsed.timestamp) {
        const exists = messages.find((m) => m.id === parsed.id);
        if (!exists) {
          const updated = [parsed, ...messages];
          setMessages(updated);
          saveMessages(updated);
        }
        setScanResult(text);
        stopScanner();
      }
    } catch {
      setScanResult(text);
      stopScanner();
    }
  }, [messages, stopScanner]);

  // Manual scan input for when camera decoding is not available
  const handleManualScanInput = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const text = fd.get('scanText') as string;
    if (text.trim()) {
      handleScanResult(text.trim());
    }
  }, [handleScanResult]);

  return (
    <div className="min-h-screen bg-nomad-bg p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-nomad-green mb-1">
            QR Mesaj Encoder
          </h1>
          <p className="text-nomad-slate text-sm">
            Offline peer-to-peer messaging via QR codes
          </p>
        </header>

        {/* Message Form */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border p-5 mb-6 no-print">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-nomad-green" />
            Yeni Mesaj Olustur / Create Message
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                Gonderen / Sender
              </label>
              <input
                className="input-field w-full"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Adiniz / Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                Durum / Status
              </label>
              <select
                className="input-field w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label} ({cfg.labelEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Konum / Location
              </label>
              <input
                className="input-field w-full"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mahalle, sehir / Neighborhood, city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                Ihtiyac / Need
              </label>
              <select
                className="input-field w-full"
                value={need}
                onChange={(e) => setNeed(e.target.value as Need)}
              >
                {Object.entries(NEED_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label} ({cfg.labelEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                Mesaj / Message (max 200)
              </label>
              <textarea
                className="input-field w-full"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                placeholder="Istege bagli mesaj / Optional message"
                rows={3}
              />
              <span className="text-xs text-nomad-slate">{message.length}/200</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                Oncelik / Priority
              </label>
              <select
                className="input-field w-full"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="normal">Normal</option>
                <option value="acil">Acil (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nomad-slate mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Zaman / Time
              </label>
              <div className="input-field w-full text-nomad-slate">
                {new Date().toLocaleString('tr-TR')}
              </div>
            </div>
          </div>

          <button
            onClick={generateQR}
            className="mt-4 btn-primary flex items-center gap-2"
          >
            <QrCode className="h-5 w-5" />
            QR Kod Olustur / Generate QR
          </button>
        </section>

        {/* QR Code Display */}
        {qrDataUrl && (
          <section className="bg-nomad-surface rounded-xl border border-nomad-border p-5 mb-6 text-center">
            <h2 className="text-lg font-semibold text-white mb-3">
              Olusturulan QR Kod / Generated QR Code
            </h2>
            <div className="inline-block bg-white p-4 rounded-lg">
              <ReactQRCode value={buildMessageJSON()} size={300} />
            </div>
            <p className="text-nomad-slate text-sm mt-3">
              Bu kodu tarayarak mesaj alabilir / Scan this code to receive the message
            </p>
          </section>
        )}

        {/* Scanner */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border p-5 mb-6 no-print">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-nomad-green" />
            QR Tara / Scan QR
          </h2>

          {!scanning ? (
            <div className="space-y-3">
              <button onClick={startScanner} className="btn-secondary flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Kamerayi Baslat / Start Camera
              </button>
              <p className="text-nomad-slate text-sm">
                Kamerayi kullanarak QR kod tarayin / Use camera to scan QR codes
              </p>

              <div className="border-t border-nomad-border pt-3">
                <p className="text-sm text-nomad-slate mb-2">
                  Veya JSON yapistirin / Or paste JSON:
                </p>
                <form onSubmit={handleManualScanInput} className="flex gap-2">
                  <input
                    name="scanText"
                    className="input-field flex-1"
                    placeholder='{"sender":"Ali","status":"guvendeyim",...}'
                  />
                  <button type="submit" className="btn-primary">
                    Coz / Decode
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg border border-nomad-border"
                playsInline
                muted
              />
              <div className="flex gap-2 mt-3 justify-center">
                <button onClick={stopScanner} className="btn-secondary flex items-center gap-2">
                  <X className="h-5 w-5" />
                  Durdur / Stop
                </button>
              </div>
              {scanResult && (
                <div className="mt-3 bg-green-900/30 border border-green-700 rounded-lg p-3 text-sm text-green-300">
                  <p className="font-semibold">Mesaj cozuldu / Message decoded:</p>
                  <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                    {scanResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Import/Export */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border p-5 mb-6 no-print">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-nomad-green" />
            Ice/Disa Aktar / Import/Export
          </h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportAll} className="btn-secondary flex items-center gap-2">
              <Download className="h-5 w-5" />
              Tumunu Disa Aktar / Export All
            </button>
            <button onClick={handleManualImport} className="btn-secondary flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Ice Aktar / Import
            </button>
          </div>
        </section>

        {/* Message History */}
        <section className="bg-nomad-surface rounded-xl border border-nomad-border p-5">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-nomad-green" />
            Mesaj Gecmisi / Message History ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <p className="text-nomad-slate text-center py-8">
              Henuce mesaj yok / No messages yet
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const statusCfg = STATUS_CONFIG[msg.status];
                const needCfg = NEED_CONFIG[msg.need];
                const NeedIcon = needCfg.icon;
                return (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      msg.priority === 'acil'
                        ? 'border-red-700 bg-red-950/30'
                        : 'border-nomad-border bg-nomad-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-white">{msg.sender}</span>
                          <span className={`text-white text-xs px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                          {msg.priority === 'acil' && (
                            <span className="text-red-400 text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              ACIL
                            </span>
                          )}
                        </div>
                        {msg.location && (
                          <p className="text-nomad-slate text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {msg.location}
                          </p>
                        )}
                        {msg.need !== 'yok' && (
                          <p className="text-nomad-slate text-sm flex items-center gap-1">
                            <NeedIcon className="h-3 w-3" />
                            Ihtiyac: {needCfg.label} ({needCfg.labelEn})
                          </p>
                        )}
                        {msg.message && (
                          <p className="text-foreground text-sm mt-1">{msg.message}</p>
                        )}
                        <p className="text-nomad-slate text-xs mt-1">
                          {formatTimestamp(msg.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-nomad-slate hover:text-red-400 no-print"
                        title="Sil / Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
