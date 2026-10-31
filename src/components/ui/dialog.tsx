"use client";

import styles from './dialog.module.css';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const dialogVariants = cva(['fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none motion-reduce:animate-none', styles.dialogEnter], {
  variants: {
    variant: {
      default: 'w-full rounded-xl shadow-[0_10px_40px_rgb(var(--overlay)/0.3)] bg-gradient-to-b from-background to-surface-dialog-end border border-border-subtle/50 text-foreground overflow-hidden',
      video: 'w-[90%] rounded-lg bg-surface-video shadow-xl p-8',
    },
    size: { sm: 'max-w-md', lg: 'max-w-4xl', xl: 'max-w-6xl' },
    scroll: {
      body: 'max-h-[90dvh] overflow-y-auto',
      contained: 'max-h-[90dvh] flex flex-col',
      frame: 'max-h-[90dvh]',
      selection: 'max-h-[85dvh] flex flex-col',
    },
  },
  defaultVariants: { variant: 'default', size: 'sm', scroll: 'body' },
});
const ModalContext = React.createContext(true);
export function Dialog({ modal = true, ...props }: React.ComponentProps<typeof Primitive.Root>) {
  return <ModalContext.Provider value={modal}><Primitive.Root modal={modal} {...props} /></ModalContext.Provider>;
}
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogPortal = Primitive.Portal;

export const DialogOverlay = React.forwardRef<React.ElementRef<typeof Primitive.Overlay>, React.ComponentPropsWithoutRef<typeof Primitive.Overlay> & { variant?: 'default' | 'video' }>(
  ({ className, variant = 'default', ...props }, ref) => <Primitive.Overlay ref={ref} className={cn(styles.overlayEnter, 'fixed inset-0 z-50 motion-reduce:animate-none', variant === 'video' ? 'bg-background/75' : 'bg-overlay/60 backdrop-blur-sm', className)} {...props} />
);
DialogOverlay.displayName = 'DialogOverlay';

// Controlled legacy dialogs have external launch buttons instead of a Trigger.
// Remember the actual launcher before Radix moves focus; fall back to the page
// when a successful delete removes that launcher from the DOM.
export function useDialogFocus() {
  const launcher = React.useRef<HTMLElement | null>(null);
  return {
    capture: () => {
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // Menu items unmount when selected. Return to their persistent trigger.
      const triggerId = active?.closest('[role="menu"]')?.getAttribute('aria-labelledby');
      launcher.current = triggerId ? document.getElementById(triggerId) ?? active : active;
    },
    restore: () => {
      const target = launcher.current?.isConnected && launcher.current !== document.body && launcher.current !== document.documentElement && !launcher.current.matches(':disabled') && !launcher.current.closest('[hidden], [aria-hidden="true"]')
        ? launcher.current
        : document.querySelector<HTMLElement>('[data-dialog-focus-fallback]') ?? document.querySelector<HTMLElement>('main');
      if (!target) return;
      if (!target.matches('button, a[href], input, textarea, select, [tabindex]')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    },
  };
}

// Radix's focus trap uses preventScroll when wrapping Tab. Reveal the focused
// control within dialog scroll containers without scrolling the page behind it.
export function revealDialogFocus(target: EventTarget, boundary: HTMLElement) {
  if (!(target instanceof HTMLElement) || !boundary.contains(target)) return;
  let container = target.parentElement;
  while (container && boundary.contains(container)) {
    if (/^(auto|scroll)$/.test(getComputedStyle(container).overflowY) && container.scrollHeight > container.clientHeight) {
      const view = container.getBoundingClientRect();
      const control = target.getBoundingClientRect();
      const top = view.top + container.clientTop;
      const bottom = top + container.clientHeight;
      if (control.top < top) container.scrollTop -= top - control.top;
      else if (control.bottom > bottom) container.scrollTop += control.bottom - bottom;
    }
    container = container.parentElement;
  }
}

type ContentProps = React.ComponentPropsWithoutRef<typeof Primitive.Content> & VariantProps<typeof dialogVariants> & { dismissible?: boolean };
export const DialogContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, ContentProps>(
  ({ className, variant, size, scroll, dismissible = true, children, onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown, onInteractOutside, onFocusCapture, ...props }, ref) => {
    const focus = useDialogFocus();
    const modal = React.useContext(ModalContext);
    return <DialogPortal>
      <DialogOverlay variant={variant === 'video' ? 'video' : 'default'} />
      <Primitive.Content ref={ref} aria-modal={modal || undefined} aria-describedby={undefined} {...props} className={cn(dialogVariants({ variant, size, scroll }), className)}
        onFocusCapture={event => { onFocusCapture?.(event); revealDialogFocus(event.target, event.currentTarget); }}
        onOpenAutoFocus={event => { focus.capture(); onOpenAutoFocus?.(event); }}
        onCloseAutoFocus={event => { onCloseAutoFocus?.(event); if (!event.defaultPrevented) { event.preventDefault(); focus.restore(); } }}
        onEscapeKeyDown={event => { onEscapeKeyDown?.(event); if (!dismissible) event.preventDefault(); }}
        onInteractOutside={event => {
          onInteractOutside?.(event);
          if (!dismissible || (event.target instanceof Element && event.target.closest('[data-toast-viewport]'))) event.preventDefault();
        }}>
        {children}
      </Primitive.Content>
    </DialogPortal>;
  }
);
DialogContent.displayName = 'DialogContent';

export const DialogTitle = React.forwardRef<React.ElementRef<typeof Primitive.Title>, React.ComponentPropsWithoutRef<typeof Primitive.Title>>(
  ({ className, ...props }, ref) => <Primitive.Title ref={ref} className={cn('text-xl font-semibold tracking-tight text-foreground', className)} {...props} />
);
DialogTitle.displayName = 'DialogTitle';
export const DialogDescription = React.forwardRef<React.ElementRef<typeof Primitive.Description>, React.ComponentPropsWithoutRef<typeof Primitive.Description>>(
  ({ className, ...props }, ref) => <Primitive.Description ref={ref} className={cn('text-foreground-soft text-sm', className)} {...props} />
);
DialogDescription.displayName = 'DialogDescription';
