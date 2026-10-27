import prisma from '../../../prisma_client';
import { ownedCollection, ownedProblem, withUser } from '../../lib/server/api';
import { idSchema, problemSchema } from '../../lib/server/validation';

export default withUser('PUT', async (req, res) => {
  const id = idSchema.parse(req.query.problemId);
  const data = problemSchema.parse(req.body);
  await ownedProblem(id, req.appUser.id);
  await ownedCollection(data.collectionId, req.appUser.id);
  const problem = await prisma.problem.update({
    where: { id, collection: { userId: req.appUser.id } }, data,
  });
  return res.status(200).json(problem);
});
