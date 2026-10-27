import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { User } from 'firebase/auth';
import { clearSessionCookie, setSessionCookie } from './sessionCookie';
import { useQueryClient } from 'react-query';

export const AuthContext = createContext<{ user: User | null }>({ user: null });

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    let revision = 0;
    let previousUid: string | null = null;
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (!active) return;
      const currentRevision = ++revision;
      const nextUid = user?.uid ?? null;
      if (previousUid !== nextUid) {
        // Do not carry cached collection/problem data into another account.
        queryClient.clear();
        setUser(null);
        previousUid = nextUid;
      }
      if (!user) {
        setUser(null);
        clearSessionCookie();
      } else {
        try {
          const token = await user.getIdToken();
          if (!active || revision !== currentRevision || auth.currentUser?.uid !== user.uid) return;
          setSessionCookie(token);
          setUser(user);
        } catch {
          if (!active || revision !== currentRevision) return;
          clearSessionCookie();
          setUser(null);
        }
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    const handle = setInterval(async () => {
      const user = auth.currentUser;
      if (user) await user.getIdToken(true).catch(() => undefined);
    }, 10 * 60 * 1000); // Refresh token every 10 minutes

    return () => clearInterval(handle);
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
