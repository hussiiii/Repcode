import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { authenticatedFetch } from '../lib/authenticatedFetch';
import { clearSessionCookie, setSessionCookie } from './sessionCookie';

/** Complete database provisioning before navigating to a protected page. */
export async function completeSignIn() {
  try {
    const response = await authenticatedFetch('/api/createUser', { method: 'POST' });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Unable to prepare your account. Please try again.');
    }
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in again');
    setSessionCookie(await user.getIdToken());
  } catch (error) {
    clearSessionCookie();
    // Do not leave a valid page cookie behind when account provisioning failed.
    await signOut(auth).catch(() => undefined);
    throw error;
  }
}
