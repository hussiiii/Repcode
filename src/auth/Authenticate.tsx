import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ZodError } from 'zod';
import admin from '../../firebaseAdmin';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export type AuthenticatedRequest = NextApiRequest & {
  user: DecodedIdToken & { email: string };
};

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => unknown | Promise<unknown>;

/** API access uses explicit bearer tokens; the page-rendering cookie is not an API credential. */
export function withAuth(method: string, handler: AuthenticatedHandler): NextApiHandler {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method !== method) {
      res.setHeader('Allow', [method]);
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const authorization = req.headers.authorization;
    const match = typeof authorization === 'string' && /^Bearer (\S+)$/i.exec(authorization);
    if (!match) {
      res.status(401).json({ error: 'Sign in to continue' });
      return;
    }

    let identity: DecodedIdToken;
    try {
      identity = await admin.auth().verifyIdToken(match[1]);
    } catch {
      res.status(401).json({ error: 'Invalid or expired sign-in token' });
      return;
    }

    // Existing database accounts are linked by email, so that email must be verified.
    if (!identity.email || identity.email_verified !== true) {
      res.status(403).json({ error: 'Verify your email before using Repcode' });
      return;
    }

    try {
      const authenticatedRequest = req as AuthenticatedRequest;
      authenticatedRequest.user = { ...identity, email: identity.email };
      await handler(authenticatedRequest, res);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ error: error.message });
      } else if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid request', fields: error.flatten() });
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        res.status(404).json({ error: 'Record not found' });
      } else {
        // Do not log request bodies or database exceptions containing saved credentials.
        console.error('API request failed:', req.method, req.url);
        res.status(500).json({ error: 'Unable to complete the request' });
      }
    }
  };
}
