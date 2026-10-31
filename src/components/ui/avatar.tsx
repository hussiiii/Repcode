"use client";
import * as React from 'react';
import * as Primitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const variants = cva('rounded-full overflow-hidden flex items-center justify-center', { variants: { variant: {
  default: 'w-10 h-10', profile: 'w-16 h-16', sidebar: 'w-11 h-11 shadow-lg shadow-app-action-end/20 relative',
} }, defaultVariants: { variant: 'default' } });
export const Avatar = React.forwardRef<React.ElementRef<typeof Primitive.Root>, React.ComponentPropsWithoutRef<typeof Primitive.Root> & VariantProps<typeof variants>>(
  ({ className, variant, ...props }, ref) => <Primitive.Root ref={ref} className={cn(variants({ variant }), className)} {...props} />
);
Avatar.displayName = 'Avatar';
export const AvatarImage = React.forwardRef<React.ElementRef<typeof Primitive.Image>, React.ComponentPropsWithoutRef<typeof Primitive.Image> & { variant?: 'default' | 'interactive' }>(
  ({ className, variant, ...props }, ref) => <Primitive.Image ref={ref} className={cn('w-full h-full object-cover', variant === 'interactive' && 'hover:scale-105 transition-transform duration-300', className)} {...props} />
);
AvatarImage.displayName = 'AvatarImage';
export const AvatarFallback = React.forwardRef<React.ElementRef<typeof Primitive.Fallback>, React.ComponentPropsWithoutRef<typeof Primitive.Fallback> & { variant?: 'default' | 'testimonial' }>(
  ({ className, variant, ...props }, ref) => <Primitive.Fallback ref={ref} className={cn('w-full h-full flex items-center justify-center', variant === 'testimonial' ? 'bg-gradient-to-r from-marketing-action-start to-marketing-action-end text-marketing-action-foreground font-bold' : 'bg-surface text-muted-foreground', className)} {...props} />
);
AvatarFallback.displayName = 'AvatarFallback';
