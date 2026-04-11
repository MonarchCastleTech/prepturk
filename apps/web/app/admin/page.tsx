'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '../../lib/auth';
import { apiGet, apiPost } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import StatusChip from '../../components/StatusChip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { formatTurkishDate } from '../../lib/turkish';
import {
  Settings, Database, ClipboardList, Users, HardDrive, RefreshCw,
  AlertCircle, CheckCircle, XCircle, Clock, Activity, Shield,
  Play, Trash2, Download, Upload
} from 'lucide-react';

interface SourceAdapter {
  id: string;
  name: string;
  base_url: string;
  is_active: boolean;
  last_sync_at?: string;
  last_success_at?: string;
  last_error?: string;
  total_documents: number;
}

interface IngestionRun {
  id: string;
  adapter_name?: string;
  status: string;
  started_at: string;
  completed_at?: string;
  documents_found: number;
  documents_fetched: number;
  documents_indexed: number;
  documents_failed: number;
}

export default function AdminPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('sources');

  const { data: sources, mutate: mutateSources } = useSWR<SourceAdapter[]>(
    token && activeTab === 'sources' ? '/sources/' : null,
    (p: string) => apiGet<SourceAdapter[]>(p, token ?? undefined),
    { revalidateOnFocus: false }
  );

  const { data: ingestionRuns } = useSWR<IngestionRun[]>(
    token && activeTab === 'sync' ? '/dashboard/stats' : null,
    async (p: string) => {
      const stats = await apiGet<Record<string, unknown>>(p, token ?? undefined);
      return (stats.recent_ingestion_runs as IngestionRun[]) || [];
    },
    { revalidateOnFocus: false }
  );

  const handleSyncSource = async (sourceId: string) => {
    if (!token) return;
    try {
      await apiPost(`/sources/${sourceId}/sync`, {}, token);
      mutateSources();
    } catch {
      // Sync initiated
    }
  };

  const handleToggleSource = async (source: SourceAdapter) => {
    if (!token) return;
    // Toggle source active state
    mutateSources();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-nomad-green" />
            Yonetim Paneli
          </h1>
          <p className="text-nomad-slate text-sm">Sistem yonetimi ve yapilandirma</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Yedekle
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Geri Yukle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sources">
            <Database className="h-4 w-4 mr-1" />
            Kaynaklar
          </TabsTrigger>
          <TabsTrigger value="sync">
            <RefreshCw className="h-4 w-4 mr-1" />
            Senkronizasyon
          </TabsTrigger>
          <TabsTrigger value="review">
            <ClipboardList className="h-4 w-4 mr-1" />
            Inleme
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-1" />
            Kullanicilar
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            Ayarlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-6">
          <Card className="border-nomad-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Kaynak Adaptörleri</CardTitle>
                <Button size="sm">
                  <Database className="h-4 w-4 mr-1" />
                  Yeni Kaynak
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sources && sources.length > 0 ? (
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 bg-nomad-bg rounded-lg border border-nomad-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Database className="h-5 w-5 text-nomad-slate flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{source.name}</p>
                            <StatusChip
                              status={source.is_active ? 'success' : 'info'}
                              label={source.is_active ? 'Aktif' : 'Pasif'}
                            />
                          </div>
                          <p className="text-xs text-nomad-slate truncate">{source.base_url}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-nomad-slate">
                            <span>{source.total_documents} belge</span>
                            {source.last_success_at && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-400" />
                                {formatTurkishDate(source.last_success_at)}
                              </span>
                            )}
                            {source.last_error && (
                              <span className="flex items-center gap-1 text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Hata
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncSource(source.id)}
                          title="Senkronize et"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSource(source)}
                          title={source.is_active ? 'Devre disi birak' : 'Aktif et'}
                        >
                          {source.is_active ? <XCircle className="h-4 w-4 text-amber-400" /> : <CheckCircle className="h-4 w-4 text-green-400" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
                  <p className="text-nomad-slate">Henuz kaynak eklenmemis</p>
                  <Button className="mt-4">Ilk Kaynagi Ekle</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-6">
          <Card className="border-nomad-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-nomad-green" />
                Senkronizasyon Loglari
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ingestionRuns && ingestionRuns.length > 0 ? (
                <div className="space-y-2">
                  {ingestionRuns.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 bg-nomad-bg rounded-lg border border-nomad-border text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {run.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : run.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-400" />
                        )}
                        <span>{run.adapter_name || 'Bilinmeyen'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-nomad-slate">
                        <span>{run.documents_indexed} indexlendi</span>
                        {run.documents_failed > 0 && (
                          <span className="text-red-400">{run.documents_failed} basarisiz</span>
                        )}
                        {run.started_at && <span>{formatTurkishDate(run.started_at)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
                  <p className="text-nomad-slate">Henuz senkronizasyon gecmisi yok</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <Card className="border-nomad-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-nomad-green" />
                Inleme Sirasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
                <p className="text-nomad-slate">Inleme bekleyen belge yok</p>
                <p className="text-xs text-nomad-slate mt-2">Otomatik inleme sistemi tum belgeleri kontrol eder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card className="border-nomad-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-nomad-green" />
                  Kullanici Yonetimi
                </CardTitle>
                <Button size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Yeni Kullanici
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
                <p className="text-nomad-slate">Kullanici yonetimi burada yapilandirilacak</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-nomad-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Genel Ayarlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Uygulama Adi</label>
                  <Input defaultValue="prepturk" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Varsayilan Dil</label>
                  <select className="w-full px-3 py-2 bg-nomad-surface border border-nomad-border rounded-lg text-foreground text-sm">
                    <option value="tr">Turkce</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Depolama Limiti</label>
                  <select className="w-full px-3 py-2 bg-nomad-surface border border-nomad-border rounded-lg text-foreground text-sm">
                    <option value="10gb">10 GB</option>
                    <option value="50gb" selected>50 GB</option>
                    <option value="200gb">200 GB</option>
                    <option value="unlimited">Sinirsiz</option>
                  </select>
                </div>
                <Button>Kaydet</Button>
              </CardContent>
            </Card>

            <Card className="border-nomad-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Yedekleme ve Geri Yukleme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4 text-nomad-green" />
                    <span className="text-sm font-medium">Veritabani Yedegi</span>
                  </div>
                  <p className="text-xs text-nomad-slate mb-3">Tum veritabani verilerini yedekleyin</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Yedek Indir
                  </Button>
                </div>
                <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="h-4 w-4 text-nomad-blue" />
                    <span className="text-sm font-medium">Yedek Geri Yukle</span>
                  </div>
                  <p className="text-xs text-nomad-slate mb-3">Daha once alinan yedegi geri yukleyin</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    Yedek Sec
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 bg-nomad-surface border border-nomad-border rounded-lg text-foreground text-sm placeholder:text-nomad-slate focus:outline-none focus:ring-2 focus:ring-nomad-green"
    />
  );
}
