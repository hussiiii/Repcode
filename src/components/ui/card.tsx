import { Heading } from './typography';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Orthogonal compatibility recipes let existing surfaces retain their design
// without creating one component/variant for every page.
export const cardVariants = cva('', { variants: {
  surface: {
    default: 'bg-surface', page: 'bg-background', field: 'bg-surface-field', muted: 'bg-surface/50',
    profile: 'bg-surface-profile', raised: 'bg-surface-raised', pageMuted: 'bg-background/50',
    guide: 'bg-gradient-to-r from-foreground/10 to-action/10',
    gradient: 'bg-gradient-to-br from-background to-surface-dialog-end',
    again: 'bg-status-error-border/5 hover:bg-status-error-border/10',
    hard: 'bg-feedback-hard-border/5 hover:bg-feedback-hard-border/10',
    good: 'bg-feedback-good-border/5 hover:bg-feedback-good-border/10',
    easy: 'bg-feedback-easy-border/5 hover:bg-feedback-easy-border/10',
  },
  radius: { default: 'rounded-xl', sm: 'rounded', md: 'rounded-md', lg: 'rounded-lg', '2xl': 'rounded-2xl', right: 'rounded-r-lg' },
  border: {
    default: 'border border-border', none: '', subtle: 'border border-border-subtle/50', soft: 'border border-border-subtle/30', field: 'border border-border-subtle/70',
    faint: 'border border-border/20', inset: 'border border-border/10', documentation: 'border border-border/30', emphasis: 'border border-foreground/20',
    neutralLeft: 'border-l-4 border-muted-foreground', dangerLeft: 'border-l-4 border-status-error',
    again: 'border border-status-error-border', hard: 'border border-feedback-hard-border', good: 'border border-feedback-good-border', easy: 'border border-feedback-easy-border',
  },
  padding: { none: '', xs: 'p-2', sm: 'p-3', md: 'p-4', lg: 'p-5', xl: 'p-6', '2xl': 'p-8', guide: 'px-4 xl:px-6 py-4' },
  elevation: {
    default: 'shadow-lg', none: '', sm: 'shadow-sm', md: 'shadow-md', xl: 'shadow-xl',
    collection: 'shadow-lg shadow-overlay/20 hover:shadow-xl hover:shadow-app-action-end/10 transition-all duration-300',
    feature: 'shadow-lg transition-all duration-300 hover:shadow-marketing-card hover:-translate-y-1',
    preview: 'shadow-xl transform transition-all duration-500 hover:shadow-marketing-card hover:-translate-y-1',
    comparison: 'transition-all duration-300 hover:shadow-xl hover:shadow-marketing-comparison',
    documentation: 'shadow-sm hover:shadow-md transition-shadow',
  },
  foreground: { true: 'text-foreground' },
  interactive: { true: 'transition-colors' },
}, defaultVariants: { surface: 'default', radius: 'default', border: 'default', padding: 'none', elevation: 'default' } });
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & { asChild?: boolean }>(
  ({ className, surface, radius, border, padding, elevation, foreground, interactive, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : 'div';
    return <Component ref={ref} className={cn(cardVariants({ surface, radius, border, padding, elevation, foreground, interactive }), className)} {...props} />;
  }
);
Card.displayName = 'Card';
const headerVariants = cva('', { variants: { variant: {
  default: 'flex flex-col space-y-1.5 p-6', dashboard: 'p-5 border-b border-border', preview: 'p-4 border-b border-border',
} }, defaultVariants: { variant: 'default' } });
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof headerVariants>>(
  ({ className, variant, ...props }, ref) => <div ref={ref} className={cn(headerVariants({ variant }), className)} {...props} />
);
CardHeader.displayName = 'CardHeader';
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <Heading as="h3" size="xl" weight="semibold" tone="foreground" ref={ref} className={cn('', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-muted-foreground', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';
