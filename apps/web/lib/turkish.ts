const TURKISH_MAP: Record<string, string> = {
  '\u0131': 'i', '\u0130': 'i',
  '\u015f': 's', '\u015e': 's',
  '\u011f': 'g', '\u011e': 'g',
  '\u00f6': 'o', '\u00d6': 'o',
  '\u00fc': 'u', '\u00dc': 'u',
  '\u00e7': 'c', '\u00c7': 'c',
};

export function normalizeTurkish(text: string): string {
  return text
    .split('')
    .map((ch) => TURKISH_MAP[ch] ?? ch)
    .join('');
}

export function turkishIncludes(text: string, query: string): boolean {
  return normalizeTurkish(text.toLowerCase()).includes(
    normalizeTurkish(query.toLowerCase())
  );
}

export function turkishHighlight(text: string, query: string, radius = 30): string {
  const normText = normalizeTurkish(text);
  const normQuery = normalizeTurkish(query.toLowerCase());
  const idx = normText.toLowerCase().indexOf(normQuery);
  if (idx === -1) return text;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  const slice = text.slice(start, end);
  const matchIdx = normalizeTurkish(slice.toLowerCase()).indexOf(normQuery);
  if (matchIdx === -1) return `${prefix}${slice}${suffix}`;
  const highlighted =
    slice.slice(0, matchIdx) +
    '<mark>' +
    slice.slice(matchIdx, matchIdx + query.length) +
    '</mark>' +
    slice.slice(matchIdx + query.length);
  return `${prefix}${highlighted}${suffix}`;
}

export function formatTurkishDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTurkishDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export const TRUST_LABELS: Record<string, string> = {
  official: 'Resmi',
  institutional: 'Kurumsal',
  community: 'Topluluk',
  personal: 'Kişisel',
};

export const RIGHTS_LABELS: Record<string, string> = {
  'public-download': 'Herkese açık',
  'public-read-limited-redistribution': 'Sınırlı okuma',
  'pointer-only': 'Yönlendirme',
  pointer_only: 'Yönlendirme',
  'unknown-review-needed': 'İnceleme gerekli',
  'user-owned': 'Kullanıcıya ait',
};

export const STORAGE_MODE_LABELS: Record<string, string> = {
  mirrored: 'Yansıtılmış',
  cached: 'Önbellek',
  'pointer-only': 'Yönlendirme',
  pointer_only: 'Yönlendirme',
  'user-uploaded': 'Kullanıcı yüklemesi',
  bundled: 'Kurulumla hazır',
  embedded: 'Kurulumla hazır',
  local: 'Yerel',
};
