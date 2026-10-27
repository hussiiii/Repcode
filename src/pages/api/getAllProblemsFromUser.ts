import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';

export default withUser('GET', async (req, res) => {
  const problems = await prisma.problem.findMany({
    where: { collection: { userId: req.appUser.id } },
  });
  return res.status(200).json(problems);
});
