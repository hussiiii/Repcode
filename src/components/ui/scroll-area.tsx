import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type ScrollDirection = 'vertical' | 'horizontal' | 'both';
const directionClass: Record<ScrollDirection, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto',
  both: 'overflow-auto',
};

export const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  direction?: ScrollDirection;
}>(({ asChild = false, direction = 'vertical', className, ...props }, ref) => {
  const Component = asChild ? Slot : 'div';
  return <Component ref={ref} {...props} className={cn('min-h-0 min-w-0', directionClass[direction], className)} />;
});
ScrollArea.displayName = 'ScrollArea';
