import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-nomad-border bg-nomad-surface/95 px-3 py-2 text-sm text-foreground shadow-inner shadow-black/10 placeholder:text-nomad-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomad-green/60 focus-visible:ring-offset-2 focus-visible:ring-offset-nomad-bg focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
