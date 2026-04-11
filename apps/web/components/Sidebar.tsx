'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../lib/utils';
import { useEasyModeStore, useUiStore } from '../lib/stores';
import Image from 'next/image';
import {
  Activity,
  Baby,
  Battery,
  BatteryCharging,
  Biohazard,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Compass,
  Cpu,
  Database,
  Droplets,
  FileText,
  FileText as FileTextIcon,
  FolderArchive,
  GraduationCap,
  HandHeart,
  Heart,
  Home as HomeIcon,
  IdCard,
  LayoutDashboard,
  Map,
  MapPin,
  MessageSquare,
  Package,
  QrCode,
  Radio,
  RefreshCw,
  Ruler,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Snowflake,
  StickyNote,
} from 'lucide-react';

interface SectionItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface CollapsibleSection {
  id: string;
  title: string;
  items: SectionItem[];
}

const commandNavItems: SectionItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Komuta Merkezi' },
  { href: '/ai-chat', icon: MessageSquare, label: 'Yapay Zeka Asistanı' },
  { href: '/vault', icon: Shield, label: 'Kasa' },
  { href: '/notes', icon: StickyNote, label: 'Notlar' },
  { href: '/admin', icon: Settings, label: 'Yönetim' },
];

const readinessNavItems: SectionItem[] = [
  { href: '/documents', icon: FileText, label: 'Belge Kütüphanesi' },
  { href: '/search', icon: Search, label: 'Komuta Araması' },
  { href: '/province-packs', icon: FolderArchive, label: 'İl Envanteri' },
  { href: '/education', icon: BookOpen, label: 'Eğitim' },
  { href: '/kolibri', icon: GraduationCap, label: 'Kolibri LMS' },
  { href: '/wikipedia', icon: Database, label: 'Wikipedia' },
  { href: '/maps', icon: Map, label: 'Haritalar' },
  { href: '/cyberchef', icon: Cpu, label: 'CyberChef' },
  { href: '/toplanma', icon: MapPin, label: 'Toplanma Alanları' },
];

const easyNavItems: SectionItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Komuta Merkezi' },
  { href: '/documents', icon: FileText, label: 'Belgeler' },
  { href: '/saglik', icon: Heart, label: 'Sağlık' },
  { href: '/notes', icon: StickyNote, label: 'Notlar' },
  { href: '/admin', icon: Settings, label: 'Ayarlar' },
];

const fullNavGroups: CollapsibleSection[] = [
  { id: 'komuta', title: 'Komuta', items: commandNavItems },
  { id: 'bilgi-erisimi', title: 'Bilgi ve Hazırlık', items: readinessNavItems },
];

