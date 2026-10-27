import prisma from '../../../prisma_client';
import { ownedProblem, withUser } from '../../lib/server/api';
import { idSchema, reviewUpdatesSchema } from '../../lib/server/validation';

export default withUser('POST', async (req, res) => {
  const id = idSchema.parse(req.body?.id);
  const updates = reviewUpdatesSchema.parse(req.body?.updates);
  await ownedProblem(id, req.appUser.id);
  const problem = await prisma.problem.update({
    where: { id, collection: { userId: req.appUser.id } }, data: updates,
  });
  return res.status(200).json(problem);
});
