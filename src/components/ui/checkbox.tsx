import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import { useFieldControl } from './field';

type CheckedState = CheckboxPrimitive.CheckedState;
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
}
// Radix owns selection/event behavior; asChild preserves the existing native skin.
// Only Radix's form bridge carries the name, avoiding duplicate FormData entries.
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, defaultChecked = false, onCheckedChange, name, form, disabled, required, className, ...props }, ref) => {
    const [localChecked, setLocalChecked] = React.useState<CheckedState>(defaultChecked);
    const value = checked ?? localChecked;
    const input = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => input.current!);
    React.useEffect(() => { if (input.current) input.current.indeterminate = value === 'indeterminate'; }, [value]);
    const control = useFieldControl(props);
    return <CheckboxPrimitive.Root asChild checked={value} onCheckedChange={next => {
      if (checked === undefined) setLocalChecked(next);
      onCheckedChange?.(next);
    }} name={name} value={props.value === undefined ? undefined : String(props.value)} form={form} disabled={disabled} required={required}>
      <input ref={input} type="checkbox" {...control} form={form} disabled={disabled} required={required}
        checked={value === true} onChange={event => {
          // Radix's named form bridge emits the canonical change event. The
          // visible native input must not also bubble an unnamed form change.
          if (event.currentTarget.form) event.stopPropagation();
        }}
        className={cn('w-4 h-4 rounded border-border-subtle bg-surface-field text-app-action-end focus:ring-2 focus:ring-app-action-end/50 cursor-pointer', className)} />
    </CheckboxPrimitive.Root>;
  }
);
Checkbox.displayName = 'Checkbox';
