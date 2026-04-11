'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Phone, MapPin, FileText, X, Shield } from 'lucide-react';
import { useUiStore } from '../lib/stores';
import { cn } from '../lib/utils';

const emergencyItems = [
  { id: 'afet', label: 'Afet Durumları', icon: AlertTriangle, href: '/search?q=afet+acil+durum', color: 'text-red-400 hover:bg-red-900/20' },
  { id: 'saglik', label: 'Sağlık Rehberi', icon: Shield, href: '/search?q=saglik+acil+tibbi', color: 'text-green-400 hover:bg-green-900/20' },
  { id: 'iletisim', label: 'Acil İletişim', icon: Phone, href: '/notes?emergency=true', color: 'text-blue-400 hover:bg-blue-900/20' },
  { id: 'harita', label: 'Yakın Acil Noktaları', icon: MapPin, href: '/maps', color: 'text-amber-400 hover:bg-amber-900/20' },
  { id: 'belgeler', label: 'Acil Belgeler', icon: FileText, href: '/search?q=acil+onemli', color: 'text-purple-400 hover:bg-purple-900/20' },
];

export default function EmergencyPanel() {
  const { emergencyPanelOpen, setEmergencyPanelOpen } = useUiStore();
  const router = useRouter();

  if (!emergencyPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={() => setEmergencyPanelOpen(false)} />
      <div className={cn(
        'relative z-50 w-full max-w-lg bg-nomad-surface border-2 border-red-800/50 rounded-xl shadow-2xl p-6'
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-red-400">Acil Durum Erişimi</h2>
          </div>
          <button onClick={() => setEmergencyPanelOpen(false)} className="p-1 hover:bg-nomad-border rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {emergencyItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                router.push(item.href);
                setEmergencyPanelOpen(false);
              }}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border border-nomad-border transition-colors text-left',
                item.color
              )}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
          <p className="text-xs text-red-300 text-center">
            Bu panelde acil durum belgelerinize ve kaynaklarına hızlıca erişebilirsiniz.
            Tüm içerikler ağ bağlantısından bağımsız çalışır.
          </p>
        </div>
      </div>
    </div>
  );
}
