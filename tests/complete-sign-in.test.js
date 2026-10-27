/* eslint-env jest */
jest.mock('../src/firebaseConfig', () => ({ auth: { currentUser: null } }));
jest.mock('firebase/auth', () => ({ signOut: jest.fn() }));
jest.mock('../src/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn() }));
jest.mock('../src/auth/sessionCookie', () => ({
  setSessionCookie: jest.fn(), clearSessionCookie: jest.fn(),
}));

const { auth } = require('../src/firebaseConfig');
const { signOut } = require('firebase/auth');
const { authenticatedFetch } = require('../src/lib/authenticatedFetch');
const { setSessionCookie, clearSessionCookie } = require('../src/auth/sessionCookie');
const { completeSignIn } = require('../src/auth/completeSignIn');

function arrangeSignIn(response) {
  const events = [];
  auth.currentUser = { getIdToken: jest.fn(async () => { events.push('get-token'); return 'fresh-sign-in-token'; }) };
  authenticatedFetch.mockImplementation(async (url, init) => {
    expect(url).toBe('/api/createUser');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
    events.push('provision-account');
    if (response instanceof Error) throw response;
    return response;
  });
  setSessionCookie.mockImplementation(token => events.push('set-cookie:' + token));
  clearSessionCookie.mockImplementation(() => events.push('clear-cookie'));
  signOut.mockImplementation(async () => { events.push('sign-out'); auth.currentUser = null; });
  return events;
}

test('sign-in provisions the account and writes its cookie before it completes', async () => {
  const events = arrangeSignIn(new Response('{"id":1}', { status: 200 }));
  await completeSignIn();
  expect(events).toEqual(['provision-account', 'get-token', 'set-cookie:fresh-sign-in-token']);
});

test('failed database provisioning surfaces the error and clears the incomplete sign-in', async () => {
  for (const response of [
    new Response('{"error":"Account unavailable"}', { status: 500 }),
    new Error('network unavailable'),
    new Response('not-json', { status: 502 }),
  ]) {
    const events = arrangeSignIn(response);
    await expect(completeSignIn()).rejects.toThrow();
    expect(events).toEqual(['provision-account', 'clear-cookie', 'sign-out']);
    expect(auth.currentUser).toBeNull();
  }
});
