/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CollectionModal from '@/components/app/CollectionModal';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
const mockMutate = jest.fn();
let mockMutationOptions: any;
jest.mock('@/firebaseConfig', () => ({ auth: { currentUser: { getIdToken: async () => 'fixture-token' } } }));
jest.mock('@/auth/AuthContext', () => ({ AuthContext: require('react').createContext({ user: { email: 'buttons@example.test' } }) }));
jest.mock('@/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn(() => { throw new Error('Unexpected service request'); }) }));
jest.mock('react-query', () => ({
  useQuery: () => ({ data: { membershipType: 'lifetime', collections: [] }, isLoading: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: (_fn: unknown, options: unknown) => { mockMutationOptions = options; return { mutate: mockMutate }; },
}));

it('keeps collection creation disabled until named and sends the existing mutation payload', async () => {
  const close = jest.fn();
  render(<CollectionModal isOpen onClose={close} showToast={jest.fn()} />);
  const create = screen.getByRole('button', { name: 'Create' });
  expect(create).toBeDisabled();
  fireEvent.click(create);
  expect(mockMutate).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Algorithms' } });
  expect(create).toBeEnabled();
  fireEvent.click(create);
  await waitFor(() => expect(mockMutate).toHaveBeenCalledWith({ title: 'Algorithms', userEmail: 'buttons@example.test', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fixture-token' } }));
  expect(mockMutate).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled();
  act(() => mockMutationOptions.onSettled());
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(mockMutate).toHaveBeenCalledTimes(1);
  expect(authenticatedFetch).not.toHaveBeenCalled();
});

it('preserves edit initialization, native form submission, and scoped Escape dismissal', async () => {
  const close = jest.fn();
  render(<CollectionModal isOpen isEditMode collectionToEdit={{ id: 2, title: 'Graphs' }} onClose={close} showToast={jest.fn()} />);
  expect(screen.getByRole('textbox')).toHaveValue('Graphs');
  expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
  fireEvent.submit(screen.getByRole('textbox').closest('form')!);
  await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Graphs' })));
  act(() => mockMutationOptions.onSettled());
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(close).toHaveBeenCalledTimes(1);
  expect(authenticatedFetch).not.toHaveBeenCalled();
});
