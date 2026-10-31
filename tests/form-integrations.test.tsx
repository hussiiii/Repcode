/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render as renderView, screen, waitFor } from '@testing-library/react';
import { Toaster } from '@/components/ui/toast';
import { dismissToast } from '@/components/ui/use-toast';
const render = (ui: React.ReactElement) => renderView(<>{ui}<Toaster /></>);
import Settings from '@/components/app/Settings';
import ProblemModal from '@/components/app/ProblemModal';
import RandomProblemModal from '@/components/app/RandomProblemModal';
import ProblemsList from '@/components/app/ProblemsList';
import ContactForm from '@/components/home/ContactForm';
import ReportBugModal from '@/components/app/ReportBugModal';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

const mockMutate = jest.fn();
const mockSend = jest.fn(event => event.preventDefault());
let mockFormState = { succeeded: false, submitting: false, errors: null as unknown };
const mockSettings = { id: 1, membershipType: 'lifetime', learnSteps: '10m 1d', relearnSteps: '10m', graduatingInterval: 1, easyInterval: 4, relearnGraduatingInterval: 1, maximumInterval: 36500, startingEase: 2.5, easyBonus: 1.3, intervalModifier: 1, overdueWarningThreshold: 1, hasApiKey: true };
const mockCollections = [{ id: 1, title: 'Algorithms', newCount: 1, learningCount: 0, reviewCount: 0 }, { id: 2, title: 'Graphs', newCount: 0, learningCount: 0, reviewCount: 1 }];
const mockProblems = [{ id: 1, name: 'Two Sum', difficulty: 'Easy', type: 'New', dueDate: '2026-10-27', interval: 1 }];
jest.mock('@/firebaseConfig', () => ({ auth: { currentUser: { getIdToken: async () => 'fixture-token' } } }));
jest.mock('@/auth/AuthContext', () => ({ AuthContext: require('react').createContext({ user: { email: 'forms@example.test' } }) }));
jest.mock('@/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn(() => { throw new Error('Unexpected service request'); }) }));
jest.mock('next/router', () => ({ useRouter: () => ({ query: { collectionId: '1' }, push: jest.fn() }) }));
jest.mock('@formspree/react', () => ({ useForm: () => [mockFormState, mockSend] }));
jest.mock('react-query', () => ({
  useQuery: (key: string[]) => ({ data: queryData(key), isLoading: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: () => ({ mutate: mockMutate }),
}));
function queryData(key: string[]) {
  const name = key[0];
  if (/userSettings/i.test(name)) return mockSettings;
  if (/collections/i.test(name)) return mockCollections;
  if (/collectionDetails/i.test(name) && key.length > 2) return mockProblems;
  if (/collectionDetails/i.test(name)) return { ...mockCollections[0], problems: mockProblems };
  if (/problemCount/i.test(name)) return 1;
  if (/problem/i.test(name)) return mockProblems;
  return mockSettings;
}
beforeEach(() => { mockFormState = { succeeded: false, submitting: false, errors: null }; });
afterEach(() => { expect(authenticatedFetch).not.toHaveBeenCalled(); act(() => dismissToast()); });

it('preserves settings edits while showing/hiding an API key and omits a blank replacement', () => {
  render(<Settings />);
  fireEvent.change(screen.getByLabelText('Starting Ease'), { target: { value: '2.7' } });
  const key = screen.getByLabelText('OpenAI API Key');
  expect(key).toHaveAttribute('type', 'password');
  fireEvent.click(screen.getByRole('button', { name: 'Show API key' }));
  expect(key).toHaveAttribute('type', 'text');
  expect(screen.getByLabelText('Starting Ease')).toHaveValue('2.7');
  fireEvent.click(screen.getByRole('button', { name: 'Hide API key' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ startingEase: 2.7, learnSteps: '10m 1d' }));
  expect(mockMutate.mock.calls[0][0]).not.toHaveProperty('apiKey');
});

it('retains API-key replacement and explicit removal behavior', () => {
  const { unmount } = render(<Settings />);
  fireEvent.change(screen.getByLabelText('OpenAI API Key'), { target: { value: '  fixture-replacement  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Show API key' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'fixture-replacement' }));
  unmount(); mockMutate.mockClear();
  render(<Settings />);
  fireEvent.click(screen.getByRole('button', { name: 'Remove saved key' }));
  expect(mockMutate).toHaveBeenCalledWith({ apiKey: null });
});

it('keeps settings validation from submitting invalid values', () => {
  render(<Settings />);
  fireEvent.change(screen.getByLabelText('Learning Steps'), { target: { value: 'invalid' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(mockMutate).not.toHaveBeenCalled();
  expect(screen.getByText(/Learning Steps and Relearning Steps must/)).toBeInTheDocument();
});

it('keeps problem field values, language, difficulty and mutation payloads intact', async () => {
  render(<ProblemModal isOpen collectionId={1} onClose={jest.fn()} showToast={jest.fn()} />);
  const submit = screen.getByRole('button', { name: 'Create' });
  expect(submit).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Manual Entry' }));
  fireEvent.change(screen.getByRole('textbox', { name: /^Name/ }), { target: { value: 'Two Sum' } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Question/ }), { target: { value: 'Find two numbers.' } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Solution/ }), { target: { value: 'return [0, 1]' } });
  fireEvent.change(screen.getByRole('combobox', { name: /Programming Language/ }), { target: { value: 'python' } });
  fireEvent.change(screen.getByRole('textbox', { name: /Additional Notes/ }), { target: { value: 'Use a map.' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Hard' }));
  expect(screen.getByRole('radio', { name: 'Hard' })).toBeChecked();
  expect(submit).toBeEnabled();
  fireEvent.click(submit);
  await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Two Sum', question: 'Find two numbers.', solution: 'return [0, 1]', language: 'python', difficulty: 'Hard', notes: 'Use a map.', collectionId: 1 })));
});

it('selects and deselects collections without double toggles and keeps bulk selection working', () => {
  render(<RandomProblemModal isOpen onClose={jest.fn()} />);
  const checkboxes = screen.getAllByRole('checkbox');
  expect(checkboxes).toHaveLength(2);
  checkboxes.forEach(box => expect(box).toBeChecked());
  fireEvent.click(checkboxes[0]);
  expect(checkboxes[0]).not.toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Deselect All' }));
  checkboxes.forEach(box => expect(box).not.toBeChecked());
  expect(screen.getByRole('button', { name: /Solve/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Select All' }));
  checkboxes.forEach(box => expect(box).toBeChecked());
  expect(screen.getByRole('button', { name: /Solve/ })).toBeEnabled();
});

it('keeps problem search and clearing the search connected to the rendered list', () => {
  render(<ProblemsList collectionId={1} />);
  expect(screen.getByText('Two Sum')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search problems' }), { target: { value: 'not a problem' } });
  expect(screen.getByText('No problems found matching your search.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByText('Two Sum')).toBeInTheDocument();
});

it('preserves contact field names, browser validation and the existing submit handler', () => {
  const { container } = render(<ContactForm />);
  const form = container.querySelector('form')!;
  expect(form.checkValidity()).toBe(false);
  for (const [label, value] of [['First Name', 'Test'], ['Last Name', 'Person'], ['Email', 'test@example.test'], ['Details', 'A fixture message']]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  expect(form.checkValidity()).toBe(true);
  expect(Object.fromEntries(new FormData(form))).toEqual({ firstname: 'Test', lastname: 'Person', email: 'test@example.test', details: 'A fixture message' });
  fireEvent.submit(form);
  expect(mockSend).toHaveBeenCalledTimes(1);
});

it('retains bug-report text and its hidden classification field', () => {
  const { container } = render(<ReportBugModal isOpen onClose={jest.fn()} />);
  fireEvent.change(screen.getByRole('textbox', { name: /Bug Description/ }), { target: { value: 'A fixture bug report' } });
  const data = new FormData(screen.getByRole('textbox', { name: /Bug Description/ }).closest('form')!);
  expect(data.get('description')).toBe('A fixture bug report');
  expect(data.get('type')).toBeTruthy();
});


it('keeps labels and radio groups independent when create and edit forms are both mounted', () => {
  render(<><ProblemModal isOpen collectionId={1} onClose={jest.fn()} /><ProblemModal isOpen collectionId={1} isEditMode problemToEdit={{ id: 2, name: 'Graphs', question: 'Question', solution: 'Solution', difficulty: 'Medium', language: 'java', notes: '', link: '', functionSignature: '' }} onClose={jest.fn()} /></>);
  fireEvent.click(screen.getAllByRole('button', { name: 'Manual Entry', hidden: true })[0]);
  const names = screen.getAllByLabelText(/^Name/);
  expect(names).toHaveLength(2);
  expect(names[0].id).not.toBe(names[1].id);
  expect((names[0] as HTMLInputElement).labels![0].htmlFor).toBe(names[0].id);
  expect((names[1] as HTMLInputElement).labels![0].htmlFor).toBe(names[1].id);
  const groups = screen.getAllByRole('radiogroup', { hidden: true });
  expect(groups[0].getAttribute('aria-labelledby')).not.toBe(groups[1].getAttribute('aria-labelledby'));
});


it('keeps contact submission errors visible through the shared FieldError', () => {
  mockFormState = { succeeded: false, submitting: false, errors: { form: 'Fixture failure' } };
  render(<ContactForm />);
  expect(screen.getByRole('alert')).toHaveTextContent('There was an error submitting the form. Please try again.');
});

it('removes collapsed manual-entry controls from access, preserves values, and submits them while collapsed', async () => {
  render(<ProblemModal isOpen collectionId={1} onClose={jest.fn()} />);
  const trigger = screen.getByRole('button', { name: 'Manual Entry' });
  expect(trigger.tagName).toBe('BUTTON');
  expect(trigger).toHaveAttribute('type', 'button');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('textbox', { name: /^Name/ })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/^Question/)).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const content = document.getElementById(trigger.getAttribute('aria-controls')!)!;
  expect(content).toContainElement(screen.getByRole('textbox', { name: /^Name/ }));
  fireEvent.change(screen.getByRole('textbox', { name: /^Name/ }), { target: { value: 'Graphs' } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Question/ }), { target: { value: 'Find a path.' } });
  fireEvent.change(screen.getByRole('textbox', { name: /^Solution/ }), { target: { value: 'dfs()' } });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('textbox', { name: /^Name/ })).not.toBeInTheDocument();
  expect(document.querySelector('input[placeholder="Enter the name of the problem"]')).toBeNull();
  fireEvent.click(trigger);
  expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('Graphs');
  expect(screen.getByRole('textbox', { name: /^Question/ })).toHaveValue('Find a path.');
  expect(mockMutate).not.toHaveBeenCalled();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Graphs', question: 'Find a path.', solution: 'dfs()', collectionId: 1 })));
});

it('starts manual entry expanded when editing a problem', () => {
  render(<ProblemModal isOpen collectionId={1} isEditMode problemToEdit={{ id: 2, name: 'Graphs', question: 'Find a path.', solution: 'dfs()', difficulty: 'Medium', language: 'java', notes: '', link: '', functionSignature: '' }} onClose={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'Manual Entry' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('Graphs');
});
