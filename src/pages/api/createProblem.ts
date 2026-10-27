import prisma from '../../../prisma_client';
import { ownedCollection, withUser } from '../../lib/server/api';
import { problemSchema } from '../../lib/server/validation';

export default withUser('POST', async (req, res) => {
  const data = problemSchema.parse(req.body);
  await ownedCollection(data.collectionId, req.appUser.id);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const problem = await prisma.$transaction(async tx => {
    const created = await tx.problem.create({ data: { ...data, dueDate: tomorrow, originalDueDate: tomorrow } });
    await tx.collection.update({
      where: { id: data.collectionId, userId: req.appUser.id }, data: { lastAdded: new Date() },
    });
    return created;
  });
  return res.status(200).json(problem);
});
