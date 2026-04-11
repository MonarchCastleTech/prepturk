'use client';

import { useState } from 'react';
import { useDocuments, useDocumentCount } from '../../hooks/useDocuments';
import { useDocFilterStore } from '../../lib/stores';
import { cn } from '../../lib/utils';
import DocumentCard from '../../components/DocumentCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import SearchBar from '../../components/SearchBar';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Grid3X3,
  List,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export default function DocumentsPage() {
  const filterStore = useDocFilterStore();
  const [showFilters, setShowFilters] = useState(false);

  const { documents, isLoading } = useDocuments({
    page: filterStore.page,
    page_size: 12,
    category: filterStore.category ?? undefined,
    province: filterStore.province ?? undefined,
    institution: filterStore.institution ?? undefined,
    trust_level: filterStore.trustLevel ?? undefined,
    search: filterStore.search || undefined,
  });

  const { total } = useDocumentCount({
    category: filterStore.category ?? undefined,
    province: filterStore.province ?? undefined,
    institution: filterStore.institution ?? undefined,
    trust_level: filterStore.trustLevel ?? undefined,
    search: filterStore.search || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / 12));
  const hasActiveFilters = Boolean(
    filterStore.category || filterStore.province || filterStore.institution || filterStore.trustLevel
  );
  const activeFilterCount = [
    filterStore.category,
    filterStore.province,
    filterStore.institution,
    filterStore.trustLevel,
  ].filter(Boolean).length;

  const categories = ['Mevzuat', 'Yonetmelik', 'Genelge', 'Teblig', 'Kilavuz', 'Rapor', 'Egitim', 'Arastirma'];
  const trustLevels = ['official', 'institutional', 'community', 'personal'];

  const clearFilter = (key: string) => {
    switch (key) {
      case 'category':
        filterStore.setCategory(null);
        break;
      case 'province':
        filterStore.setProvince(null);
        break;
      case 'institution':
        filterStore.setInstitution(null);
        break;
      case 'trustLevel':
        filterStore.setTrustLevel(null);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <FileText className="h-3.5 w-3.5 text-emerald-300" />
              Belge workspace
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Arsiv Durumu</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Yerel belge akisi, guven onceligi ve gorunum denetimleri ayni blokta tutulur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-1 h-4 w-4" />
              Filtreleri {showFilters ? 'gizle' : 'goster'}
            </Button>
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/15">
              <button
                type="button"
                onClick={() => filterStore.setViewMode('grid')}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center transition-colors',
                  filterStore.viewMode === 'grid'
                    ? 'bg-nomad-green text-white'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                )}
                aria-label="Izgara gorunumu"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => filterStore.setViewMode('list')}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center transition-colors',
                  filterStore.viewMode === 'list'
                    ? 'bg-nomad-green text-white'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                )}
                aria-label="Liste gorunumu"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Arsiv hacmi</p>
            <p className="mt-3 text-3xl font-semibold text-white">{total}</p>
            <p className="mt-2 text-sm text-slate-300">Tarama icin hazir kayit sayisi</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Resmi kaynak onceligi</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {filterStore.trustLevel === 'official' ? 'Kilitle' : 'Acik'}
            </p>
            <p className="mt-2 text-sm text-emerald-100/80">Kurum guven sirasi calisma yuzeyinde korunur</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filtre durumu</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {activeFilterCount > 0 ? `${activeFilterCount} aktif` : 'Temiz'}
            </p>
            <p className="mt-2 text-sm text-slate-300">Il, kurum ve guven filtresi ayni akista calisir</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
        <aside className={cn('space-y-4', showFilters ? 'block' : 'hidden xl:block')}>
          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,27,34,0.94),rgba(12,17,22,0.94))] p-5 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <SlidersHorizontal className="h-4 w-4 text-emerald-300" />
              Filtre Raflari
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Kategori ve guven seviyesi ile yerel koleksiyonu hizla daraltin.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,30,0.95),rgba(12,17,21,0.95))] p-5 shadow-panel">
            <h2 className="text-sm font-semibold text-white">Kategori</h2>
            <div className="mt-4 space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => filterStore.setCategory(filterStore.category === cat ? null : cat)}
                  className={cn(
                    'w-full rounded-xl px-3 py-2 text-left text-sm transition-colors',
                    filterStore.category === cat
                      ? 'bg-nomad-green/15 text-emerald-200'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,30,0.95),rgba(12,17,21,0.95))] p-5 shadow-panel">
            <h2 className="text-sm font-semibold text-white">Guven seviyesi</h2>
            <div className="mt-4 space-y-1.5">
              {trustLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => filterStore.setTrustLevel(filterStore.trustLevel === level ? null : level)}
                  className={cn(
                    'w-full rounded-xl px-3 py-2 text-left text-sm capitalize transition-colors',
                    filterStore.trustLevel === level
                      ? 'bg-nomad-green/15 text-emerald-200'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
            <div className="flex flex-col gap-4">
              <SearchBar
                initialValue={filterStore.search}
                placeholder="AFAD plani, yonetmelik, okul rehberi ara"
                className="w-full"
                navigateTo={null}
                onSearch={filterStore.setSearch}
              />

              {hasActiveFilters ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Aktif filtreler</span>
                  {filterStore.category && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      Kategori: {filterStore.category}
                      <button type="button" onClick={() => clearFilter('category')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterStore.province && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      Il: {filterStore.province}
                      <button type="button" onClick={() => clearFilter('province')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterStore.trustLevel && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      Guven: {filterStore.trustLevel}
                      <button type="button" onClick={() => clearFilter('trustLevel')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => filterStore.reset()}
                    className="text-xs font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                  >
                    Tumunu temizle
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  Resmi kaynak onceligi acik, filtreler temiz ve yeni sorgular icin hazir.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-2xl border border-white/8 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-6 py-16 text-center">
                <h2 className="text-xl font-semibold text-white">Belge bulunamadi</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Sorguyu genisletin veya filtreleri temizleyip yerel belge akisina yeniden bakin.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Belge Akisi</h2>
                    <p className="text-sm text-slate-300">Yerel arsivden donen son kayitlar ve guven meta verileri</p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-black/15 px-3 py-1.5 text-xs text-slate-300 sm:inline-flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    Guven sirasi korunuyor
                  </div>
                </div>

                <div
                  className={
                    filterStore.viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3'
                      : 'space-y-3'
                  }
                >
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      subtitle={doc.subtitle}
                      summary={doc.summary}
                      category={doc.category}
                      province={doc.province}
                      institution={doc.institution}
                      trust_level={doc.trust_level}
                      storage_mode={doc.storage_mode}
                      rights_status={doc.rights_status}
                      file_size_bytes={doc.file_size_bytes}
                      created_at={doc.created_at}
                      topic_tags={doc.topic_tags}
                      viewMode={filterStore.viewMode}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => filterStore.setPage(Math.max(1, filterStore.page - 1))}
                      disabled={filterStore.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-300">
                      Sayfa {filterStore.page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => filterStore.setPage(Math.min(totalPages, filterStore.page + 1))}
                      disabled={filterStore.page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
