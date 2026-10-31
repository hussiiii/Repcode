"use client";
import styles from './toast.module.css';
import * as React from 'react';
import * as Primitive from '@radix-ui/react-toast';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { dismissToast, useToastMessages } from './use-toast';

export const ToastProvider = Primitive.Provider;
export const ToastTitle = Primitive.Title;
export const ToastDescription = Primitive.Description;
export const ToastAction = Primitive.Action;
export const ToastClose = Primitive.Close;
export const Toast = React.forwardRef<React.ElementRef<typeof Primitive.Root>, React.ComponentPropsWithoutRef<typeof Primitive.Root>>(
  ({ className, children, ...props }, ref) => <Primitive.Root ref={ref} {...props} className={cn(styles.toastEnter, 'pointer-events-auto relative overflow-hidden bg-surface border border-border rounded-xl shadow-[0_10px_40px_rgb(var(--overlay)/0.3)] text-foreground motion-reduce:animate-none max-w-full sm:max-w-md', className)}>
    <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-app-action-start to-app-action-end" />
    <div className="px-6 py-4 relative"><Primitive.Description className="text-sm font-medium">{children}</Primitive.Description></div>
    <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-action-end/30 to-transparent" />
  </Primitive.Root>
);
Toast.displayName = 'Toast';
export const ToastViewport = React.forwardRef<React.ElementRef<typeof Primitive.Viewport>, React.ComponentPropsWithoutRef<typeof Primitive.Viewport>>(
  ({ className, ...props }, ref) => <Primitive.Viewport ref={ref} data-toast-viewport="" className={cn('fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 max-w-[calc(100vw-2rem)] outline-none pointer-events-auto', className)} {...props} />
);
ToastViewport.displayName = 'ToastViewport';

export function Toaster() {
  const messages = useToastMessages();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<ToastProvider swipeDirection="right" label="Notification">
    {messages.map(item => <Toast key={item.id} open duration={item.duration} onOpenChange={open => { if (!open) dismissToast(item.id); }}>{item.message}</Toast>)}
    <ToastViewport label="Notifications ({hotkey})" />
  </ToastProvider>, document.body);
}