const collapsibleSections: CollapsibleSection[] = [
  {
    id: 'hayatta-kalma',
    title: 'Hayatta Kalma',
    items: [
      { href: '/kislik-hazirlik', icon: Package, label: 'Kışlık Hazırlık & Tarım' },
      { href: '/su-aritma', icon: Droplets, label: 'Su Arıtma' },
      { href: '/veterinerlik', icon: Activity, label: 'Kriz Veterinerliği' },
      { href: '/gida-saklama', icon: Package, label: 'Gıda Saklama' },
      { href: '/barinak-isinma', icon: HomeIcon, label: 'Barınak/Isınma' },
      { href: '/mesafe-tahmin', icon: Ruler, label: 'Mesafe Tahmini' },
      { href: '/yildiz-navigasyon', icon: Compass, label: 'Yıldız Navigasyonu' },
    ],
  },
  {
    id: 'guvenlik',
    title: 'Güvenlik',
    items: [
      { href: '/savas-durumu', icon: ShieldCheck, label: 'Savaş & Sivil Savunma' },
      { href: '/nukleer-tehlike', icon: Biohazard, label: 'KBRN & Nükleer Tehlike' },
      { href: '/mahalle-savunmasi', icon: Shield, label: 'Mahalle Savunması' },
      { href: '/kronik-hastalik', icon: Activity, label: 'Kronik Hastalık' },
      { href: '/semptom-kontrol', icon: Brain, label: 'Semptom Kontrol' },
      { href: '/psikolojik-saglik', icon: HandHeart, label: 'Psikolojik Sağlık' },
      { href: '/guvenlik-planlama', icon: ShieldCheck, label: 'Güvenlik Planlama' },
      { href: '/pandemi-hazirlik', icon: Biohazard, label: 'Pandemi Hazırlığı' },
    ],
  },
  {
    id: 'enerji',
    title: 'Enerji',
    items: [
      { href: '/dusuk-guc', icon: Battery, label: 'Düşük Güç' },
      { href: '/gunes-sarj', icon: BatteryCharging, label: 'Güneş Şarj' },
      { href: '/guc-hesaplayici', icon: Calculator, label: 'Güç Hesaplayıcı' },
      { href: '/envanter', icon: ClipboardList, label: 'Envanter' },
    ],
  },
  {
    id: 'iletisim',
    title: 'İletişim',
    items: [
      { href: '/dosya-paylasim', icon: QrCode, label: 'Digital Dead Drop' },
      { href: '/qr-mesaj', icon: QrCode, label: 'QR Mesaj' },
      { href: '/radyo-frekans', icon: Radio, label: 'Radyo Frekans' },
      { href: '/takas-rehberi', icon: Scale, label: 'Takas Rehberi' },
      { href: '/sablonlar', icon: FileTextIcon, label: 'Şablonlar' },
      { href: '/veri-senkronizasyon', icon: RefreshCw, label: 'Veri Senkronizasyonu' },
    ],
  },
  {
    id: 'planlama',
    title: 'Planlama',
    items: [
      { href: '/hazirlik-zaman-cizelgesi', icon: Calendar, label: 'Hazırlık Zaman Çizelgesi' },
      { href: '/mevsim-hazirlik', icon: Snowflake, label: 'Mevsim Hazırlığı' },
      { href: '/sehir-koy', icon: Building2, label: 'Şehir/Köy' },
      { href: '/cocuk-aktivite', icon: Baby, label: 'Çocuk Aktivite' },
      { href: '/cocuk-kimlik', icon: IdCard, label: 'Çocuk Kimlik' },
    ],
  },
];

interface SidebarProps {
  mobileNavOpen?: boolean;
  onMobileNavClose?: () => void;
}

