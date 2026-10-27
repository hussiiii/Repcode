import nookies from 'nookies';

export function setSessionCookie(token: string) {
  nookies.set(undefined, 'token', token, {
    path: '/',
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  });
}

export function clearSessionCookie() {
  nookies.destroy(undefined, 'token', { path: '/' });
}
