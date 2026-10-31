import * as React from 'react';
import { AspectRatio } from './aspect-ratio';
import { cn } from '@/lib/utils';

export function MediaFrame({ children, className, ratio = 16 / 9, variant = 'plain' }: {
  children: React.ReactNode;
  className?: string;
  ratio?: number;
  variant?: 'plain' | 'rounded' | 'feature';
}) {
  return <div className={cn('w-full', className)}><AspectRatio ratio={ratio} className={cn(
    'w-full overflow-hidden',
    variant === 'rounded' && 'rounded-lg',
    variant === 'feature' && 'rounded-xl border border-border',
  )}>{children}</AspectRatio></div>;
}
