import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-nomad-green/30 bg-nomad-green/12 text-green-200',
        secondary: 'border-white/10 bg-white/5 text-slate-200',
        destructive: 'border-nomad-red/30 bg-nomad-red/12 text-red-200',
        outline: 'border-nomad-border bg-white/[0.02] text-foreground',
        amber: 'border-nomad-amber/30 bg-nomad-amber/12 text-amber-200',
        blue: 'border-nomad-blue/30 bg-nomad-blue/12 text-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
