import { auth } from '../firebaseConfig';

/** Attach a current Firebase token only to our own API, never an external URL. */
export async function authenticatedFetch(input: string, init: RequestInit = {}) {
  if (!input.startsWith('/api/')) throw new Error('Expected a Repcode API URL');
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to continue');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers, cache: 'no-store', redirect: 'error' });
}
