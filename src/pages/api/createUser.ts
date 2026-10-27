import prisma from '../../../prisma_client';
import { withAuth } from '../../auth/Authenticate';

export default withAuth('POST', async (req, res) => {
  const where = { email: req.user.email };
  const select = { id: true, email: true, newUser: true };
  try {
    const user = await prisma.user.upsert({ where, create: where, update: {}, select });
    return res.status(200).json(user);
  } catch (error) {
    // MySQL can race when two first-login requests create the same unique email.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const user = await prisma.user.findUniqueOrThrow({ where, select });
      return res.status(200).json(user);
    }
    throw error;
  }
});
