"use client";
import * as React from 'react';
import * as Primitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
type TooltipVariant = 'default' | 'help' | 'sidebar' | 'calendar' | 'dashboard' | 'dashboardCompact';
export const TooltipContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content> & { variant?: TooltipVariant }>(
  ({ className, sideOffset = 8, variant = 'default', children, ...props }, ref) => <Primitive.Portal><Primitive.Content ref={ref} sideOffset={sideOffset} {...props} className={cn('z-[60] max-w-[calc(100vw-16px)] text-foreground outline-none',
    variant === 'dashboard' || variant === 'dashboardCompact' ? `px-3 py-2 bg-background border border-border rounded-lg shadow-xl text-xs text-muted-foreground ${variant === 'dashboardCompact' ? 'w-44' : 'w-52'}` : variant === 'help' ? 'px-3 py-2 bg-background border border-border-subtle rounded-lg shadow-xl w-56 text-xs text-muted-foreground leading-relaxed' : variant === 'sidebar' ? 'px-4 py-2 bg-surface rounded text-sm' : variant === 'calendar' ? 'px-4 py-2 bg-tooltip-background rounded-md text-xs' : 'px-4 py-2 bg-tooltip-background rounded text-sm', className)}>
    {children}<Primitive.Arrow {...(variant === 'dashboard' || variant === 'dashboardCompact' ? { width: 12, height: 6 } : {})} className={variant === 'dashboard' || variant === 'dashboardCompact' ? 'fill-border' : variant === 'help' ? 'fill-border-subtle' : variant === 'sidebar' ? 'fill-surface' : 'fill-tooltip-background'} />
  </Primitive.Content></Primitive.Portal>
);
TooltipContent.displayName = 'TooltipContent';
export function HelpTooltip({ children, content, side = 'top', variant = 'help', disabled = false }: { children: React.ReactElement; content: React.ReactNode; side?: React.ComponentProps<typeof Primitive.Content>['side']; variant?: TooltipVariant; disabled?: boolean }) {
  if (disabled) return children;
  return <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side={side} variant={variant}>{content}</TooltipContent></Tooltip></TooltipProvider>;
}
