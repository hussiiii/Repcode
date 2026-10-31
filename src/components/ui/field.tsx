import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

type FieldContextValue = { controlId: string; labelId: string; descriptionId?: string; errorId?: string; invalid: boolean };
const FieldContext = React.createContext<FieldContextValue | null>(null);
function contains(children: React.ReactNode, component: React.ElementType): boolean {
  return React.Children.toArray(children).some(child => React.isValidElement<{ children?: React.ReactNode }>(child)
    && (child.type === component || (child.type !== Field && contains(child.props.children, component))));
}
// Generated IDs keep concurrently mounted forms independent. Use controlId for
// legacy DOM consumers such as the settings save handler.
export const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { controlId?: string; spacing?: 'none' | 'tight' | 'normal' | 'loose'; orientation?: 'vertical' | 'horizontal'; invalid?: boolean }>(
  ({ controlId, spacing = 'none', orientation = 'vertical', invalid = false, className, children, ...props }, ref) => {
    const generated = React.useId();
    const id = controlId ?? `field-${generated}`;
    const description = contains(children, FieldDescription);
    const error = contains(children, FieldError);
    return <FieldContext.Provider value={{ controlId: id, labelId: `${id}-label`, descriptionId: description ? `${id}-description` : undefined, errorId: error ? `${id}-error` : undefined, invalid }}>
      <div ref={ref} role="group" data-invalid={invalid || undefined} className={cn(orientation === 'horizontal' && 'flex items-center gap-1', spacing === 'tight' ? 'space-y-1.5' : spacing === 'normal' ? 'space-y-2' : spacing === 'loose' ? 'space-y-2.5' : '', className)} {...props}>{children}</div>
    </FieldContext.Provider>;
  }
);
Field.displayName = 'Field';
export function useFieldControl<T extends { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: React.AriaAttributes['aria-invalid']; 'aria-labelledby'?: string }>(props: T) {
  const field = React.useContext(FieldContext);
  return { ...props, id: props.id ?? field?.controlId, 'aria-describedby': Array.from(new Set([props['aria-describedby'], field?.descriptionId, field?.errorId].filter(Boolean))).join(' ') || undefined, 'aria-invalid': props['aria-invalid'] ?? (field?.invalid || undefined) };
}
export const FieldLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>((props, ref) => {
  const field = React.useContext(FieldContext);
  return <Label ref={ref} {...props} id={props.id ?? field?.labelId} htmlFor={props.htmlFor ?? field?.controlId} />;
});
FieldLabel.displayName = 'FieldLabel';
export const FieldDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const field = React.useContext(FieldContext);
  return <p ref={ref} {...props} id={props.id ?? field?.descriptionId} className={cn('text-xs text-placeholder', className)} />;
});
FieldDescription.displayName = 'FieldDescription';
export const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement> & { variant?: 'default' | 'marketing' }>(({ variant = 'default', className, ...props }, ref) => {
  const field = React.useContext(FieldContext);
  return <p ref={ref} role="alert" {...props} id={props.id ?? field?.errorId} className={cn(variant === 'marketing' ? 'text-marketing-feedback-error flex items-center' : 'text-xs text-status-error', className)} />;
});
FieldError.displayName = 'FieldError';
export function useFieldLabel() { return React.useContext(FieldContext)?.labelId; }
