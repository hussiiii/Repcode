import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';
import { collectionSchema } from '../../lib/server/validation';

export default withUser('POST', async (req, res) => {
  const { title } = collectionSchema.parse(req.body);
  const images = ['pattern1.svg', 'pattern2.svg', 'pattern3.svg', 'pattern4.svg'];
  const collection = await prisma.collection.create({
    data: { title, userId: req.appUser.id, image: images[Math.floor(Math.random() * images.length)] },
  });
  return res.status(200).json(collection);
});
