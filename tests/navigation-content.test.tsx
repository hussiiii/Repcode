/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { GuideContents } from '@/components/home/GuideContents';
import NavBar from '@/components/home/NavBar';
import SideBar from '@/components/app/SideBar';
import CollectionCards from '@/components/app/CollectionCards';
import { SidebarProvider } from '@/auth/SidebarContext';
import { formatProblemContent } from '@/lib/problem-content';

jest.mock('@/firebaseConfig', () => ({ auth: { currentUser: null } }));
jest.mock('firebase/auth', () => ({ signOut: jest.fn() }));
jest.mock('@/auth/AuthContext', () => ({ AuthContext: require('react').createContext({ user: { email: 'navigation@example.test', displayName: 'Test User' } }) }));
jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/app/main', push: jest.fn() }) }));
jest.mock('@/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn(() => { throw new Error('Unexpected request'); }) }));
jest.mock('react-query', () => ({
  useQuery: (key: any) => ({ data: key[0] === 'collections' ? [] : { membershipType: 'lifetime' }, isLoading: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn(), clear: jest.fn() }),
  useMutation: () => ({ mutate: jest.fn(), isLoading: false }),
}));

it('opens mobile navigation with associated expanded state, closes on Escape, and restores toggle focus', () => {
  render(<NavBar />);
  const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const content = document.getElementById(toggle.getAttribute('aria-controls')!)!;
  const guide = within(content).getByRole('link', { name: 'Guide' });
  guide.focus();
  fireEvent.keyDown(guide, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
  fireEvent.click(toggle);
  const github = within(document.getElementById(toggle.getAttribute('aria-controls')!)!).getByRole('link', { name: 'GitHub' });
  expect(github).toHaveAttribute('target', '_blank');
  fireEvent.click(github);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

it('keeps sidebar navigation named and current while collapsing and expanding the account details', () => {
  render(<SidebarProvider><SideBar /></SidebarProvider>);
  const trigger = screen.getByRole('button', { name: 'Expand sidebar' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('link', { name: 'Collections' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('target', '_blank');
  expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Sign out' })).toBeVisible();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
});

it('opens collection creation through controlled React state and closes it without a hidden DOM trigger', async () => {
  function Fixture() {
    const [open, setOpen] = useState(false);
    return <><button onClick={() => setOpen(true)}>New collection from header</button><CollectionCards createOpen={open} onCreateOpenChange={setOpen} /></>;
  }
  render(<Fixture />);
  expect(document.getElementById('add-collection-button')).toBeNull();
  const launcher = screen.getByRole('button', { name: 'New collection from header' });
  launcher.focus();
  fireEvent.click(launcher);
  expect(screen.getByRole('dialog', { name: 'Create New Collection' })).toBeVisible();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() => expect(launcher).toHaveFocus());
});

it('preserves imported problem text, links, and code while normalizing nested code wrappers and colors', () => {
  const formatted = formatProblemContent('<p style="color: red;">Explain <a href="/guide">this</a>.</p><pre><code>&lt;value&gt; &amp; 1</code></pre>');
  const container = document.createElement('div'); container.innerHTML = formatted;
  expect(container.querySelector('pre')?.textContent).toBe('<value> & 1');
  expect(container.querySelector('pre code')).toBeNull();
  expect(container.querySelector('a')).toHaveAttribute('href', '/guide');
  expect(formatted).toContain('rgb(var(--foreground)/1)');
});

it('uses keyboard-operable collapsible guide contents with working section links', () => {
  render(<GuideContents mobile />);
  const toggle = screen.getByRole('button', { name: /Guide Contents/ });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('navigation', { name: 'Guide contents' })).not.toBeInTheDocument();
  fireEvent.click(toggle);
  const contents = screen.getByRole('navigation', { name: 'Guide contents' });
  expect(within(contents).getByRole('link', { name: 'What is Repcode?' })).toHaveAttribute('href', '#what-is-repcode');
  expect(within(contents).getByRole('link', { name: 'Part 2.2: How the Algorithm Works' })).toHaveAttribute('href', '#how-algorithm-works');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
