import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin motion-reduce:animate-none', { variants: {
  variant: {
    default: 'h-4 w-4 text-foreground',
    button: '-ml-1 mr-2 h-4 w-4 text-foreground inline-block',
    autofill: '-ml-1 mr-2 h-4 w-4 text-inverse inline-block',
    selection: 'h-8 w-8 text-app-action-end',
    stats: 'w-6 h-6 border-2 border-app-action-end border-t-transparent rounded-full',
    compact: 'w-3 h-3 border-2 border-foreground border-t-transparent rounded-full',
    save: 'w-4 h-4 rounded-full mr-2 border-2 border-foreground/30 border-t-foreground',
    chart: 'rounded-full h-8 w-8 border-t-2 border-b-2 border-chart-loading',
  },
}, defaultVariants: { variant: 'default' } });
export function Spinner({ variant = 'default', className, label, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof spinnerVariants> & { label?: string }) {
  const ring = ['stats', 'compact', 'save', 'chart'].includes(variant || '');
  return <span role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn(ring ? spinnerVariants({ variant }) : 'inline-flex', className)} {...props}>
    {!ring && <svg className={spinnerVariants({ variant })} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
  </span>;
}
