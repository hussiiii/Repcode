import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { formControlVariants } from './form-control';
import { useFieldControl } from './field';
export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, Omit<VariantProps<typeof formControlVariants>, 'size' | 'align'> { controlSize?: 'field' | 'natural' }
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(({ className, variant = 'problem', controlSize = 'field', ...props }, ref) => {
  const control = useFieldControl(props);
  return <select ref={ref} {...control} className={cn(formControlVariants({ variant, size: controlSize }), className)} />;
});
NativeSelect.displayName = 'NativeSelect';
export function NativeSelectOption(props: React.OptionHTMLAttributes<HTMLOptionElement>) { return <option {...props} />; }
