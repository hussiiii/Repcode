import prisma from '../../../prisma_client';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Manual Lapse API
 * Applies the same lapse logic as ProblemsQueue when "Again" is clicked on a Review problem:
 * - type → Relearning, stepIndex → 0
 * - ease decreased by 0.20 (clamped to minimumEase)
 * - lapses +1, againCount +1
 * - relearnInterval = min(current interval, maxInterval)
 * - interval = first relearn step
 * - dueDate/originalDueDate = now + interval
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { problemId } = req.body;

  if (!problemId) {
    return res.status(400).json({ error: 'problemId is required' });
  }

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { collection: true },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (problem.type !== 'Review') {
      return res.status(400).json({
        error: 'Manual lapse is only available for Review problems',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: problem.collection.userId },
      select: {
        maximumInterval: true,
        minimumEase: true,
        relearnSteps: true,
      },
    });

    const maxInterval = user?.maximumInterval ?? 180;
    const minimumEase = user?.minimumEase ?? 1.3;
    const relearnStepsStr = user?.relearnSteps ?? '10m';

    const maxIntervalMinutes = maxInterval * 24 * 60;

    const relearnStepsArray = relearnStepsStr.split(' ').map((step: string) => {
      const value = parseInt(step.slice(0, -1));
      const unit = step.slice(-1);
      return unit === 'm' ? value : value * 24 * 60;
    });

    const firstRelearnStepMinutes = relearnStepsArray[0] ?? 10;

    const newEase =
      problem.ease - 0.2 >= minimumEase ? problem.ease - 0.2 : minimumEase;
    const newRelearnInterval = Math.min(problem.interval, maxIntervalMinutes);
    const newInterval = firstRelearnStepMinutes;

    const now = new Date();
    const newDueDate = new Date(
      now.getTime() + newInterval * 60 * 1000
    );

    const updatedProblem = await prisma.problem.update({
      where: { id: problemId },
      data: {
        type: 'Relearning',
        stepIndex: 0,
        ease: newEase,
        lapses: (problem.lapses ?? 0) + 1,
        againCount: (problem.againCount ?? 0) + 1,
        relearnInterval: newRelearnInterval,
        interval: newInterval,
        dueDate: newDueDate,
        originalDueDate: newDueDate,
      },
    });

    return res.status(200).json(updatedProblem);
  } catch (error) {
    console.error('Manual lapse failed:', error);
    return res.status(500).json({ error: 'Failed to manually lapse problem' });
  }
}
