import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';

export default withUser('GET', async (req, res) => {
  const collections = await prisma.collection.findMany({ where: { userId: req.appUser.id } });
  return res.status(200).json(collections);
});
