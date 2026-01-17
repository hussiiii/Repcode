import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma_client';

/**
 * Get all activity days for a user within a given year.
 * Returns an array of date strings (YYYY-MM-DD) when the user was active.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail, year } = req.query;

  if (!userEmail || typeof userEmail !== 'string') {
    return res.status(400).json({ error: 'User email is required' });
  }

  const targetYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get start and end of the target year
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const activityDays = await prisma.activityDay.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Convert to array of date strings (YYYY-MM-DD format)
    const activeDates = activityDays.map((day) => {
      const d = new Date(day.date);
      return d.toISOString().split('T')[0];
    });

    return res.status(200).json({
      year: targetYear,
      activeDates,
      totalActiveDays: activeDates.length,
    });
  } catch (error) {
    console.error('Error fetching activity days:', error);
    return res.status(500).json({ error: 'Failed to fetch activity days' });
  }
}

