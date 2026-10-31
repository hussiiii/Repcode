"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from 'class-variance-authority';

const variants = cva('shrink-0', { variants: { variant: {
  default: 'bg-border', toolbar: 'bg-border opacity-70',
  gradient: 'bg-gradient-to-r from-transparent via-border-subtle/70 to-transparent',
  gradientSoft: 'bg-gradient-to-r from-transparent via-border-subtle/50 to-transparent',
  subtle: 'bg-border-subtle', strong: 'bg-border-strong',
  navigation: 'bg-gradient-to-b from-marketing-navigation-border/20 to-dimmed/20',
  rule: 'border-t border-border',
} }, defaultVariants: { variant: 'default' } });

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & VariantProps<typeof variants>
>(
  (
    { className, variant, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        variants({ variant }),
        variant === 'rule' ? 'h-0' : orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
