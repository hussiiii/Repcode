import prisma from '../../../prisma_client';
import { ownedProblem, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('DELETE', async (req, res) => {
  const id = idSchema.parse(req.query.problemId);
  await ownedProblem(id, req.appUser.id);
  await prisma.problem.delete({ where: { id, collection: { userId: req.appUser.id } } });
  return res.status(200).json({ message: 'Problem deleted successfully' });
});
