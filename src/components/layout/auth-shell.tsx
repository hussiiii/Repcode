import * as React from 'react';
import { cn } from '@/lib/utils';

export function AuthShell({ children, contained = true }: { children: React.ReactNode; contained?: boolean }) {
  return <div className="bg-background min-h-screen flex h-full items-center justify-center py-16">
    <main className={cn('w-full', contained && 'max-w-md mx-auto p-6')}>{children}</main>
  </div>;
}
