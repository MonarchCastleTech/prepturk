'use client';

/**
 * Offline-Only Banner -- displayed on any page that has features
 * which would normally require internet but are disabled/blocked.
 */
export default function OfflineBanner({
  title = 'Cevrimdisi Mod',
  subtitle = 'This feature requires internet and is disabled in offline mode.',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-amber-900/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-300 mb-4">
      <strong>{title}:</strong> {subtitle}
      <span className="block text-xs text-amber-400/70 mt-1">
        PrepTurk is designed to work with ZERO internet connectivity.
      </span>
    </div>
  );
}
