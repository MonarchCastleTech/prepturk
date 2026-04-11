import { cn } from '../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({ value, max = 100, className, barClassName, showLabel, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-nomad-slate mb-1">
          <span>{label || 'Ilerleme'}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 bg-nomad-bg rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300 bg-nomad-green', barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
