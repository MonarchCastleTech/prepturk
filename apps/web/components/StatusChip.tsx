import { cn } from '../lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Info, Loader2 } from 'lucide-react';

interface StatusChipProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading';
  label?: string;
  className?: string;
}

const statusConfig = {
  success: { icon: CheckCircle, color: 'border border-emerald-700/40 bg-emerald-950/70 text-emerald-300' },
  warning: { icon: AlertTriangle, color: 'border border-amber-700/40 bg-amber-950/70 text-amber-300' },
  error: { icon: XCircle, color: 'border border-red-700/40 bg-red-950/70 text-red-300' },
  info: { icon: Info, color: 'border border-sky-700/40 bg-sky-950/70 text-sky-300' },
  loading: { icon: Loader2, color: 'border border-nomad-border bg-white/5 text-nomad-slate' },
};

export default function StatusChip({ status, label, className }: StatusChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-[0.02em]', config.color, className)}>
      <Icon className={cn('h-3 w-3', status === 'loading' && 'animate-spin')} />
      {label}
    </span>
  );
}
