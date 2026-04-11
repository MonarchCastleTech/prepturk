import { cn } from '../lib/utils';
import { Shield, ShieldCheck, Users, User } from 'lucide-react';
import { TRUST_LABELS } from '../lib/turkish';

interface TrustBadgeProps {
  level: string;
  className?: string;
  showLabel?: boolean;
}

const levelConfig: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  official: { color: 'text-emerald-300', icon: ShieldCheck, bg: 'border-emerald-700/40 bg-emerald-950/60' },
  institutional: { color: 'text-sky-300', icon: Shield, bg: 'border-sky-700/40 bg-sky-950/60' },
  community: { color: 'text-amber-300', icon: Users, bg: 'border-amber-700/40 bg-amber-950/60' },
  personal: { color: 'text-slate-300', icon: User, bg: 'border-slate-700/40 bg-slate-950/60' },
};

export default function TrustBadge({ level, className, showLabel = true }: TrustBadgeProps) {
  const config = levelConfig[level] ?? levelConfig.community;
  const Icon = config.icon;
  const label = TRUST_LABELS[level] ?? level;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-[0.02em]',
        config.bg,
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
