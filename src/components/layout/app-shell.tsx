import * as React from 'react';
import SideBar from '@/components/app/SideBar';
import { cn } from '@/lib/utils';

export function AppShell({ children, locked = false, className }: {
  children: React.ReactNode;
  locked?: boolean;
  className?: string;
}) {
  return <div className={cn(
    'flex min-h-screen bg-background',
    locked && 'h-screen max-h-screen overflow-hidden',
    className,
  )}>
    <SideBar />
    <main className={cn('min-w-0 flex-1', locked && 'overflow-hidden')}>
      {children}
    </main>
  </div>;
}
