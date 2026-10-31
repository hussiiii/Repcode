import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva('', { variants: {
  variant: {
    default: 'inline-flex items-center border text-xs font-medium rounded-md transition-all duration-400',
    meta: 'inline-flex items-center rounded-full text-xs font-medium bg-background text-muted-foreground',
    surface: 'inline-flex items-center rounded-full text-xs font-medium bg-surface text-muted-foreground',
    count: 'bg-surface-count rounded-full text-sm text-foreground',
    hero: 'inline-flex items-center bg-surface/80 backdrop-blur-sm rounded-full border border-border',
    counter: 'inline-flex items-center bg-surface/80 backdrop-blur-sm rounded-full border border-border',
    membership: 'text-[10px] font-medium rounded-sm text-foreground bg-gradient-to-r from-app-action-start to-app-action-end border border-app-action-end/20 hover:scale-110 transition-transform duration-200 cursor-default',
    counterLabel: 'text-sm bg-foreground/10 rounded-lg',
  },
  size: { default: 'px-3 py-1', problem: 'py-1.5 px-4', compact: 'px-2.5 py-0.5', count: 'px-2 py-1', hero: 'px-4 py-2', counter: 'px-5 py-3', membership: 'px-1.5 py-0.5', counterLabel: 'px-2 py-0.5' },
  foreground: { true: 'text-foreground' },
}, defaultVariants: { variant: 'default', size: 'default' } });
export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants> & { asChild?: boolean };

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ variant, size, foreground, asChild, children, className, ...props }, ref) => {
  const Component = asChild ? Slot : 'span';
  return <Component ref={ref} {...props} className={cn(badgeVariants({ variant, size, foreground }), className)}>{children}</Component>;
});
Badge.displayName = 'Badge';

export default Badge;
