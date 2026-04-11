'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from './ui/Input';
import { useSearchSuggestions } from '../hooks/useSearch';
import { cn } from '../lib/utils';

interface SearchBarProps {
  className?: string;
  initialValue?: string;
  placeholder?: string;
  inputClassName?: string;
  navigateTo?: string | null;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  className,
  initialValue = '',
  placeholder = 'Belge, kurum veya konu ara',
  inputClassName,
  navigateTo = '/search',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSearchSuggestions(query);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitQuery = (nextQuery: string) => {
    const trimmed = nextQuery.trim();
    setQuery(nextQuery);
    onSearch?.(trimmed);

    if (navigateTo) {
      router.push(trimmed ? `${navigateTo}?q=${encodeURIComponent(trimmed)}` : navigateTo);
    }

    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitQuery(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    commitQuery(suggestion);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nomad-slate" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            className={cn(
              'h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-nomad-slate/90',
              inputClassName
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => commitQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nomad-slate transition-colors hover:text-foreground"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(19,26,33,0.96),rgba(14,20,25,0.98))] shadow-2xl shadow-black/40">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
