"use client";
import * as React from 'react';
import * as Primitive from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
const VariantContext = React.createContext<'chart' | 'tools'>('chart');
export const ToggleGroup = React.forwardRef<React.ElementRef<typeof Primitive.Root>, React.ComponentPropsWithoutRef<typeof Primitive.Root> & { variant?: 'chart' | 'tools' }>(({ variant = 'chart', className, ...props }, ref) => <VariantContext.Provider value={variant}><Primitive.Root ref={ref} {...props} className={cn(variant === 'chart' ? 'flex bg-background rounded-lg p-1 border border-border' : 'flex items-center gap-1', className)} /></VariantContext.Provider>);
ToggleGroup.displayName = 'ToggleGroup';
export const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof Primitive.Item>, React.ComponentPropsWithoutRef<typeof Primitive.Item>>(({ className, ...props }, ref) => {
  const variant = React.useContext(VariantContext);
  return <Primitive.Item ref={ref} {...props} className={cn('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50', variant === 'chart' ? 'px-3 py-1.5 text-sm rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground data-[state=on]:bg-gradient-to-r data-[state=on]:from-app-action-start data-[state=on]:to-app-action-end data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:shadow-sm' : cn(buttonVariants({ variant: 'tool', size: 'sm' }), 'data-[state=on]:bg-action data-[state=on]:border-0 data-[state=on]:text-foreground data-[state=on]:hover:bg-action'), className)} />;
});
ToggleGroupItem.displayName = 'ToggleGroupItem';
