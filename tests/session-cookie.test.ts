/* eslint-env jest */
jest.mock('nookies', () => ({ set: jest.fn(), destroy: jest.fn() }));

import nookies from 'nookies';
import { setSessionCookie, clearSessionCookie } from '../src/auth/sessionCookie';

afterEach(() => { Reflect.deleteProperty(globalThis, 'window'); });

test('page cookies use HTTPS protection and SameSite, and logout actually expires them', () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true, value: { location: { protocol: 'https:' } },
  });
  setSessionCookie('page-token');
  clearSessionCookie();
  expect(nookies.set).toHaveBeenCalledWith(undefined, 'token', 'page-token', {
    path: '/', sameSite: 'lax', secure: true,
  });
  expect(nookies.destroy).toHaveBeenCalledWith(undefined, 'token', { path: '/' });
});
