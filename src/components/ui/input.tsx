import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { formControlVariants } from './form-control';
import { useFieldControl } from './field';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, Omit<VariantProps<typeof formControlVariants>, 'size'> { controlSize?: 'field' | 'natural' }
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, variant, align, controlSize = 'field', ...props }, ref) => {
  const control = useFieldControl(props);
  return <input ref={ref} {...control} style={['dialog', 'settings', 'credential'].includes(variant ?? 'dialog') ? { outline: 'none', ...control.style } : control.style} className={cn(formControlVariants({ variant, size: controlSize, align }), className)} />;
});
Input.displayName = 'Input';
