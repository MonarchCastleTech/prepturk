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
  ArrowLeft,
  X
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
      </div>

      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <FileSearch className="h-3.5 w-3.5 text-emerald-300" />
              Komuta Araması
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Yerel İndeks Sorgulama</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Cihazınızdaki tüm resmî belgeler, notlar ve arşivler üzerinde anlık semantik arama yapın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={officialOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOfficialOnly(!officialOnly)}
              className={cn("rounded-xl border-white/10 h-10", officialOnly && "bg-emerald-600 hover:bg-emerald-500")}
            >
              <ShieldCheck className="mr-1 h-4 w-4" />
              Resmî Kaynaklar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="rounded-xl border-white/10 h-10">
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Filtreler {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
        <aside className={cn('space-y-4', showFilters ? 'block' : 'hidden xl:block')}>
          <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              <Database className="h-3.5 w-3.5" />
              Kategoriler
            </div>
            <div className="space-y-1">
              {facets?.categories && Object.entries(facets.categories).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => handleFilterToggle('category', cat)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all',
                    (filters as any)?.category?.includes(cat)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:bg-white/5 border border-transparent'
                  )}
                >
                  <span className="truncate">{cat}</span>
                  <span className="text-[10px] opacity-50">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Güven Seviyesi
            </div>
            <div className="space-y-1">
              {facets?.trust_levels && Object.entries(facets.trust_levels).map(([level, count]) => (
                <button
                  key={level}
                  onClick={() => handleFilterToggle('trust_level', level)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs capitalize transition-all',
                    (filters as any)?.trust_level?.includes(level)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:bg-white/5 border border-transparent'
                  )}
                >
                  <span>{level === 'official' ? 'Resmî' : level}</span>
                  <span className="text-[10px] opacity-50">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <SearchBar
                initialValue={query}
                placeholder="Arama terimini yazın..."
                className="w-full lg:max-w-2xl"
              />

              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Sırala:</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="relevance">İlgi Düzeyi</option>
                  <option value="newest">En Yeni</option>
                  <option value="officiality">Resmîyet</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] p-5 shadow-panel min-h-[400px]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.02] border border-white/5" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                  <Search className="h-10 w-10 text-slate-600" />
                </div>
                <h3 className="text-white font-medium">Sonuç Bulunamadı</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Arama terimini değiştirmeyi veya filtreleri temizlemeyi deneyin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{total} Kayıt Listeleniyor</p>
                </div>
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/documents/${result.id}`}
                    className="group block p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{result.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{result.institution}</p>
                      </div>
                      <TrustBadge level={result.trust_level} />
                    </div>
                    {result.highlight && (
                      <div className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: result.highlight }} />
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <Badge variant="secondary" className="text-[9px] bg-black/40 border-none h-5">{result.category}</Badge>
                      <span className="text-[10px] text-slate-600">{formatTurkishDate(result.created_at)}</span>
                    </div>
                  </Link>
                ))}

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-xl border-white/10 h-10 w-10 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-xs font-bold text-slate-500">Sayfa {page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-xl border-white/10 h-10 w-10 p-0"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400">Yükleniyor...</div>}>
      <SearchContent />
    </Suspense>
  );
}