export default function Sidebar({ mobileNavOpen = false, onMobileNavClose }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { isEasyMode } = useEasyModeStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'hayatta-kalma': false,
    guvenlik: false,
    enerji: false,
    iletisim: false,
    planlama: false,
  });

  const navGroups = isEasyMode
    ? [{ id: 'kolay-mod', title: 'Hızlı Erişim', items: easyNavItems }]
    : fullNavGroups;
  const desktopShellExpanded = isEasyMode || sidebarOpen;
  const showLabels = mobileNavOpen || desktopShellExpanded;
  const activeSectionIds = useMemo(
    () =>
      collapsibleSections
        .filter((section) =>
          section.items.some((item) => pathname === item.href || pathname.startsWith(item.href))
        )
        .map((section) => section.id),
    [pathname]
  );

  useEffect(() => {
    if (activeSectionIds.length === 0) {
      return;
    }

    setOpenSections((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const id of activeSectionIds) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [activeSectionIds]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDesktopToggle = () => {
    toggleSidebar();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/8 bg-[linear-gradient(180deg,rgba(17,24,30,0.98),rgba(10,14,18,0.98))] shadow-panel transition-[width,transform] duration-300 no-print',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        'w-[min(18rem,calc(100vw-2.5rem))] lg:translate-x-0',
        desktopShellExpanded ? 'lg:w-[var(--shell-sidebar-width)]' : 'lg:w-[var(--shell-sidebar-collapsed-width)]'
      )}
    >
      <div className="flex min-h-[5.5rem] items-start justify-between gap-3 border-b border-white/8 px-4 py-4">
        {showLabels ? (
          <div className="min-w-0 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] border border-nomad-green/20 bg-nomad-green/12 shadow-[0_10px_26px_rgba(21,34,28,0.35)] overflow-hidden">
                <Image src="/logo.svg" alt="PrepTürk Logo" width={28} height={28} className="object-contain" />
              </div>
              <div className="min-w-0">
                <p className="shell-kicker">PrepTürk</p>
                <p className="truncate text-base font-semibold text-white">Çevrimdışı Sistem</p>
                <p className="mt-1 text-sm text-slate-400">Tüm bilgi ve saha araçları elinizin altında.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Yerel
              </span>
              <span className="inline-flex rounded-full border border-nomad-green/20 bg-nomad-green/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Çevrimdışı
              </span>
              {isEasyMode && (
                <span className="inline-flex rounded-full border border-nomad-blue/20 bg-nomad-blue/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                  Kolay Mod
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] border border-nomad-green/20 bg-nomad-green/12 shadow-[0_10px_26px_rgba(21,34,28,0.35)] overflow-hidden">
            <Image src="/logo.svg" alt="PrepTürk Logo" width={28} height={28} className="object-contain" />
          </div>
        )}
        <button
          type="button"
          onClick={onMobileNavClose}
          className="rounded-xl border border-transparent p-2 text-nomad-slate transition-colors hover:border-white/5 hover:bg-white/5 hover:text-foreground lg:hidden"
          aria-label="Navigasyonu kapat"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleDesktopToggle}
          className="hidden rounded-xl border border-transparent p-2 text-nomad-slate transition-colors hover:border-white/5 hover:bg-white/5 hover:text-foreground lg:inline-flex"
          aria-label="Menüyü daralt veya genişlet"
        >
          {desktopShellExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navGroups.map((group) => (
            <section key={group.id}>
              {showLabels && <div className="shell-muted-label px-3 pb-2">{group.title}</div>}
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileNavClose}
                        className={cn(
                          'sidebar-nav-item flex items-center rounded-2xl border text-sm transition-all duration-200',
                          showLabels ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-3',
                          isActive
                            ? 'border-nomad-green/30 bg-[linear-gradient(180deg,rgba(52,90,69,0.28),rgba(31,49,39,0.18))] text-green-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_rgba(6,10,18,0.24)]'
                            : 'border-transparent text-foreground/72 hover:border-white/8 hover:bg-white/[0.04] hover:text-foreground'
                        )}
                        title={!showLabels ? item.label : undefined}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 flex-shrink-0',
                            isActive ? 'text-emerald-200' : 'text-slate-400'
                          )}
                        />
                        {showLabels && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {!isEasyMode && showLabels && (
            <section>
              <div className="shell-muted-label px-3 pb-2">Saha Modülleri</div>
              <ul className="space-y-1.5">
                {collapsibleSections.map((section) => {
                  const isOpen = openSections[section.id];
                  const hasActive = section.items.some(
                    (item) => pathname === item.href || pathname.startsWith(item.href)
                  );

                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition-all duration-200',
                          hasActive
                            ? 'border-nomad-green/20 bg-nomad-green/10 text-green-100'
                            : 'border-transparent text-foreground/72 hover:border-white/8 hover:bg-white/[0.04] hover:text-foreground'
                        )}
                      >
                        <span>{section.title}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {isOpen && (
                        <ul className="ml-4 mt-2 space-y-1.5 border-l border-white/8 pl-3">
                          {section.items.map((item) => {
                            const isActiveItem = pathname === item.href || pathname.startsWith(item.href);
                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={onMobileNavClose}
                                  className={cn(
                                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-200',
                                    isActiveItem
                                      ? 'border-nomad-green/30 bg-nomad-green/12 text-green-100'
                                      : 'border-transparent text-foreground/68 hover:border-white/8 hover:bg-white/[0.04] hover:text-foreground'
                                  )}
                                  title={item.label}
                                >
                                  <item.icon className="h-4 w-4 flex-shrink-0" />
                                  <span>{item.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </nav>

      <div className="border-t border-nomad-border/80 px-4 py-4">
        {showLabels ? (
          <div className="space-y-3 rounded-[1.2rem] border border-white/8 bg-white/[0.02] p-3">
            <div>
              <p className="shell-muted-label">Yerel Durum</p>
              <p className="mt-1 text-sm text-white">Cihaz içi servisler hazır.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <p className="shell-value text-[10px]">İndeks</p>
                <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-200">
                  <Database className="h-3.5 w-3.5 text-sky-300" />
                  Hazır
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <p className="shell-value text-[10px]">Model</p>
                <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-200">
                  <Cpu className="h-3.5 w-3.5 text-emerald-300" />
                  0.5B
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-nomad-slate">PT</div>
        )}
      </div>
    </aside>
  );
}
