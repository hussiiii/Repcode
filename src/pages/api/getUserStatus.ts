import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';

export default withUser('GET', async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.appUser.id }, select: { newUser: true },
  });
  return res.status(200).json(user);
});
