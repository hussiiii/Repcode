import * as React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from './alert-dialog';
import { Button } from './button';
import { Spinner } from './spinner';
import { cssColor } from '@/lib/colors';

export function ConfirmationDialog({ open, onClose, title, children, onConfirm, busy = false, actionLabel = 'Delete', busyLabel = 'Deleting...' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
  onConfirm: () => void; busy?: boolean; actionLabel?: string; busyLabel?: string;
}) {
  const gradient = React.useId();
  return <AlertDialog open={open} onOpenChange={value => { if (!value && !busy) onClose(); }}>
    <AlertDialogContent busy={busy}>
      <div className="h-1 w-full bg-gradient-to-r from-status-danger to-status-danger-soft" />
      <div className="p-6 relative">
        <div className="absolute bottom-0 left-0 right-0 mx-4 h-12 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
          <svg className="w-full" height="20" viewBox="0 0 400 20" fill="none" preserveAspectRatio="none">
            <path d="M0 10C80 20 180 0 400 10" stroke={`url(#${gradient})`} strokeWidth="1.5" strokeLinecap="round" />
            <defs><linearGradient id={gradient} x1="0" y1="10" x2="400" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor={cssColor('status-danger')} /><stop offset="1" stopColor={cssColor('status-danger-soft')} /></linearGradient></defs>
          </svg>
        </div>
        <div className="flex items-center justify-between mb-6 relative z-10">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogCancel asChild><Button variant="close" aria-label="Close dialog" disabled={busy}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button></AlertDialogCancel>
        </div>
        <div className="space-y-5 relative z-10">
          <AlertDialogDescription>{children}</AlertDialogDescription>
          <div className="flex justify-end pt-4">
            {/* Async mutations close only on success; failed requests stay reviewable. */}
            <Button variant="danger" size="dialog" loading={busy} onClick={onConfirm}>
              {busy && <Spinner variant="button" />}{busy ? busyLabel : actionLabel}
              <span className="absolute inset-0 w-full h-full bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </AlertDialogContent>
  </AlertDialog>;
}
