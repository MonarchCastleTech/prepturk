'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch, useSearchFacets } from '../../hooks/useSearch';
import SearchBar from '../../components/SearchBar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import TrustBadge from '../../components/TrustBadge';
import { formatTurkishDate } from '../../lib/turkish';
import { cn } from '../../lib/utils';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const {
    query,
    setQuery,
    page,
    setPage,
    officialOnly,
    setOfficialOnly,
    sortBy,
    setSortBy,
    results,
    total,
    totalPages,
    isLoading,
    setFilters,
    filters,
  } = useSearch(initialQuery);

  const { facets } = useSearchFacets({ query, official_only: officialOnly });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query !== initialQuery && query.trim()) {
      router.replace(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [initialQuery, query, router]);

  const handleFilterToggle = (field: string, value: string) => {
    const current = (filters as Record<string, string[]>)[field] || [];
    const updated = current.includes(value)
      ? current.filter((entry: string) => entry !== value)
      : [...current, value];
    setFilters({ ...filters, [field]: updated });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters as Record<string, string[]>).reduce(
    (count, values) => count + values.length,
    0
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <FileSearch className="h-3.5 w-3.5 text-sky-300" />
              Komuta aramasi
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Sorgu Durumu</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Yerel indeks, guven filtresi ve sorgu sinyalleri ayni komuta yuzeyinde toplanir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={officialOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOfficialOnly(!officialOnly)}
            >
              <ShieldCheck className="mr-1 h-4 w-4" />
              Sadece Resmi Kaynaklar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Filtreleri {showFilters ? 'gizle' : 'goster'}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sorgu ozeti</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {query ? `"${query}" icin ${total} eslesme hazir` : `${total} eslesme hazir`}
            </p>
            <p className="mt-2 text-sm text-slate-300">Sonuclar guven ve icerik sinyaline gore siralanir</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Yerel indeks</p>
            <p className="mt-3 text-xl font-semibold text-white">Anlik</p>
            <p className="mt-2 text-sm text-sky-100/80">Sorgular baglanti olmadan cihaz ici veri uzerinde yurur</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Filtre yuku</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {activeFilterCount > 0 ? `${activeFilterCount} aktif` : 'Temiz'}
            </p>
            <p className="mt-2 text-sm text-slate-300">Kategori, kurum ve guven esikleri ayni anda uygulanir</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
        <aside className={cn('space-y-4', showFilters ? 'block' : 'hidden xl:block')}>
          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,27,34,0.94),rgba(12,17,22,0.94))] p-5 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Database className="h-4 w-4 text-sky-300" />
              Filtre Raflari
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Sonuc alanini daraltip en guvenilir belge ve kurum kayitlarina hizli erisim saglayin.
            </p>
          </div>

          {facets?.categories && Object.keys(facets.categories).length > 0 && (
            <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,30,0.95),rgba(12,17,21,0.95))] p-5 shadow-panel">
              <h2 className="text-sm font-semibold text-white">Kategori</h2>
              <div className="mt-4 space-y-1.5">
                {Object.entries(facets.categories).map(([category, count]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleFilterToggle('category', category)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
                      (filters as Record<string, string[]>)?.category?.includes(category)
                        ? 'bg-nomad-green/15 text-emerald-200'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    )}
                  >
                    <span>{category}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {facets?.trust_levels && Object.keys(facets.trust_levels).length > 0 && (
            <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,30,0.95),rgba(12,17,21,0.95))] p-5 shadow-panel">
              <h2 className="text-sm font-semibold text-white">Guven seviyesi</h2>
              <div className="mt-4 space-y-1.5">
                {Object.entries(facets.trust_levels).map(([level, count]) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleFilterToggle('trust_level', level)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm capitalize transition-colors',
                      (filters as Record<string, string[]>)?.trust_level?.includes(level)
                        ? 'bg-nomad-green/15 text-emerald-200'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    )}
                  >
                    <span>{level}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {facets?.institutions && Object.keys(facets.institutions).length > 0 && (
            <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,30,0.95),rgba(12,17,21,0.95))] p-5 shadow-panel">
              <h2 className="text-sm font-semibold text-white">Kurum</h2>
              <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {Object.entries(facets.institutions).map(([institution, count]) => (
                  <button
                    key={institution}
                    type="button"
                    onClick={() => handleFilterToggle('institution', institution)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
                      (filters as Record<string, string[]>)?.institution?.includes(institution)
                        ? 'bg-nomad-green/15 text-emerald-200'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    )}
                  >
                    <span className="truncate">{institution}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <SearchBar
                initialValue={query}
                placeholder="AFAD plani, TAMP, okul takvimi, ilac prospektusu ara"
                className="w-full lg:max-w-2xl"
              />

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 appearance-none rounded-xl border border-white/10 bg-black/15 pl-3 pr-8 text-sm text-white"
                >
                  <option value="relevance">Ilgi</option>
                  <option value="newest">En Yeni</option>
                  <option value="officiality">Resmilik</option>
                </select>
                <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl border border-white/8 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-6 py-16 text-center">
                <Search className="mx-auto h-12 w-12 text-slate-500" />
                <h2 className="mt-4 text-xl font-semibold text-white">Sonuc bulunamadi</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Sorguyu degistirin veya filtreleri temizleyip yerel indeksi yeniden tarayin.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Sonuc Akisi</h2>
                    <p className="text-sm text-slate-300">
                      {query ? `"${query}" icin ${total} eslesme hazir` : `${total} eslesme hazir`}
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-black/15 px-3 py-1.5 text-xs text-slate-300 sm:inline-flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                    {officialOnly ? 'Resmi kaynak filtresi acik' : 'Tum guven katmanlari acik'}
                  </div>
                </div>

                <div className="space-y-3">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/documents/${result.id}`}
                      className="block rounded-2xl border border-white/8 bg-black/15 p-4 transition-colors hover:border-emerald-500/30 hover:bg-black/25"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-white">{result.title}</h3>
                          {result.subtitle && <p className="mt-1 text-sm text-slate-300">{result.subtitle}</p>}
                        </div>
                        <TrustBadge level={result.trust_level} />
                      </div>

                      {result.highlight && (
                        <div
                          className="mt-3 text-sm text-slate-300"
                          dangerouslySetInnerHTML={{ __html: result.highlight }}
                        />
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        {result.category && <span>{result.category}</span>}
                        {result.institution && <span>{result.institution}</span>}
                        <span>{formatTurkishDate(result.created_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-300">
                      Sayfa {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-xs text-slate-400">
            Turkce karakterler arama sirasinda normalize edilir. Yazim farklari ayni yerel indeks
            akisi icinde birlikte degerlendirilir.
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400">Yukleniyor...</div>}>
      <SearchContent />
    </Suspense>
  );
}
