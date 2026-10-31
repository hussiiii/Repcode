/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/pages/app/study/dashboard';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

jest.mock('../firebaseAdmin', () => ({ __esModule: true, default: {} }));
jest.mock('@/firebaseConfig', () => ({ auth: { currentUser: null } }));
jest.mock('@/auth/AuthContext', () => ({ AuthContext: require('react').createContext({ user: { email: 'help@example.test' } }) }));
jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn(() => { throw new Error('Unexpected request'); }) }));
jest.mock('@/components/layout/app-shell', () => ({ AppShell: ({ children }: any) => <main>{children}</main> }));
jest.mock('@/components/app/BarGraphWeek', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/app/BarGraphMonth', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/app/StatsCharts', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/app/StreakCalendar', () => ({ __esModule: true, default: () => null }));
jest.mock('react-query', () => ({ useQuery: (key: any) => ({ isLoading: false, data: key[0] === 'userSettings'
  ? { currentStreak: 4, lastStreakDate: '2026-10-28' }
  : [{ id: 1, name: 'Two Sum', difficulty: 'Easy', type: 'Review', dueDate: '2026-10-01T00:00:00Z', againCount: 1, hardCount: 0, goodCount: 2, easyCount: 1 }] }) }));

const help = [
  ['About daily streaks', /Do activity .* on consecutive days to build your streak\./],
  ['About estimated study time', /Calculated estimate based on the difficulty and type/],
  ['About total reviews', /Giving feedback to a problem in Study Mode increments this\./],
  ['About activity calendar', /Tracks all the days you had any kind of activity/],
] as const;

test.each(help)('%s exposes its real dashboard help on focus and dismisses on Escape', async (name, description) => {
  render(<Dashboard />);
  const trigger = screen.getByRole('button', { name });
  expect(trigger).toHaveAttribute('type', 'button');
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  act(() => trigger.focus());
  expect(await screen.findByRole('tooltip')).toHaveTextContent(description);
  expect(trigger).toHaveAccessibleDescription(description);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
  expect(authenticatedFetch).not.toHaveBeenCalled();
});

it('retains pointer hover help and closes it when the pointer leaves', async () => {
  render(<Dashboard />);
  const trigger = screen.getByRole('button', { name: 'About estimated study time' });
  fireEvent.pointerMove(trigger, { pointerType: 'mouse' });
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Calculated estimate');
  const leave = new MouseEvent('pointerleave', { clientX: -100, clientY: -100 });
  Object.defineProperty(leave, 'pointerType', { value: 'mouse' });
  fireEvent(trigger, leave);
  fireEvent(document, new MouseEvent('pointermove', { bubbles: true, clientX: 200, clientY: 200 }));
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
});
