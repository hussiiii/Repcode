import prisma from "../../../prisma_client"; 
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userEmail } = req.query;

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail as string,
        },
        select: {
          id: true, 
          membershipType: true, 
          subscriptionStart: true, 
          subscriptionEnd: true, 
          collections: true, 
          learnSteps: true,
          relearnSteps: true,
          relearnGraduatingInterval: true,
          graduatingInterval: true,
          easyInterval: true,
          startingEase: true,
          minimumEase: true,
          easyBonus: true,
          intervalModifier: true,
          maximumInterval: true,
          maximumNewPerDay: true,
          apiKey: true,
          contributionHistory: true,
          overdueWarningThreshold: true,
          currentStreak: true,
          longestStreak: true,
          lastStreakAction: true,
          lastStreakDate: true,
        },
      });

      // Check if user was found
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log("CALLED: /getUserSettings"); 
      return res.status(200).json(user);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return res.status(500).json({ error: 'Failed to fetch user info' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
