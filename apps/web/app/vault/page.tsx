'use client';

import { useRef, useState } from 'react';
import useSWR from 'swr';
import { apiGet, API_URL } from '../../lib/api';
import { formatFileSize, formatTurkishDate } from '../../lib/turkish';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Download,
  FileText,
  Lock,
  Search,
  Share2,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface VaultFile {
  id: string;
  original_name: string;
  file_size_bytes: number;
  sha256: string;
  encryption_algorithm: string;
  mime_type: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function VaultPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, mutate } = useSWR<VaultFile[]>(
    '/vault/',
    (p: string) => apiGet<VaultFile[]>(p),
    { revalidateOnFocus: false }
  );

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    try {
      await fetch(`${API_URL}/vault/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      mutate();
      setTags([]);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/vault/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    mutate();
  };

  const handleDownload = (id: string) => {
    window.open(`${API_URL}/vault/${id}/download`, '_blank');
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const filteredFiles = (files || []).filter((f) => {
    if (searchQuery && !f.original_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (tagFilter && !f.tags.includes(tagFilter)) return false;
    return true;
  });

  const allTags = Array.from(new Set((files || []).flatMap((f) => f.tags)));

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
          <div>
            <p className="shell-kicker">Secure storage</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              <Lock className="h-7 w-7 text-emerald-300" />
              Kişisel Kasa
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              AES-256-GCM ile korunan yerel belge alanı. Dosyalar cihaz üzerinde şifreli tutulur.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Şifreleme Durumu</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">Aktif: AES-256-GCM, yerel depolama, bağımsız erişim.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[23rem_minmax(0,1fr)]">
        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Dosya Yükleme</h2>
            <Button variant="outline" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              Tümünü Dışa Aktar
            </Button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`mt-5 rounded-[1.4rem] border-2 border-dashed px-5 py-8 text-center transition-colors ${
              dragActive
                ? 'border-emerald-400/40 bg-emerald-400/10'
                : 'border-white/10 bg-black/15'
            }`}
          >
            <Upload className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm text-slate-300">Dosyayı sürükleyip bırakın veya seçerek yükleyin.</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mt-4 flex items-center justify-center">
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                Dosya Seç
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 text-xs">
                    {t}
                    <button type="button" onClick={() => removeTag(t)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Etiket ekle..."
                className="w-44 h-9 text-sm"
              />
              <Button variant="ghost" size="sm" onClick={addTag}>
                Etiket Ekle
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Kasa Akışı</h2>
            <div className="hidden rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:inline-flex">
              Yerel depolama
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Dosya ara..."
                className="pl-10 h-10"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                <Tag className="h-4 w-4 text-slate-400" />
                <div className="flex gap-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                      className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                        tagFilter === tag
                          ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                          : 'border border-white/8 bg-white/[0.03] text-slate-300 hover:border-emerald-400/25'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {filteredFiles.length === 0 ? (
            <div className="mt-5 rounded-[1.4rem] border border-dashed border-white/10 bg-black/15 px-6 py-14 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-4 text-base font-semibold text-white">Kasada henüz dosya yok</p>
              <p className="mt-2 text-sm text-slate-300">Dosya yüklediğinizde yerel olarak şifrelenip burada listelenir.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredFiles.map((file) => (
                <article
                  key={file.id}
                  className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{file.original_name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{formatFileSize(file.file_size_bytes)}</span>
                        <span>{formatTurkishDate(file.created_at)}</span>
                        <span className="font-mono text-[10px]">{file.sha256.slice(0, 12)}...</span>
                      </div>
                      {file.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {file.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(file.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
