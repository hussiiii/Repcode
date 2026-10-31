import { Heading } from './typography';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const variants = cva('', { variants: { variant: {
  default: 'flex flex-col items-center justify-center py-16 px-6',
  plain: '',
  inline: 'text-center text-muted-foreground text-sm py-8',
  category: 'p-4 text-center text-muted-foreground',
  chart: 'bg-surface rounded-xl border border-border p-8 text-center',
  chartInline: 'text-foreground-quiet text-sm',
  search: 'text-center text-muted-foreground py-8',
  complete: 'flex justify-center items-center h-full',
} }, defaultVariants: { variant: 'default' } });
export function Empty({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof variants>) {
  return <div role="status" className={cn(variants({ variant }), className)} {...props} />;
}
export function EmptyHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('max-w-md mx-auto text-center', className)} {...props} />; }
export function EmptyTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <Heading as="h3" size="xl" weight="semibold" tone="foreground" className={cn('mb-3', className)} {...props} />; }
export function EmptyDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn('text-muted-foreground leading-relaxed mb-6', className)} {...props} />; }
