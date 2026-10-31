import styles from './typography.module.css';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Prose = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'problem' | 'preview' | 'previewDescription' | 'legal';
}>(({ variant = 'problem', className, ...props }, ref) => (
  <div ref={ref} {...props} className={cn(
    variant === 'problem' && cn(styles.description, styles.problem, styles.inverted, 'max-w-none text-foreground bg-background mt-4'),
    variant === 'preview' && cn(styles.inverted, 'max-w-none text-xs md:text-sm [&_pre]:text-xs [&_pre]:overflow-x-auto [&_code]:text-xs [&_code]:break-words'),
    variant === 'previewDescription' && cn(styles.description, styles.inverted, 'text-foreground mt-4 max-w-none text-sm'),
    variant === 'legal' && 'max-w-4xl text-center space-y-6 text-foreground [&_p]:text-lg [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8',
    className,
  )} />
));
Prose.displayName = 'Prose';

const headingSizes = {
  xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl',
  '2xl': 'text-2xl', '3xl': 'text-3xl', '4xl': 'text-4xl', '5xl': 'text-5xl', '6xl': 'text-6xl',
  page: 'text-3xl md:text-4xl', section: 'text-2xl md:text-3xl', publicTitle: 'text-3xl sm:text-4xl', hero: 'sm:text-3xl md:text-5xl lg:text-6xl',
} as const;
const headingTones = { foreground: 'text-foreground', muted: 'text-muted-foreground', soft: 'text-foreground-soft', error: 'text-status-error', hard: 'text-feedback-hard', good: 'text-feedback-good', easy: 'text-feedback-easy' } as const;
const headingWeights = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' } as const;
export const Heading = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: keyof typeof headingSizes;
  weight?: keyof typeof headingWeights;
  tone?: keyof typeof headingTones;
}>(({ as: Component = 'h2', size, weight, tone, className, ...props }, ref) => (
  <Component ref={ref} {...props} className={cn(size && headingSizes[size], weight && headingWeights[weight], tone && headingTones[tone], className)} />
));
Heading.displayName = 'Heading';
