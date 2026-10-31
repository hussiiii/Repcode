import { cssColor } from '@/lib/colors';
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFieldControl, useFieldLabel } from './field';
export const Select = SelectPrimitive.Root;
export const SelectValue = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Value>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>>(({ className, ...props }, ref) => <span className={cn('text-foreground flex-1 text-left', className)}><SelectPrimitive.Value ref={ref} data-slot="select-value-text" {...props} /></span>);
SelectValue.displayName = 'SelectValue';
export const SelectGroup = SelectPrimitive.Group;
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => {
  const control = useFieldControl(props);
  const label = useFieldLabel();
  return <SelectPrimitive.Trigger ref={ref} {...control} aria-labelledby={props['aria-labelledby'] ?? (props['aria-label'] ? undefined : label)}
    className={cn('flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg hover:border-app-action-end/50 transition-colors duration-200 min-w-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)}>
    {children}<SelectPrimitive.Icon asChild><svg className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>;
});
SelectTrigger.displayName = 'SelectTrigger';
export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} position={position} sideOffset={8} align="end" {...props}
    className={cn('z-50 w-64 max-h-[var(--radix-select-content-available-height)] bg-surface border border-border rounded-lg shadow-xl overflow-hidden', className)}>
    <SelectPrimitive.ScrollUpButton className="flex justify-center text-muted-foreground"><ChevronUp className="h-4 w-4" /></SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton className="flex justify-center text-muted-foreground"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></SelectPrimitive.ScrollDownButton>
  </SelectPrimitive.Content></SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';
export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} {...props} className={cn('relative w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors duration-150 outline-none border-l-2 border-l-transparent data-[highlighted]:bg-background data-[state=checked]:bg-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-app-action-start/10 data-[state=checked]:to-app-action-end/10 data-[state=checked]:border-l-app-action-end data-[disabled]:opacity-50', className)}>
    {children}<SelectPrimitive.ItemIndicator><svg className="w-4 h-4 text-app-action-end" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';
export const SelectItemText = SelectPrimitive.ItemText;
export const SelectItemLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('font-medium text-muted-foreground [[data-state=checked]_&]:text-foreground', className)} {...props} />);
SelectItemLabel.displayName = 'SelectItemLabel';
export const SelectItemDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('text-xs text-muted-foreground/70', className)} {...props} />);
SelectItemDescription.displayName = 'SelectItemDescription';

export function SelectSwatch({ colorToken }: { colorToken: string }) {
  return <div aria-hidden="true" className="w-4 h-4 rounded" style={{ backgroundColor: cssColor(colorToken) }} />;
}
