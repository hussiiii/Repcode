import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';

export default withUser('PUT', async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.appUser.id }, data: { newUser: false }, select: { newUser: true },
  });
  return res.status(200).json(user);
});
