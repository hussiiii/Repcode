import prisma from '../../../prisma_client';
import { ownedCollection, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('GET', async (req, res) => {
  const id = idSchema.parse(req.query.collectionId);
  await ownedCollection(id, req.appUser.id);
  const problems = await prisma.problem.findMany({
    where: { collectionId: id, collection: { userId: req.appUser.id } },
  });
  return res.status(200).json(problems);
});
