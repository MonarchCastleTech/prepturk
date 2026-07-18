"use client";

/**
 * Offline-Only Banner -- displayed on any page that has features
 * which would normally require internet but are disabled/blocked.
 */
export default function OfflineBanner({
  title = "Çevrimdışı Mod",
  subtitle = "Bu özellik ağ erişimi gerektirir ve çevrimdışı modda devre dışıdır.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-amber-900/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-300 mb-4">
      <strong>{title}:</strong> {subtitle}
      <span className="block text-xs text-amber-400/70 mt-1">
        Çevrimdışı ve yerel çalışma için tasarlandı; ağ yalıtımı dağıtım
        yapılandırmasıyla doğrulanmalıdır.
      </span>
    </div>
  );
}
