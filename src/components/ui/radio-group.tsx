import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { cssColor } from '@/lib/colors';
import { useFieldControl, useFieldLabel } from './field';
const itemVariants = cva('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50', {
  variants: {
    variant: { default: 'h-4 w-4 rounded-full border border-input text-action', pill: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border text-muted-foreground bg-border border-border transition-all duration-200 cursor-pointer', swatch: 'w-4 h-4 rounded border border-transparent data-[state=checked]:border-foreground' },
    tone: {
      default: '',
      easy: 'data-[state=checked]:text-difficulty-easy data-[state=checked]:bg-difficulty-easy-background data-[state=checked]:border-difficulty-easy-border',
      medium: 'data-[state=checked]:text-difficulty-medium data-[state=checked]:bg-difficulty-medium-background data-[state=checked]:border-difficulty-medium-border',
      hard: 'data-[state=checked]:text-difficulty-hard data-[state=checked]:bg-difficulty-hard-background data-[state=checked]:border-difficulty-hard-border',
    },
  }, defaultVariants: { variant: 'default', tone: 'default' },
});
export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & { variant?: 'default' | 'pills' | 'swatches' }>(({ variant = 'default', className, ...props }, ref) => {
  const control = useFieldControl(props);
  const label = useFieldLabel();
  return <RadioGroupPrimitive.Root ref={ref} {...control} className={cn(variant === 'pills' ? 'flex gap-4 pt-2' : variant === 'swatches' ? 'grid grid-cols-5 gap-2' : 'grid gap-2', className)} aria-labelledby={props['aria-labelledby'] ?? (props['aria-label'] ? undefined : label)} />;
});
RadioGroup.displayName = 'RadioGroup';
export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & VariantProps<typeof itemVariants> & { colorToken?: string }>(({ variant, tone, className, children, colorToken, style, ...props }, ref) => (
  <RadioGroupPrimitive.Item ref={ref} {...props} style={{ ...(colorToken ? { backgroundColor: cssColor(colorToken) } : {}), ...style }} className={cn(itemVariants({ variant, tone }), className)}>
    {variant === 'pill' || variant === 'swatch' ? children : <RadioGroupPrimitive.Indicator className="flex items-center justify-center"><span className="h-2 w-2 rounded-full bg-current" /></RadioGroupPrimitive.Indicator>}
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';
