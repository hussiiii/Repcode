import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import { useFieldControl, useFieldLabel } from './field';
export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(({ className, value, defaultValue, ...props }, ref) => {
  const control = useFieldControl(props);
  const label = useFieldLabel();
  const values = value ?? defaultValue ?? [props.min ?? 0];
  return <SliderPrimitive.Root ref={ref} {...control} value={value} defaultValue={defaultValue} className={cn('relative flex h-4 touch-none select-none items-center data-[disabled]:opacity-50', className)}>
    <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-slider-track border border-slider-border">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-action" />
    </SliderPrimitive.Track>
    {values.map((_, index) => <SliderPrimitive.Thumb key={index} aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby'] ?? (props['aria-label'] ? undefined : label)} aria-describedby={control['aria-describedby']} aria-invalid={control['aria-invalid']} className="block h-4 w-4 rounded-full bg-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none" />)}
  </SliderPrimitive.Root>;
});
Slider.displayName = 'Slider';
