import React from 'react';
import { cn } from '@/lib/utils';
import { CircleIcon, SparklesIcon, BookOpenIcon, CheckCircleIcon } from "lucide-react";

type BadgeProps = {
  type: 'difficulty' | 'problemType';
  value: string;
  className?: string;
};

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-difficulty-easy bg-difficulty-easy-background border-difficulty-easy-border hover:text-difficulty-easy-hover';
      case 'medium':
        return 'text-difficulty-medium bg-difficulty-medium-background border-difficulty-medium-border hover:text-difficulty-medium-hover';
      case 'hard':
        return 'text-difficulty-hard bg-difficulty-hard-background border-difficulty-hard-border hover:text-difficulty-hard-hover';
      default:
        return 'text-muted-foreground bg-badge-background border-border';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new':
        return 'text-study-new bg-study-new-background border-study-new-border hover:text-study-new-hover';
      case 'learning':
        return 'text-study-learning bg-study-learning-background border-study-learning-border hover:text-study-learning-hover';
      case 'relearning':
        return 'text-study-learning bg-study-learning-background border-study-learning-border hover:text-study-learning-hover';
      case 'review':
        return 'text-study-review-foreground bg-study-review-background border-study-review-border hover:text-study-review-hover';
      default:
        return 'text-muted-foreground bg-badge-background border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new':
        return <SparklesIcon size={14} className="mr-1.5" />;
      case 'learning':
      case 'relearning':
        return <BookOpenIcon size={14} className="mr-1.5" />;
      case 'review':
        return <CheckCircleIcon size={14} className="mr-1.5" />;
      default:
        return <CircleIcon size={14} className="mr-1.5" />;
    }
  };

  const baseClasses = "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border transition-all duration-400";
  const colorClasses = type === 'difficulty' ? getDifficultyColor(value) : getTypeColor(value);
  
  return (
    <span
      className={cn(baseClasses, colorClasses, className)}
    >
      {type === 'difficulty' ? (
        <span className="material-icons mr-1.5 fill-current" style={{ fontSize: '12px' }}>circle</span>
      ) : (
        getTypeIcon(value)
      )}
      {value}
    </span>
  );
};

export default Badge;
