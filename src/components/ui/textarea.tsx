import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { formControlVariants } from './form-control';
import { useFieldControl } from './field';
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<VariantProps<typeof formControlVariants>, 'size' | 'align'> { minSize?: 'natural' | 'sm' | 'md' | 'lg' | 'report'; resizable?: boolean }
const heights = { natural: '', sm: 'min-h-[4rem]', md: 'min-h-[8rem]', lg: 'min-h-[12rem]', report: 'min-h-[80px]' };
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant = 'problem', minSize = 'natural', resizable = false, ...props }, ref) => {
  const control = useFieldControl(props);
  return <textarea ref={ref} {...control} className={cn(formControlVariants({ variant, size: 'natural' }), heights[minSize], resizable && 'resize-y', className)} />;
});
Textarea.displayName = 'Textarea';
