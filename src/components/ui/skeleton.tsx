import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const variants = cva('animate-pulse motion-reduce:animate-none', { variants: { variant: {
  default: 'rounded-md bg-surface-field',
  thinking: 'my-2 p-3 rounded-lg bg-surface text-foreground border-l-2 border-app-highlight',
} }, defaultVariants: { variant: 'default' } });
export function Skeleton({ className, variant, children, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof variants>) {
  return <div aria-hidden={children ? undefined : true} role={children ? 'status' : undefined} className={cn(variants({ variant }), className)} {...props}>{children}</div>;
}
