/** @jest-environment jsdom */
/* eslint-env jest */
jest.mock('../src/firebaseConfig', () => ({ auth: {} }));
jest.mock('../firebaseAdmin', () => ({ __esModule: true, default: {} }));
jest.mock('../src/auth/completeSignIn', () => ({ completeSignIn: jest.fn() }));
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(), signInWithPopup: jest.fn(), setPersistence: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(), signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(), sendEmailVerification: jest.fn(), signOut: jest.fn(),
}));

const React = require('react');
const { render, fireEvent, screen, waitFor, act } = require('@testing-library/react');
const { useRouter } = require('next/router');
const { signInWithPopup, setPersistence } = require('firebase/auth');
const { completeSignIn } = require('../src/auth/completeSignIn');
const Login = require('../src/pages/login').default;

const push = jest.fn();
beforeEach(() => {
  useRouter.mockReturnValue({ push });
  push.mockResolvedValue(true);
  completeSignIn.mockResolvedValue(undefined);
});

test('Google sign-in opens its popup directly from the click and waits for provisioning before navigation', async () => {
  const events = [];
  let resolvePopup;
  signInWithPopup.mockImplementation(() => {
    events.push('popup');
    return new Promise(resolve => { resolvePopup = resolve; });
  });
  setPersistence.mockImplementation(async () => { events.push('persistence'); });
  completeSignIn.mockImplementation(async () => { events.push('provision'); });
  push.mockImplementation(async url => { events.push('navigate:' + url); return true; });
  render(<Login />);
  const button = screen.getByRole('button', { name: /continue with google/i });
  fireEvent.click(button);
  expect(events).toEqual(['popup']);
  expect(button).toBeDisabled();
  await act(async () => { resolvePopup({}); });
  await waitFor(() => expect(push).toHaveBeenCalledWith('/app/main'));
  expect(events).toEqual(['popup', 'provision', 'navigate:/app/main']);
});

test('Google sign-in shows provisioning failures instead of navigating into the app', async () => {
  signInWithPopup.mockResolvedValue({});
  completeSignIn.mockRejectedValue(new Error('Account unavailable'));
  render(<Login />);
  fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));
  expect(await screen.findByText('Account unavailable')).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: /continue with google/i })).toBeEnabled();
});
