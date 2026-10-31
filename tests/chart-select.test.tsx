/** @jest-environment jsdom */
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import StatsCharts from '@/components/app/StatsCharts';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
jest.mock('@/auth/AuthContext', () => ({ AuthContext: require('react').createContext({ user: { email: 'charts@example.test' } }) }));
jest.mock('@/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn(() => { throw new Error('Unexpected service request'); }) }));
jest.mock('react-query', () => ({ useQuery: (key: string[]) => ({ data: key[0] === 'collections' ? [{ id: 1, title: 'Algorithms' }] : [{ id: 1, collectionId: 1, interval: 1440, lapses: 1, creationDate: '2026-10-01', dueDate: '2026-10-27', againCount: 1, hardCount: 2, goodCount: 3, easyCount: 4 }], isLoading: false }) }));
jest.mock('chart.js', () => ({ Chart: { register: jest.fn() } }));
jest.mock('chartjs-adapter-date-fns', () => ({}));
jest.mock('react-chartjs-2', () => ({ Bar: () => <div data-testid="bar">Bar</div>, Scatter: () => <div data-testid="scatter">Scatter</div>, Doughnut: () => <div data-testid="donut">Donut</div> }));

beforeAll(() => {
  const css = fs.readFileSync(path.join(process.cwd(), 'src/styles/globals.css'), 'utf8');
  const style = document.createElement('style');
  style.textContent = ':root {' + (css.match(/:root\s*\{([\s\S]*?)\n  \}/)?.[1] || '') + '}';
  document.head.append(style);
});

async function choose(name: string) {
  fireEvent.keyDown(screen.getByRole('combobox', { name: 'Chart type' }), { key: 'ArrowDown' });
  fireEvent.keyDown(await screen.findByRole('option', { name }), { key: 'Enter' });
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false'));
}
it('connects chart selection to the actual chart and retains each chart’s chosen view mode', async () => {
  render(<StatsCharts />);
  expect(screen.getByRole('heading', { name: 'By Collection' })).toBeInTheDocument();
  await choose('By Interval Size');
  expect(screen.getByRole('heading', { name: 'By Interval Size' })).toBeInTheDocument();
  expect(screen.getByTestId('bar')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'Individual' }));
  expect(screen.getByTestId('scatter')).toBeInTheDocument();
  await choose('By Collection');
  expect(screen.getByTestId('bar')).toBeInTheDocument();
  await choose('By Interval Size');
  expect(screen.getByTestId('scatter')).toBeInTheDocument();
  expect(authenticatedFetch).not.toHaveBeenCalled();
});
