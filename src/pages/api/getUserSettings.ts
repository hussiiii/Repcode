import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';

export default withUser('GET', async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.appUser.id },
    select: {
      id: true, membershipType: true, subscriptionStart: true, subscriptionEnd: true,
      collections: true, learnSteps: true, relearnSteps: true, relearnGraduatingInterval: true,
      graduatingInterval: true, easyInterval: true, startingEase: true, minimumEase: true,
      easyBonus: true, intervalModifier: true, maximumInterval: true, maximumNewPerDay: true,
      apiKey: true, contributionHistory: true, overdueWarningThreshold: true,
      currentStreak: true, longestStreak: true, lastStreakAction: true, lastStreakDate: true,
    },
  });
  const { apiKey, ...settings } = user;
  return res.status(200).json({ ...settings, hasApiKey: !!apiKey?.trim() && apiKey !== 'null' });
});
