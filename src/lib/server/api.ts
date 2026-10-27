import type { NextApiResponse } from 'next';
import prisma from '../../../prisma_client';
import { ApiError, AuthenticatedRequest, withAuth } from '../../auth/Authenticate';

export type UserRequest = AuthenticatedRequest & {
  appUser: { id: number; email: string };
};

export function withUser(
  method: string,
  handler: (req: UserRequest, res: NextApiResponse) => unknown | Promise<unknown>
) {
  return withAuth(method, async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: { id: true, email: true },
    });
    if (!user) throw new ApiError(404, 'User not found. Please sign in again.');
    const userRequest = req as UserRequest;
    userRequest.appUser = user;
    return handler(userRequest, res);
  });
}

export async function ownedCollection(id: number, userId: number) {
  const collection = await prisma.collection.findFirst({ where: { id, userId } });
  if (!collection) throw new ApiError(404, 'Collection not found');
  return collection;
}

export async function ownedProblem(id: number, userId: number) {
  const problem = await prisma.problem.findFirst({
    where: { id, collection: { userId } },
  });
  if (!problem) throw new ApiError(404, 'Problem not found');
  return problem;
}
