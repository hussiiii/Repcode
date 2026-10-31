/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

it('defaults actions to type=button and avoids accidentally submitting an enclosing form', () => {
  const submit = jest.fn(event => event.preventDefault());
  const click = jest.fn();
  render(<form onSubmit={submit}><Button onClick={click}>Open editor</Button></form>);
  fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});

it('preserves explicit submit buttons and their form payload', () => {
  const submit = jest.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><input name="title" defaultValue="Algorithms" /><Button type="submit" name="action" value="save">Save</Button></form>);
  const button = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(button);
  expect(submit).toHaveBeenCalledTimes(1);
  expect(button).toHaveAttribute('name', 'action');
  expect(button).toHaveAttribute('value', 'save');
  expect(new FormData(button.closest('form')!).get('title')).toBe('Algorithms');
});

it.each(['disabled', 'loading'] as const)('%s actions cannot run twice', state => {
  const click = jest.fn();
  const parent = jest.fn();
  render(<div onClick={parent}><Button variant="dialog" {...{ [state]: true }} onClick={click}>Saving...</Button></div>);
  const button = screen.getByRole('button', { name: 'Saving...' });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(click).not.toHaveBeenCalled();
  if (state === 'loading') expect(button).toHaveAttribute('aria-busy', 'true');
});

it('updates busy state without replacing custom progress content', () => {
  const { rerender } = render(<Button loading><span role="status">Saving changes</span></Button>);
  expect(screen.getByRole('status')).toHaveTextContent('Saving changes');
  rerender(<Button>Save changes</Button>);
  expect(screen.getByRole('button')).toBeEnabled();
  expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
});

it('forwards refs and accessible icon labels to native buttons', () => {
  const ref = React.createRef<HTMLButtonElement>();
  render(<Button ref={ref} variant="close" aria-label="Close dialog"><svg /></Button>);
  expect(ref.current).toBe(screen.getByRole('button', { name: 'Close dialog' }));
  ref.current!.focus();
  expect(ref.current).toHaveFocus();
});

it('composes link actions without nesting interactive elements or changing navigation attributes', () => {
  const parent = jest.fn();
  const child = jest.fn(event => event.preventDefault());
  const { container } = render(<Button asChild variant="marketing" onClick={parent}><a href="/login" target="_blank" rel="noopener noreferrer" onClick={child}>Launch App</a></Button>);
  const link = screen.getByRole('link', { name: 'Launch App' });
  expect(container.querySelector('button')).toBeNull();
  expect(link).toHaveAttribute('href', '/login');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(link).not.toHaveAttribute('type');
  fireEvent.click(link);
  expect(child).toHaveBeenCalledTimes(1);
  expect(parent).toHaveBeenCalledTimes(1);
});

it.each(['disabled', 'loading'] as const)('%s links suppress both child and parent handlers and keyboard activation', state => {
  const parent = jest.fn(); const child = jest.fn(); const key = jest.fn();
  render(<Button asChild {...{ [state]: true }} onClick={parent}><a href="/login" onClick={child} onKeyDown={key}>Launch App</a></Button>);
  const link = screen.getByRole('link', { name: 'Launch App' });
  expect(link).toHaveAttribute('aria-disabled', 'true');
  expect(link).toHaveAttribute('tabindex', '-1');
  expect(fireEvent.click(link)).toBe(false);
  expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(false);
  expect(fireEvent.keyDown(link, { key: ' ' })).toBe(false);
  expect(child).not.toHaveBeenCalled(); expect(parent).not.toHaveBeenCalled(); expect(key).not.toHaveBeenCalled();
});

it('preserves event propagation decisions made by callers', () => {
  const navigate = jest.fn(); const edit = jest.fn();
  render(<div onClick={navigate}><Button onClick={event => { event.stopPropagation(); edit(); }}>Edit collection</Button></div>);
  fireEvent.click(screen.getByRole('button', { name: 'Edit collection' }));
  expect(edit).toHaveBeenCalledTimes(1);
  expect(navigate).not.toHaveBeenCalled();
});
