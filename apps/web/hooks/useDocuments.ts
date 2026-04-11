import useSWR from 'swr';
import { apiGet } from '../lib/api';

export interface Document {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  language: string;
  province?: string;
  category?: string;
  subcategory?: string;
  topic_tags: string[];
  institution?: string;
  trust_level: string;
  storage_mode: string;
  rights_status: string;
  rights_note?: string;
  source_url?: string;
  source_domain?: string;
  mime_type?: string;
  file_size_bytes?: number;
  published_at?: string;
  acquired_at?: string;
  emergency_relevance?: string;
  medical_risk_level?: string;
  child_safe: boolean;
  summary?: string;
  citation_hint?: string;
  review_status?: string;
  pinned: boolean;
  created_at: string;
  abstract?: string;
  author?: string;
  publisher?: string;
  version_label?: string;
  issue_number?: string;
  cross_references: string[];
  related_documents: string[];
  extracted_text_path?: string;
  original_file_path?: string;
}

interface ListParams {
  page?: number;
  page_size?: number;
  category?: string;
  province?: string;
  institution?: string;
  trust_level?: string;
  search?: string;
}

export function useDocuments(params: ListParams = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.page_size) qs.set('page_size', String(params.page_size));
  if (params.category) qs.set('category', params.category);
  if (params.province) qs.set('province', params.province);
  if (params.institution) qs.set('institution', params.institution);
  if (params.trust_level) qs.set('trust_level', params.trust_level);
  if (params.search) qs.set('search', params.search);

  const path = `/documents/?${qs.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<Document[]>(
    path,
    (p: string) => apiGet<Document[]>(p),
    { revalidateOnFocus: false }
  );

  return { documents: data || [], error, isLoading, mutate };
}

export function useDocument(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Document>(
    id ? `/documents/${id}` : null,
    (p: string) => apiGet<Document>(p),
    { revalidateOnFocus: false }
  );

  return { document: data, error, isLoading, mutate };
}

export function useDocumentCount(params: ListParams = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.province) qs.set('province', params.province);
  if (params.institution) qs.set('institution', params.institution);
  if (params.trust_level) qs.set('trust_level', params.trust_level);
  if (params.search) qs.set('search', params.search);

  const path = `/documents/total-count?${qs.toString()}`;

  const { data } = useSWR<{ total: number }>(
    path,
    (p: string) => apiGet<{ total: number }>(p),
    { revalidateOnFocus: false }
  );

  return { total: data?.total ?? 0 };
}
