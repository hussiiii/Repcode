import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const labelVariants = cva('', {
  variants: { variant: {
    field: 'text-sm font-medium text-foreground-soft flex items-center',
    settings: 'block text-sm font-medium text-muted-foreground',
    marketing: 'block text-muted-foreground text-sm font-medium mb-2',
    report: 'block text-sm font-medium text-foreground-soft mb-2',
    option: 'flex items-center p-3 bg-surface hover:bg-surface-emphasis rounded-lg cursor-pointer transition-colors duration-200 group',
    inline: 'inline-flex items-center',
    toolbar: 'text-sm text-muted-foreground',
  } },
  defaultVariants: { variant: 'field' },
});
export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>>(
  ({ className, variant, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ variant }), className)} {...props} />
);
Label.displayName = 'Label';
