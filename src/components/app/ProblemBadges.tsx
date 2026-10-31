import * as React from 'react';
import { CircleIcon, SparklesIcon, BookOpenIcon, CheckCircleIcon } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type ProblemBadgeProps = Omit<BadgeProps, 'asChild' | 'children'> & { value: string };
const colorFor = (colors: Record<string, string>, value: string) => Object.hasOwn(colors, value) ? colors[value] : fallback;
const fallback = 'text-muted-foreground bg-badge-background border-border';
const difficultyColors: Record<string, string> = {
  easy: 'text-difficulty-easy bg-difficulty-easy-background border-difficulty-easy-border hover:text-difficulty-easy-hover',
  medium: 'text-difficulty-medium bg-difficulty-medium-background border-difficulty-medium-border hover:text-difficulty-medium-hover',
  hard: 'text-difficulty-hard bg-difficulty-hard-background border-difficulty-hard-border hover:text-difficulty-hard-hover',
};
const studyColors: Record<string, string> = {
  new: 'text-study-new bg-study-new-background border-study-new-border hover:text-study-new-hover',
  learning: 'text-study-learning bg-study-learning-background border-study-learning-border hover:text-study-learning-hover',
  relearning: 'text-study-learning bg-study-learning-background border-study-learning-border hover:text-study-learning-hover',
  review: 'text-study-review-foreground bg-study-review-background border-study-review-border hover:text-study-review-hover',
};

export const DifficultyBadge = React.forwardRef<HTMLSpanElement, ProblemBadgeProps>(
  ({ value, foreground, className, ...props }, ref) => <Badge ref={ref} {...props} className={cn(colorFor(difficultyColors, value.toLowerCase()), foreground && 'text-foreground', className)}>
    <span aria-hidden="true" className="material-icons mr-1.5 fill-current" style={{ fontSize: '12px' }}>circle</span>{value}
  </Badge>
);
DifficultyBadge.displayName = 'DifficultyBadge';

export const StudyStateBadge = React.forwardRef<HTMLSpanElement, ProblemBadgeProps>(
  ({ value, foreground, className, ...props }, ref) => {
    const state = value.toLowerCase();
    const Icon = state === 'new' ? SparklesIcon : state === 'learning' || state === 'relearning' ? BookOpenIcon : state === 'review' ? CheckCircleIcon : CircleIcon;
    return <Badge ref={ref} {...props} className={cn(colorFor(studyColors, state), foreground && 'text-foreground', className)}>
      <Icon aria-hidden="true" size={14} className="mr-1.5" />{value}
    </Badge>;
  }
);
StudyStateBadge.displayName = 'StudyStateBadge';
