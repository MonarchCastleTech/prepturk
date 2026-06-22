'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { useDocument } from '../../../hooks/useDocuments';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import TrustBadge from '../../../components/TrustBadge';
import StatusChip from '../../../components/StatusChip';
import {
  formatTurkishDate,
  formatFileSize,
  RIGHTS_LABELS,
  STORAGE_MODE_LABELS,
} from '../../../lib/turkish';
import {
  ArrowLeft, FileText, Calendar, Building2, MapPin, Download, ExternalLink,
  Tag, Globe, HardDrive, User, Clock, Copy, Share2, Check, ShieldCheck,
} from 'lucide-react';

const PANEL_HERO =
  'rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6';
const PANEL =
  'rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { document: doc, isLoading } = useDocument(id);
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* clipboard unavailable in this context */
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-56 animate-pulse rounded-full bg-white/5" />
        <div className="h-40 animate-pulse rounded-[1.8rem] border border-white/8 bg-white/[0.03]" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-[1.75rem] border border-white/8 bg-white/[0.03] lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-[1.75rem] border border-white/8 bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="space-y-6">
        <Link href="/documents" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Belgelere Dön
        </Link>
        <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-black/15 px-6 py-20 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-xl font-semibold text-white">Belge Bulunamadı</h2>
          <p className="mt-2 text-sm text-slate-300">
            Aradığınız kayıt yerel arşivde yok ya da kaldırılmış olabilir.
          </p>
          <Link href="/documents">
            <Button variant="outline" className="mt-6 rounded-xl border-white/10">Belge Arşivine Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const citationText =
    doc.citation_hint ||
    `${doc.title}${doc.institution ? `. ${doc.institution}` : ''}. Erişim tarihi: ${formatTurkishDate(doc.created_at)}.`;

  const shareLink = typeof window !== 'undefined' ? window.location.href : `/documents/${doc.id}`;

  return (
    <div className="space-y-6">
      <Link href="/documents" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Belge Arşivine Dön
      </Link>

      <section className={PANEL_HERO}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <FileText className="h-3.5 w-3.5 text-emerald-300" />
              {doc.category || 'Belge Kaydı'}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{doc.title}</h1>
            {doc.subtitle && <p className="mt-2 text-sm leading-6 text-slate-300">{doc.subtitle}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TrustBadge level={doc.trust_level} />
              <Badge variant={doc.rights_status === 'public-download' ? 'default' : 'outline'} className="text-xs">
                {RIGHTS_LABELS[doc.rights_status] ?? doc.rights_status}
              </Badge>
              {doc.child_safe && <StatusChip status="success" label="Çocuğa Güvenli" />}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
            {doc.source_url ? (
              <a href={doc.source_url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-xl bg-nomad-green text-white hover:bg-nomad-green/90">
                  <Download className="mr-2 h-4 w-4" />
                  Kaynağı Aç
                </Button>
              </a>
            ) : (
              <Button variant="outline" disabled className="w-full rounded-xl border-white/10 opacity-60">
                <Download className="mr-2 h-4 w-4" />
                Yerel Kayıt
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => copyToClipboard('share', shareLink)}
              className="w-full rounded-xl border-white/10"
            >
              {copied === 'share' ? <Check className="mr-2 h-4 w-4 text-emerald-300" /> : <Share2 className="mr-2 h-4 w-4" />}
              {copied === 'share' ? 'Kopyalandı' : 'Bağlantıyı Kopyala'}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className={PANEL}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap gap-1 bg-black/20">
                <TabsTrigger value="preview">Önizleme</TabsTrigger>
                <TabsTrigger value="text">Çıkarılan Metin</TabsTrigger>
                <TabsTrigger value="citations">Atıflar</TabsTrigger>
                <TabsTrigger value="related">İlgili Belgeler</TabsTrigger>
                <TabsTrigger value="ai">Yapay Zekâ Özeti</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <div className="mt-4 flex min-h-[360px] items-center justify-center rounded-2xl border border-white/8 bg-black/20 p-8">
                  <div className="text-center">
                    <div className="mx-auto inline-flex rounded-2xl bg-emerald-500/10 p-4">
                      <FileText className="h-12 w-12 text-emerald-300" />
                    </div>
                    <p className="mt-4 text-sm text-slate-300">Belge önizlemesi yerel depodan yükleniyor.</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Depolama modu: {STORAGE_MODE_LABELS[doc.storage_mode] ?? doc.storage_mode}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text">
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-6">
                  {doc.extracted_text_path ? (
                    <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-300">
                      Metin içeriği yerel depodan akışa alınıyor…
                    </pre>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-400">Bu kayıt için çıkarılmış metin bulunmuyor.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="citations">
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">Atıf Bilgisi</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('cite', citationText)}
                      className="rounded-xl border-white/10"
                    >
                      {copied === 'cite' ? <Check className="mr-1 h-4 w-4 text-emerald-300" /> : <Copy className="mr-1 h-4 w-4" />}
                      {copied === 'cite' ? 'Kopyalandı' : 'Atıfı Kopyala'}
                    </Button>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-nomad-bg/60 p-4 text-sm leading-6 text-slate-300">
                    {citationText}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="related">
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-6">
                  {doc.related_documents && doc.related_documents.length > 0 ? (
                    <ul className="space-y-2">
                      {doc.related_documents.map((rid) => (
                        <li key={rid}>
                          <Link
                            href={`/documents/${rid}`}
                            className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-emerald-400/30 hover:text-white"
                          >
                            <FileText className="h-4 w-4 text-emerald-300" />
                            İlgili belge {rid.slice(0, 8)}…
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-400">İlgili belge bulunamadı.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ai">
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <StatusChip status="info" label="Yapay Zekâ Tarafından Oluşturulur" />
                  </div>
                  {doc.summary ? (
                    <p className="text-sm leading-7 text-slate-300">{doc.summary}</p>
                  ) : (
                    <p className="text-sm leading-7 text-slate-400">
                      Bu belge için yapay zekâ özeti henüz oluşturulmadı. Özet üretmek için{' '}
                      <Link href="/ai-chat" className="text-emerald-300 hover:underline">Yapay Zekâ Asistanı</Link>
                      &apos;nı kullanabilirsiniz.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          <div className={PANEL}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Meta Veriler
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {doc.category && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Kategori:</span>
                  <span className="text-slate-200">{doc.category}</span>
                </div>
              )}
              {doc.institution && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Kurum:</span>
                  <span className="text-slate-200">{doc.institution}</span>
                </div>
              )}
              {doc.province && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">İl:</span>
                  <span className="text-slate-200">{doc.province}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-slate-400">Tarih:</span>
                <span className="text-slate-200">{formatTurkishDate(doc.created_at)}</span>
              </div>
              {doc.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Yazar:</span>
                  <span className="text-slate-200">{doc.author}</span>
                </div>
              )}
              {doc.source_url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Kaynak:</span>
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-300 hover:underline"
                  >
                    Harici Bağlantı <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {doc.file_size_bytes && doc.file_size_bytes > 0 && (
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Boyut:</span>
                  <span className="text-slate-200">{formatFileSize(doc.file_size_bytes)}</span>
                </div>
              )}
              {doc.version_label && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Sürüm:</span>
                  <span className="text-slate-200">{doc.version_label}</span>
                </div>
              )}
            </dl>
          </div>

          {doc.topic_tags && doc.topic_tags.length > 0 && (
            <div className={PANEL}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Tag className="h-4 w-4 text-emerald-300" />
                Etiketler
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {doc.topic_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
