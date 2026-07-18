export default function GovernanceFooter() {
  return (
    <footer
      className="border-t border-white/10 bg-black/20 px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8"
      aria-label="PrepTürk yönetişim ve çalışma modu"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/logo.svg" alt="PrepTürk" className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-200">
              PrepTürk · Egemen hazırlık bilgi sistemi
            </p>
            <p>Çevrimdışı ve yerel çalışma için tasarlandı.</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p lang="tr">Türkçe birincil arayüz</p>
          <p lang="en" className="text-slate-500">
            Part of Monarch Castle Technologies.
          </p>
        </div>
      </div>
    </footer>
  );
}
