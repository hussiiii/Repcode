import prisma from '../../../prisma_client';
import { ApiError } from '../../auth/Authenticate';
import { ownedCollection, ownedProblem, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('POST', async (req, res) => {
  const id = idSchema.parse(req.body?.problemId);
  const targetCollectionId = idSchema.parse(req.body?.targetCollectionId);
  const problem = await ownedProblem(id, req.appUser.id);
  await ownedCollection(targetCollectionId, req.appUser.id);
  if (problem.collectionId === targetCollectionId) throw new ApiError(400, 'Problem is already in that collection');
  const updated = await prisma.problem.update({
    where: { id, collection: { userId: req.appUser.id } }, data: { collectionId: targetCollectionId },
  });
  return res.status(200).json(updated);
});
