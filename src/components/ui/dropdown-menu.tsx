"use client";

import * as React from 'react';
import * as Primitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export function DropdownMenu({ modal = false, ...props }: React.ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root modal={modal} {...props} />;
}
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content> & { variant?: 'workspace' | 'row' }>(
  ({ variant = 'workspace', className, sideOffset = 8, onCloseAutoFocus, onClick, ...props }, ref) => <Primitive.Portal><Primitive.Content ref={ref} sideOffset={sideOffset} align="end" {...props}
    className={cn('z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto border border-border outline-none', variant === 'row' ? 'w-36 rounded-lg bg-surface shadow-lg py-1' : 'w-52 bg-background rounded-xl shadow-2xl p-1.5', className)}
    onClick={event => { event.stopPropagation(); onClick?.(event); }}
    onCloseAutoFocus={event => {
      onCloseAutoFocus?.(event);
      // Opening a dialog from a menu must let the dialog take and retain focus.
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) event.preventDefault();
    }} /></Primitive.Portal>
);
DropdownMenuContent.displayName = 'DropdownMenuContent';
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof Primitive.Item>, React.ComponentPropsWithoutRef<typeof Primitive.Item> & { variant?: 'workspace' | 'row'; destructive?: boolean; selected?: boolean }>(
  ({ className, variant = 'workspace', destructive, selected, onSelect, ...props }, ref) => <Primitive.Item ref={ref} {...props} onSelect={event => {
    // A selected item disappears. Capture the persistent trigger before a caller
    // opens a controlled dialog so closing that dialog restores the right place.
    const id = event.target instanceof Element ? event.target.closest('[role="menu"]')?.getAttribute('aria-labelledby') : null;
    if (id) document.getElementById(id)?.focus({ preventScroll: true });
    onSelect?.(event);
  }} className={cn('flex items-center cursor-pointer outline-none transition-all duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    variant === 'row' ? 'w-full px-4 py-2 text-sm data-[highlighted]:bg-border' : 'w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium data-[highlighted]:bg-surface',
    destructive ? 'text-difficulty-hard' : selected ? 'bg-app-action-end/15 text-foreground' : 'text-muted-foreground data-[highlighted]:text-foreground', className)} />
);
DropdownMenuItem.displayName = 'DropdownMenuItem';
