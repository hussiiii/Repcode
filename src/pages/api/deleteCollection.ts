import prisma from '../../../prisma_client';
import { ownedCollection, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('DELETE', async (req, res) => {
  const id = idSchema.parse(req.query.collectionId);
  await ownedCollection(id, req.appUser.id);
  await prisma.$transaction(async tx => {
    await tx.problem.deleteMany({ where: { collectionId: id, collection: { userId: req.appUser.id } } });
    await tx.collection.delete({ where: { id, userId: req.appUser.id } });
  });
  return res.status(200).json({ message: 'Collection and associated problems deleted successfully' });
});
