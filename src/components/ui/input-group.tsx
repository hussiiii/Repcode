import * as React from 'react';
import { cn } from '@/lib/utils';
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> { variant?: 'glow' | 'minimal' | 'credential' | 'chat' | 'search'; motion?: 'normal' | 'fast' }
const glow = 'absolute inset-0 rounded-md border border-app-action-end/0 group-focus-within:border-app-action-end/30 pointer-events-none transition-all shadow-[0_0_0_0_rgb(var(--app-action-end)/0)] group-focus-within:shadow-[0_0_10px_1px_rgb(var(--app-action-end)/0.2)]';
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(({ variant = 'glow', motion = 'normal', className, children, ...props }, ref) => {
  const duration = motion === 'fast' ? 'duration-75' : 'duration-300';
  if (variant === 'credential') return <div ref={ref} className={cn('relative', className)} {...props}>
    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-app-action-start/10 to-app-action-end/10" />
    <div className="relative flex rounded-lg overflow-hidden transition-colors border border-border-subtle/70 group">
      {children}<div className={cn(glow, 'rounded-lg', duration)} />
    </div>
  </div>;
  return <div ref={ref} className={cn(variant === 'chat' ? 'flex rounded-lg border border-border-strong bg-background overflow-hidden' : variant === 'search' ? 'relative' : 'relative group', className)} {...props}>
    {children}
    {variant === 'glow' && <div className={cn(glow, duration)} />}
    {variant === 'minimal' && <div className={cn('absolute inset-0 rounded-md group-focus-within:border-app-action-end/30 pointer-events-none transition-all', duration)} />}
  </div>;
});
InputGroup.displayName = 'InputGroup';
export const InputGroupAddon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => <span ref={ref} className={cn('inline-flex items-center px-4 border-r border-border bg-background/50 text-placeholder', className)} {...props} />);
InputGroupAddon.displayName = 'InputGroupAddon';
