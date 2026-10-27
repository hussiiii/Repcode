/* eslint-env jest */
jest.mock('../src/firebaseConfig', () => ({
  auth: { currentUser: null, authStateReady: jest.fn() },
}));

const { auth } = require('../src/firebaseConfig');
const { authenticatedFetch } = require('../src/lib/authenticatedFetch');

beforeEach(() => {
  auth.currentUser = null;
  auth.authStateReady.mockResolvedValue(undefined);
});

test('authenticated requests wait for restored auth and attach a current token without dropping headers', async () => {
  const order = [];
  const user = { getIdToken: jest.fn(async () => { order.push('token'); return 'current-token'; }) };
  auth.authStateReady.mockImplementation(async () => { order.push('ready'); auth.currentUser = user; });
  const response = new Response('{}', { status: 200 });
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
    order.push('fetch');
    expect(url).toBe('/api/updateProblemForAlgo');
    expect(options.headers.get('Authorization')).toBe('Bearer current-token');
    expect(options.headers.get('Content-Type')).toBe('application/json');
    expect(options.cache).toBe('no-store');
    expect(options.redirect).toBe('error');
    expect(options.method).toBe('POST');
    expect(options.body).toBe('{"id":100}');
    return response;
  });
  await expect(authenticatedFetch('/api/updateProblemForAlgo', {
    method: 'POST', body: '{"id":100}',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer obsolete-token' },
  })).resolves.toBe(response);
  expect(order).toEqual(['ready', 'token', 'fetch']);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('signed-out requests and external destinations never send credentials', async () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('must not fetch'));
  await expect(authenticatedFetch('/api/getUserSettings')).rejects.toThrow(/sign in/i);
  for (const url of ['https://example.test/api/data', '//example.test/api/data', '/problems.json']) {
    await expect(authenticatedFetch(url)).rejects.toThrow(/Repcode API URL/);
  }
  expect(fetchMock).not.toHaveBeenCalled();
});

test('token refresh failure never falls back to a stale caller-supplied token', async () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(undefined);
  auth.currentUser = { getIdToken: jest.fn().mockRejectedValue(new Error('refresh failed')) };
  await expect(authenticatedFetch('/api/getUserSettings', {
    headers: { Authorization: 'Bearer stale' },
  })).rejects.toThrow(/refresh failed/);
  expect(fetchMock).not.toHaveBeenCalled();
});
