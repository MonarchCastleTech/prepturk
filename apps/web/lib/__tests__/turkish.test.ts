import {
  normalizeTurkish,
  turkishIncludes,
  turkishHighlight,
  formatFileSize,
  TRUST_LABELS,
  RIGHTS_LABELS,
  STORAGE_MODE_LABELS,
} from '../turkish';

describe('normalizeTurkish', () => {
  it('folds Turkish diacritics to ASCII equivalents', () => {
    // Turkish letters that carry diacritics map to their lowercase ASCII form
    // (Ç→c, İ→i); plain ASCII capitals are preserved.
    expect(normalizeTurkish('Çağrı Şükrü Öğün İç: ü ı')).toBe('cagri sukru ogun ic: u i');
    expect(normalizeTurkish('Ankara')).toBe('Ankara');
  });

  it('leaves plain ASCII untouched', () => {
    expect(normalizeTurkish('deprem hazirlik')).toBe('deprem hazirlik');
  });

  it('handles an empty string', () => {
    expect(normalizeTurkish('')).toBe('');
  });
});

describe('turkishIncludes', () => {
  it('matches regardless of diacritics and case', () => {
    expect(turkishIncludes('Acil Sağlık Rehberi', 'saglik')).toBe(true);
    expect(turkishIncludes('İçme Suyu Arıtma', 'icme')).toBe(true);
  });

  it('returns false when the query is absent', () => {
    expect(turkishIncludes('Deprem Çantası', 'yangın')).toBe(false);
  });
});

describe('turkishHighlight', () => {
  it('wraps the matched span in a <mark> tag', () => {
    const out = turkishHighlight('Acil durum çantası hazırlığı', 'çanta', 5);
    expect(out).toContain('<mark>');
    expect(out).toContain('</mark>');
  });

  it('returns the original text when there is no match', () => {
    expect(turkishHighlight('merhaba', 'xyz')).toBe('merhaba');
  });
});

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats kilobytes and megabytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1024 * 1024 * 2)).toBe('2.0 MB');
  });
});

describe('label maps', () => {
  it('exposes Turkish trust labels', () => {
    expect(TRUST_LABELS.official).toBe('Resmi');
    expect(TRUST_LABELS.personal).toBe('Kişisel');
  });

  it('maps both hyphenated and underscored rights/storage keys', () => {
    expect(RIGHTS_LABELS['pointer-only']).toBe('Yönlendirme');
    expect(RIGHTS_LABELS.pointer_only).toBe('Yönlendirme');
    expect(STORAGE_MODE_LABELS.mirrored).toBe('Yansıtılmış');
    expect(STORAGE_MODE_LABELS.bundled).toBe('Kurulumla hazır');
  });
});
