/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';

const cases = [
  ['difficulty', DifficultyBadge, 'Easy', 'difficulty-easy'],
  ['difficulty', DifficultyBadge, 'Medium', 'difficulty-medium'],
  ['difficulty', DifficultyBadge, 'Hard', 'difficulty-hard'],
  ['study', StudyStateBadge, 'New', 'study-new'],
  ['study', StudyStateBadge, 'Learning', 'study-learning'],
  ['study', StudyStateBadge, 'Relearning', 'study-learning'],
  ['study', StudyStateBadge, 'Review', 'study-review'],
] as const;

test.each(cases)('%s %s %s keeps its domain background, border, icon and hover appearance', (_kind, Component, value, role) => {
  render(<Component value={value} />);
  const badge = screen.getByText(value).closest('span.inline-flex')!;
  expect(badge).toHaveClass(`bg-${role}-background`, `border-${role}-border`, `hover:text-${role}-hover`);
  expect(badge.querySelector('[aria-hidden="true"]')).not.toBeNull();
});

test.each(cases)('%s %s %s accepts an explicit foreground override and retains domain colors on hover', (_kind, Component, value, role) => {
  render(<Component value={value} className="text-foreground text-sm" />);
  const badge = screen.getByText(value).closest('span.inline-flex')!;
  expect(badge).toHaveClass('text-foreground', 'text-sm', `bg-${role}-background`, `hover:text-${role}-hover`);
  expect(badge).not.toHaveClass(`text-${role}`, `text-${role}-foreground`);
});

it('preserves workspace sizing, foreground props, forwarded refs, case handling, and unknown-value fallback', () => {
  const ref = React.createRef<HTMLSpanElement>();
  const { rerender } = render(<DifficultyBadge ref={ref} value="EASY" size="problem" foreground />);
  expect(ref.current).toHaveClass('py-1.5', 'px-4', 'text-foreground', 'bg-difficulty-easy-background');
  expect(ref.current).toHaveTextContent('EASY');
  rerender(<StudyStateBadge ref={ref} value="Custom" />);
  expect(ref.current).toHaveClass('text-muted-foreground', 'bg-badge-background', 'border-border');
  expect(ref.current).toHaveTextContent('Custom');
});
