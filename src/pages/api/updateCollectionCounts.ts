import prisma from '../../../prisma_client';
import { ownedCollection, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('POST', async (req, res) => {
  const id = idSchema.parse(req.body?.collectionId);
  await ownedCollection(id, req.appUser.id);
  const problems = await prisma.problem.findMany({
    where: { collectionId: id, collection: { userId: req.appUser.id } }, select: { type: true },
  });
  await prisma.collection.update({
    where: { id, userId: req.appUser.id },
    data: {
      newCount: problems.filter(problem => problem.type === 'New').length,
      learningCount: problems.filter(problem => problem.type === 'Learning' || problem.type === 'Relearning').length,
      reviewCount: problems.filter(problem => problem.type === 'Review').length,
    },
  });
  return res.status(200).json({ message: 'Problem counts updated successfully' });
});
