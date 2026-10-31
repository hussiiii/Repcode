"use client";
import styles from './dialog.module.css';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-alert-dialog';
import { type VariantProps } from 'class-variance-authority';
import { dialogVariants, useDialogFocus, revealDialogFocus } from './dialog';
import { cn } from '@/lib/utils';

export const AlertDialog = Primitive.Root;
export const AlertDialogTrigger = Primitive.Trigger;
export const AlertDialogAction = Primitive.Action;
export const AlertDialogCancel = Primitive.Cancel;
export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content> & VariantProps<typeof dialogVariants> & { busy?: boolean }>(
  ({ children, className, variant, size, scroll, busy = false, onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown, onFocusCapture, ...props }, ref) => {
    const focus = useDialogFocus();
    return <Primitive.Portal>
      <Primitive.Overlay className={cn(styles.overlayEnter, "fixed inset-0 z-50 bg-overlay/60 backdrop-blur-sm motion-reduce:animate-none")} />
      <Primitive.Content aria-modal="true" {...props} ref={ref} className={cn(dialogVariants({ variant, size, scroll }), className)}
        onFocusCapture={event => { onFocusCapture?.(event); revealDialogFocus(event.target, event.currentTarget); }}
        onOpenAutoFocus={event => { focus.capture(); onOpenAutoFocus?.(event); }}
        onCloseAutoFocus={event => { onCloseAutoFocus?.(event); if (!event.defaultPrevented) { event.preventDefault(); focus.restore(); } }}
        onEscapeKeyDown={event => { onEscapeKeyDown?.(event); if (busy) event.preventDefault(); }}>
        {children}
      </Primitive.Content>
    </Primitive.Portal>;
  }
);
AlertDialogContent.displayName = 'AlertDialogContent';
export const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof Primitive.Title>, React.ComponentPropsWithoutRef<typeof Primitive.Title>>(
  ({ className, ...props }, ref) => <Primitive.Title ref={ref} className={cn('text-xl font-semibold tracking-tight text-foreground', className)} {...props} />
);
AlertDialogTitle.displayName = 'AlertDialogTitle';
export const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof Primitive.Description>, React.ComponentPropsWithoutRef<typeof Primitive.Description>>(
  ({ className, ...props }, ref) => <Primitive.Description ref={ref} className={cn('text-foreground-soft text-sm', className)} {...props} />
);
AlertDialogDescription.displayName = 'AlertDialogDescription';
