"use client";
import * as React from 'react';
import * as Primitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverAnchor = Primitive.Anchor;
export const PopoverClose = Primitive.Close;
export const PopoverContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content>>(
  ({ className, align = 'start', sideOffset = 4, ...props }, ref) => <Primitive.Portal><Primitive.Content ref={ref} align={align} sideOffset={sideOffset} {...props} className={cn('z-50 max-h-[var(--radix-popover-content-available-height)] overflow-y-auto w-32 py-2 px-1 bg-surface-inset border border-border rounded-lg shadow-lg outline-none', className)} /></Primitive.Portal>
);
PopoverContent.displayName = 'PopoverContent';
