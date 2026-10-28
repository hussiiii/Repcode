/** @jest-environment jsdom */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

afterEach(cleanup);

test.each([
  ['difficulty', 'Easy', 'difficulty-easy'],
  ['problemType', 'Review', 'study-review'],
  ['problemType', 'New', 'study-new'],
] as const)('explicit foreground overrides the %s %s base text while retaining domain background and hover', (type, value, role) => {
  render(<Badge type={type} value={value} className="text-foreground text-sm" />);
  const badge = screen.getByText(value).closest('span.inline-flex')!;
  expect(badge).toHaveClass('text-foreground', 'text-sm', `bg-${role}-background`, `hover:text-${role}-hover`);
  expect(badge).not.toHaveClass(`text-${role}`);
  expect(badge).not.toHaveClass(`text-${role}-foreground`);
});
