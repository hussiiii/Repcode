import { Heading } from './typography';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const variants = cva('', { variants: { variant: {
  default: 'relative w-full rounded-lg border border-border bg-surface p-4 text-foreground',
  plain: '', error: 'text-foreground p-8',
  inlineError: 'text-xs text-status-error',
  loginError: 'text-status-error',
  critical: 'p-4 bg-status-critical/10 border border-status-critical/30 rounded-lg',
  feedbackError: 'p-3 bg-status-error-background border border-status-error-border rounded-md',
  attention: 'flex items-start bg-surface/50 p-4 rounded-lg border border-status-attention/20',
  marketingSuccess: 'bg-marketing-feedback-success/10 border border-marketing-feedback-success/30 rounded-lg p-4',
  marketingError: 'bg-marketing-feedback-error/10 border border-marketing-feedback-error/30 rounded-lg p-4',
  importWarning: 'flex items-start bg-status-import-error-background/30 p-3 rounded-lg border border-status-error/30',
  note: 'flex items-start bg-surface/50 p-3 rounded-lg border border-status-attention/20',
  overdue: 'bg-status-overdue/10 border-l-4 border-l-status-overdue p-4 mb-4 rounded flex items-start gap-3 [&_.material-icons]:text-status-overdue [&_.material-icons]:shrink-0',
  guideReminder: 'bg-gradient-to-r from-reminder-end/20 to-chart-series-yellow/20 border-l-4 border-reminder-end p-4 rounded-r-lg',
  guideInfo: 'bg-gradient-to-r from-action/10 to-foreground/10 p-5 border-l-4 border-action rounded-r-lg',
  guideAction: 'bg-action/5 border-l-4 border-action p-4 rounded-r-lg',
  guideDefinition: 'bg-gradient-to-r from-action/5 to-foreground/5 p-6 rounded-lg border-l-4 border-action',
  guideTechnique: 'bg-foreground/5 rounded-lg p-5 border-l-4 border-foreground',
} }, defaultVariants: { variant: 'default' } });
export const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof variants>>(
  ({ className, variant, role = 'alert', ...props }, ref) => <div ref={ref} role={role} className={cn(variants({ variant }), className)} {...props} />
);
Alert.displayName = 'Alert';
export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <Heading as="h5" weight="medium" ref={ref} className={cn('mb-1 leading-none tracking-tight', className)} {...props} />
);
AlertTitle.displayName = 'AlertTitle';
export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('text-sm', className)} {...props} />
);
AlertDescription.displayName = 'AlertDescription';
