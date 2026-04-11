import { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { apiGet, apiPost } from '../lib/api';
import { debounce } from '../lib/utils';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  institution?: string;
  category?: string;
  trust_level: string;
  storage_mode: string;
  rights_status: string;
  child_safe: boolean;
  summary?: string;
  created_at: string;
  highlight?: string;
  score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  query: string;
  filters_applied: Record<string, unknown>;
}

interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  official_only?: boolean;
  child_safe?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
}

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const debouncedSetQuery = useMemo(
    () =>
      debounce(((v: string) => {
        setDebouncedQuery(v);
        setPage(1);
      }) as (...args: unknown[]) => unknown, 400),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  useEffect(() => {
    setQuery(initialQuery);
    setDebouncedQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  const body: SearchRequest = {
    query: debouncedQuery,
    page,
    page_size: 20,
    official_only: officialOnly,
    sort_by: sortBy,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };

  const requestKey = debouncedQuery.length >= 2
    ? ['/search', debouncedQuery, page, officialOnly, sortBy, JSON.stringify(filters)]
    : null;

  const { data, error, isLoading, mutate } = useSWR<SearchResponse>(
    requestKey,
    () => apiPost<SearchResponse>('/search/', body),
    { revalidateOnFocus: false }
  );

  return {
    query,
    setQuery,
    page,
    setPage,
    officialOnly,
    setOfficialOnly,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    results: data?.results ?? [],
    total: data?.total ?? 0,
    totalPages: data?.total_pages ?? 1,
    error,
    isLoading,
    mutate,
  };
}

export function useSearchSuggestions(query: string) {
  const { data } = useSWR<string[]>(
    query.length >= 2 ? `/search/suggestions?q=${encodeURIComponent(query)}&limit=10` : null,
    (p: string) => apiGet<string[]>(p),
    { revalidateOnFocus: false }
  );

  return { suggestions: data ?? [] };
}

export function useSearchFacets(params: { category?: string; province?: string; query?: string; official_only?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.province) qs.set('province', params.province);
  if (params.query) qs.set('query', params.query);
  if (params.official_only) qs.set('official_only', 'true');

  const { data } = useSWR<Record<string, Record<string, number>>>(
    `/search/facets?${qs.toString()}`,
    (p: string) => apiGet<Record<string, Record<string, number>>>(p),
    { revalidateOnFocus: false }
  );

  return { facets: data };
}
