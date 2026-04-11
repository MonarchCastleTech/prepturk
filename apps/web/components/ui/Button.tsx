import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomad-green/60 focus-visible:ring-offset-2 focus-visible:ring-offset-nomad-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-nomad-green/30 bg-nomad-green text-primary-foreground shadow-panel hover:bg-nomad-green/90',
        destructive: 'border-nomad-red/30 bg-nomad-red text-white hover:bg-nomad-red/90',
        outline: 'border-nomad-border bg-white/[0.02] text-foreground hover:border-nomad-borderStrong hover:bg-nomad-card',
        secondary: 'border-nomad-border bg-nomad-surface text-foreground hover:bg-nomad-card',
        ghost: 'border-transparent bg-transparent text-foreground/80 hover:bg-white/5 hover:text-foreground',
        link: 'border-transparent px-0 text-nomad-green underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
