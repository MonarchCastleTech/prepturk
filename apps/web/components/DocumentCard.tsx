import Link from 'next/link';
import { Building2, Calendar, FileText, HardDrive, MapPin, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  formatFileSize,
  formatTurkishDate,
  RIGHTS_LABELS,
  STORAGE_MODE_LABELS,
} from '../lib/turkish';
import TrustBadge from './TrustBadge';
import { Badge } from './ui/Badge';

interface DocumentCardProps {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  category?: string;
  province?: string;
  institution?: string;
  trust_level: string;
  storage_mode: string;
  rights_status: string;
  file_size_bytes?: number;
  created_at: string;
  topic_tags?: string[];
  viewMode?: 'grid' | 'list';
  className?: string;
}

export default function DocumentCard({
  id,
  title,
  subtitle,
  summary,
  category,
  province,
  institution,
  trust_level,
  storage_mode,
  rights_status,
  file_size_bytes,
  created_at,
  topic_tags = [],
  viewMode = 'grid',
  className,
}: DocumentCardProps) {
  const isList = viewMode === 'list';
  const normalizedStorageMode = storage_mode.replace(/_/g, '-');
  const storageLabel = STORAGE_MODE_LABELS[storage_mode] ?? STORAGE_MODE_LABELS[normalizedStorageMode] ?? 'Yerel';
  const rightsLabel = RIGHTS_LABELS[rights_status] ?? rights_status;

  return (
    <Link
      href={`/documents/${id}`}
      className={cn(
        'group block overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,25,31,0.96),rgba(13,18,23,0.96))] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/25 hover:shadow-[0_18px_40px_rgba(3,8,14,0.34)]',
        isList ? 'flex' : '',
        className
      )}
    >
      <div className={cn('flex-1 p-5', isList ? '' : 'flex flex-col')}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {category && (
                <Badge variant="secondary" className="px-2.5 py-1 text-[10px] normal-case tracking-[0.12em]">
                  {category}
                </Badge>
              )}
              {institution && (
                <Badge
                  variant="outline"
                  className="gap-1 px-2.5 py-1 text-[10px] normal-case tracking-[0.08em]"
                >
                  <Building2 className="h-3 w-3" />
                  {institution}
                </Badge>
              )}
            </div>
            <h3 className="truncate text-base font-semibold text-white transition-colors group-hover:text-emerald-50">
              {title}
            </h3>
            {subtitle && <p className="mt-1 truncate text-sm text-slate-300">{subtitle}</p>}
          </div>
          <TrustBadge level={trust_level} className="flex-shrink-0" />
        </div>

        {summary && <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-300">{summary}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
          {category && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {category}
            </span>
          )}
          {institution && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {institution}
            </span>
          )}
          {province && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {province}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatTurkishDate(created_at)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {topic_tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
              {tag}
            </Badge>
          ))}
          {topic_tags.length > 3 && (
            <Badge variant="outline" className="px-2 py-0.5 text-[10px] normal-case tracking-normal">
              +{topic_tags.length - 3}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="ml-auto gap-1 px-2.5 py-1 text-[10px] normal-case tracking-[0.08em]"
          >
            <HardDrive className="h-3 w-3" />
            {storageLabel}
          </Badge>
          <Badge variant="outline" className="gap-1 px-2.5 py-1 text-[10px] normal-case tracking-[0.08em]">
            <Shield className="h-3 w-3" />
            {rightsLabel}
          </Badge>
          {file_size_bytes && file_size_bytes > 0 && (
            <span className="text-[10px] text-slate-400">{formatFileSize(file_size_bytes)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
