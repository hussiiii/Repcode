"use client";
import * as React from 'react';
import * as Primitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
export const Tabs = Primitive.Root;
export const TabsList = React.forwardRef<React.ElementRef<typeof Primitive.List>, React.ComponentPropsWithoutRef<typeof Primitive.List> & { variant?: 'default' | 'range' }>(({ variant = 'default', className, ...props }, ref) => <Primitive.List ref={ref} {...props} className={cn('flex min-w-0 items-center overflow-x-auto', variant === 'range' ? 'bg-background rounded-lg' : 'gap-1', className)} />);
TabsList.displayName = 'TabsList';
const triggerVariants = cva('flex items-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none', { variants: { variant: {
  workspace: 'px-4 py-2 text-sm rounded-full space-x-2 text-foreground data-[state=active]:bg-app-action-end/15 data-[state=inactive]:hover:bg-background/50',
  preview: 'px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-foreground data-[state=inactive]:hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  range: 'px-3 py-1 text-sm rounded-md text-muted-foreground hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-metric-due data-[state=active]:to-app-action-end data-[state=active]:text-foreground',
} }, defaultVariants: { variant: 'workspace' } });
export const TabsTrigger = React.forwardRef<React.ElementRef<typeof Primitive.Trigger>, React.ComponentPropsWithoutRef<typeof Primitive.Trigger> & VariantProps<typeof triggerVariants>>(({ variant, className, ...props }, ref) => <Primitive.Trigger ref={ref} {...props} className={cn(triggerVariants({ variant }), className)} />);
TabsTrigger.displayName = 'TabsTrigger';
export const TabsContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content>>(({ className, ...props }, ref) => <Primitive.Content ref={ref} {...props} className={cn('outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} />);
TabsContent.displayName = 'TabsContent';
