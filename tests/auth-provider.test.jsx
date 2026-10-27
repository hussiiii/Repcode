/** @jest-environment jsdom */
/* eslint-env jest */
jest.mock('../src/firebaseConfig', () => ({
  auth: { currentUser: null, onIdTokenChanged: jest.fn() },
}));
jest.mock('../src/auth/sessionCookie', () => ({
  setSessionCookie: jest.fn(), clearSessionCookie: jest.fn(),
}));

const React = require('react');
const { render, act, screen } = require('@testing-library/react');
const { QueryClient, QueryClientProvider } = require('react-query');
const { auth } = require('../src/firebaseConfig');
const { setSessionCookie, clearSessionCookie } = require('../src/auth/sessionCookie');
const { AuthProvider, AuthContext } = require('../src/auth/AuthContext');

function renderAuthProvider() {
  const seenUsers = [];
  let listener;
  const unsubscribe = jest.fn();
  auth.currentUser = null;
  auth.onIdTokenChanged.mockImplementation(callback => { listener = callback; return unsubscribe; });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const clear = jest.spyOn(client, 'clear');
  function Observer() {
    const { user } = React.useContext(AuthContext);
    React.useEffect(() => { seenUsers.push(user); }, [user]);
    return <span data-testid="auth-user">{user?.uid || 'signed-out'}</span>;
  }
  const view = render(
    <QueryClientProvider client={client}>
      <AuthProvider><Observer /></AuthProvider>
    </QueryClientProvider>
  );
  return {
    client, clear, seenUsers, unsubscribe, unmount: view.unmount,
    begin(user) {
      let pending;
      act(() => { auth.currentUser = user; pending = listener(user); });
      return pending;
    },
    async emit(user) {
      await act(async () => { auth.currentUser = user; await listener(user); });
    },
  };
}

test('a delayed token callback cannot restore the session after logout', async () => {
  const h = renderAuthProvider();
  let finishToken;
  const delayed = new Promise(resolve => { finishToken = resolve; });
  const user = { uid: 'alice', getIdToken: () => delayed };
  const pending = h.begin(user);
  await h.emit(null);
  await act(async () => { finishToken('stale-token'); await pending; });
  expect(setSessionCookie).not.toHaveBeenCalled();
  expect(clearSessionCookie).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('auth-user')).toHaveTextContent('signed-out');
  expect(h.seenUsers).not.toContain(user);
  expect(h.clear).toHaveBeenCalledTimes(2);
  h.unmount();
  expect(h.unsubscribe).toHaveBeenCalledTimes(1);
});

test('account switches clear private query data while routine token refreshes preserve it', async () => {
  const h = renderAuthProvider();
  const alice = { uid: 'alice', getIdToken: async () => 'alice-token' };
  const bob = { uid: 'bob', getIdToken: async () => 'bob-token' };
  await h.emit(alice);
  h.client.setQueryData(['private-data'], 'Alice problem');
  await h.emit(bob);
  expect(h.clear).toHaveBeenCalledTimes(2);
  expect(h.client.getQueryData(['private-data'])).toBeUndefined();
  expect(screen.getByTestId('auth-user')).toHaveTextContent('bob');
  h.client.setQueryData(['private-data'], 'Bob problem');
  await h.emit(bob);
  expect(h.clear).toHaveBeenCalledTimes(2);
  expect(h.client.getQueryData(['private-data'])).toBe('Bob problem');
  h.unmount();
});
