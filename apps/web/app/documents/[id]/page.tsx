'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useDocument } from '../../../hooks/useDocuments';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import TrustBadge from '../../../components/TrustBadge';
import StatusChip from '../../../components/StatusChip';
import { formatTurkishDate, formatFileSize, RIGHTS_LABELS } from '../../../lib/turkish';
import {
  ArrowLeft, FileText, Calendar, Building2, MapPin, Download, ExternalLink,
  Tag, Globe, HardDrive, User, Clock, Copy, Share2
} from 'lucide-react';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { document: doc, isLoading } = useDocument(id);
  const [activeTab, setActiveTab] = useState('preview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-nomad-surface rounded animate-pulse" />
        <div className="h-64 bg-nomad-surface rounded animate-pulse" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-16">
        <p className="text-nomad-slate">Belge bulunamadi</p>
        <Link href="/documents">
          <Button variant="outline" className="mt-4">Belgelere Don</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/documents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          {doc.subtitle && <p className="text-nomad-slate text-sm mt-1">{doc.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge level={doc.trust_level} />
          <Badge variant={doc.rights_status === 'public-download' ? 'default' : 'outline'}>
            {RIGHTS_LABELS[doc.rights_status] ?? doc.rights_status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="preview">Onizleme</TabsTrigger>
              <TabsTrigger value="text">Cikarilan Metin</TabsTrigger>
              <TabsTrigger value="citations">Alintilar</TabsTrigger>
              <TabsTrigger value="related">Ilgili Belgeler</TabsTrigger>
              <TabsTrigger value="ai">AI Ozeti</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <div className="bg-nomad-surface border border-nomad-border rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-nomad-slate mx-auto mb-4" />
                  <p className="text-nomad-slate">Belge onizleme yukleniyor...</p>
                  <p className="text-xs text-nomad-slate mt-2">Depolama modu: {doc.storage_mode}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text">
              <div className="bg-nomad-surface border border-nomad-border rounded-lg p-6">
                {doc.extracted_text_path ? (
                  <pre className="text-sm whitespace-pre-wrap text-nomad-slate font-mono max-h-[500px] overflow-y-auto">
                    Metin icerigi burada goruntulenecek...
                  </pre>
                ) : (
                  <p className="text-nomad-slate text-center py-8">Cikarilan metin mevcut degil</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="citations">
              <div className="bg-nomad-surface border border-nomad-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Atif Bilgisi</h3>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Atifi Kopyala
                  </Button>
                </div>
                <div className="p-4 bg-nomad-bg rounded border border-nomad-border text-sm text-nomad-slate">
                  {doc.citation_hint || `${doc.title}${doc.institution ? `. ${doc.institution}` : ''}. Erisim tarihi: ${formatTurkishDate(doc.created_at)}.`}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="related">
              <div className="bg-nomad-surface border border-nomad-border rounded-lg p-6">
                {doc.related_documents && doc.related_documents.length > 0 ? (
                  <ul className="space-y-2">
                    {doc.related_documents.map((rid) => (
                      <li key={rid}>
                        <Link href={`/documents/${rid}`} className="text-nomad-green hover:underline text-sm">
                          Ilgili belge {rid.slice(0, 8)}...
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-nomad-slate text-center py-8">Ilgili belge bulunamadi</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <div className="bg-nomad-surface border border-nomad-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <StatusChip status="info" label="AI Tarafindan Olusturuldu" />
                </div>
                <p className="text-sm text-nomad-slate">
                  Bu belge icin AI ozeti henuz olusturulmadi. Ozet olusturmak icin AI Asistan&apos;i kullanin.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="bg-nomad-surface border border-nomad-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Meta Veriler</h3>
            <dl className="space-y-3 text-sm">
              {doc.category && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Kategori:</span>
                  <span>{doc.category}</span>
                </div>
              )}
              {doc.institution && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Kurum:</span>
                  <span>{doc.institution}</span>
                </div>
              )}
              {doc.province && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Il:</span>
                  <span>{doc.province}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-nomad-slate" />
                <span className="text-nomad-slate">Tarih:</span>
                <span>{formatTurkishDate(doc.created_at)}</span>
              </div>
              {doc.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Yazar:</span>
                  <span>{doc.author}</span>
                </div>
              )}
              {doc.source_url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Kaynak:</span>
                  <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-nomad-green hover:underline flex items-center gap-1">
                    Harici Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {doc.file_size_bytes && doc.file_size_bytes > 0 && (
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Boyut:</span>
                  <span>{formatFileSize(doc.file_size_bytes)}</span>
                </div>
              )}
              {doc.version_label && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-nomad-slate" />
                  <span className="text-nomad-slate">Versiyon:</span>
                  <span>{doc.version_label}</span>
                </div>
              )}
            </dl>
          </div>

          {doc.topic_tags && doc.topic_tags.length > 0 && (
            <div className="bg-nomad-surface border border-nomad-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-nomad-slate" />
                Etiketler
              </h3>
              <div className="flex flex-wrap gap-2">
                {doc.topic_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Indir
            </Button>
            <Button variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Paylas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
