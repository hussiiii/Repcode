import prisma from '../../../prisma_client';
import { ApiError } from '../../auth/Authenticate';
import { ownedProblem, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('POST', async (req, res) => {
  const id = idSchema.parse(req.body?.problemId);
  const problem = await ownedProblem(id, req.appUser.id);
  if (problem.type !== 'Review') throw new ApiError(400, 'Manual lapse is only available for Review problems');
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.appUser.id },
    select: { maximumInterval: true, minimumEase: true, relearnSteps: true },
  });
  const maxIntervalMinutes = user.maximumInterval * 24 * 60;
  const steps = user.relearnSteps.split(' ').map(step => {
    const value = parseInt(step.slice(0, -1), 10);
    return step.endsWith('m') ? value : value * 24 * 60;
  });
  const interval = steps[0] ?? 10;
  const dueDate = new Date(Date.now() + interval * 60 * 1000);
  const updated = await prisma.problem.update({
    where: { id, collection: { userId: req.appUser.id } },
    data: {
      type: 'Relearning', stepIndex: 0,
      ease: Math.max(problem.ease - 0.2, user.minimumEase),
      lapses: problem.lapses + 1, againCount: problem.againCount + 1,
      relearnInterval: Math.min(problem.interval, maxIntervalMinutes),
      interval, dueDate, originalDueDate: dueDate,
    },
  });
  return res.status(200).json(updated);
});
