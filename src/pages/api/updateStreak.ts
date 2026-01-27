import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma_client';

/**
 * Streak Update Logic (Calendar-Day Based):
 * 
 * The streak system works on LOCAL calendar days, not a fixed time window.
 * Users have until the END of the next day to continue their streak.
 * 
 * Rule A — Same day action
 *   If localDate === lastStreakDate → ignore (already did activity today)
 * 
 * Rule B — Consecutive day action
 *   If localDate === lastStreakDate + 1 day → increment streak
 * 
 * Rule C — Missed a day
 *   If localDate > lastStreakDate + 1 day → reset streak to 1
 * 
 * Example:
 *   - Activity on Jan 24 at 7am → streak = 5
 *   - More activity on Jan 24 at 9pm → ignored, already counted
 *   - Activity on Jan 25 at any time → streak = 6 (consecutive)
 *   - No activity on Jan 26
 *   - Activity on Jan 27 → streak resets to 1 (missed Jan 26)
 * 
 * Activity Calendar:
 *   Uses localDate (from frontend) to mark the user's LOCAL day as active,
 *   ensuring late-night or early-morning actions mark the correct calendar day.
 */

// Helper function to calculate the difference in days between two date strings (YYYY-MM-DD)
function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1 + 'T00:00:00.000Z');
  const date2 = new Date(dateStr2 + 'T00:00:00.000Z');
  const diffTime = date1.getTime() - date2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail, localDate } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }

  if (!localDate) {
    return res.status(400).json({ error: 'Local date is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse localDate string (e.g., "2026-01-17") into a Date object at midnight UTC
    // This ensures the ActivityDay record reflects the USER'S local date, not server time
    const localDateObj = new Date(localDate + 'T00:00:00.000Z');

    // Always upsert an ActivityDay for the user's LOCAL date (tracks activity regardless of streak)
    // Wrapped in try-catch because Prisma's upsert with @db.Date can have race conditions
    try {
      await prisma.activityDay.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: localDateObj,
          },
        },
        update: {}, // No-op if already exists
        create: {
          userId: user.id,
          date: localDateObj,
        },
      });
    } catch (error: any) {
      // Ignore unique constraint errors - record already exists
      if (error.code !== 'P2002') {
        throw error;
      }
      // P2002 means record exists, which is fine - continue
    }

    let newCurrentStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    if (!user.lastStreakDate) {
      // First ever streak action
      newCurrentStreak = 1;
    } else if (localDate === user.lastStreakDate) {
      // Rule A: Same day - already did activity today, ignore
      return res.status(200).json({
        message: 'Already did activity today',
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastStreakDate: user.lastStreakDate,
        status: 'done_today',
      });
    } else {
      // Different day - check if consecutive
      const daysDiff = getDaysDifference(localDate, user.lastStreakDate);

      if (daysDiff === 1) {
        // Rule B: Consecutive day (exactly 1 day after last activity)
        newCurrentStreak = user.currentStreak + 1;
      } else if (daysDiff > 1) {
        // Rule C: Missed at least one day, reset streak
        newCurrentStreak = 1;
      } else {
        // daysDiff < 0 means localDate is before lastStreakDate (shouldn't happen normally)
        // Just ignore this case
        return res.status(200).json({
          message: 'Date inconsistency detected',
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastStreakDate: user.lastStreakDate,
          status: 'error',
        });
      }
    }

    // Update longest streak if current exceeds it
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    await prisma.user.update({
      where: { email: userEmail },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: localDate, // Store the user's local date string
      },
    });

    return res.status(200).json({
      message: 'Streak updated successfully',
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastStreakDate: localDate,
      status: 'updated',
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return res.status(500).json({ error: 'Failed to update streak' });
  }
}
