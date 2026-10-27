import prisma from '../../../prisma_client';
import { ownedCollection, withUser } from '../../lib/server/api';
import { collectionSchema, idSchema } from '../../lib/server/validation';

export default withUser('PUT', async (req, res) => {
  const id = idSchema.parse(req.query.collectionId);
  const { title } = collectionSchema.parse(req.body);
  await ownedCollection(id, req.appUser.id);
  const collection = await prisma.collection.update({
    where: { id, userId: req.appUser.id }, data: { title },
  });
  return res.status(200).json(collection);
});
