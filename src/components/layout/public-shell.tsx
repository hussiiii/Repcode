import styles from './public-shell.module.css';
import * as React from 'react';
import NavBar from '@/components/home/NavBar';
import Footer from '@/components/home/Footer';
import { cn } from '@/lib/utils';

export function PublicShell({ children, className, home = false, inset = false }: {
  children: React.ReactNode;
  className?: string;
  home?: boolean;
  inset?: boolean;
}) {
  return <div className={cn('min-h-screen bg-background', !home && 'flex flex-col', className)}>
    <NavBar />
    <main className={cn(styles.publicContent, "min-w-0 flex-1", inset && "pt-28 sm:pt-24")}>{children}</main>
    <Footer />
  </div>;
}
