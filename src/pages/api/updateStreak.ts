import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma_client';

/**
 * Streak Update Logic:
 * 
 * Rule A — Only increment once per day
 *   If the last streak action was today (same calendar day) → don't increment
 *   BUT still update lastStreakAction (so 36hr countdown resets on every action)
 * 
 * Rule B — Continue streak if within 36 hours
 *   If now - lastStreakAction ≤ 36h → continue streak (increment by 1)
 * 
 * Rule C — Reset streak if > 36 hours
 *   If now - lastStreakAction > 36h → reset to 1
 * 
 * Also tracks longest streak ever achieved.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastStreakAction: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const lastAction = user.lastStreakAction ? new Date(user.lastStreakAction) : null;
    
    // Get today's date at midnight UTC (for ActivityDay tracking)
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    // Always upsert an ActivityDay for today (tracks activity regardless of streak)
    // Wrapped in try-catch because Prisma's upsert with @db.Date can have race conditions
    try {
      await prisma.activityDay.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        update: {}, // No-op if already exists
        create: {
          userId: user.id,
          date: today,
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
    let shouldUpdate = false;

    if (!lastAction) {
      // First ever streak action
      newCurrentStreak = 1;
      shouldUpdate = true;
    } else {
      // Check if last action was today (same calendar day in user's local context)
      const isSameDay = (
        now.getFullYear() === lastAction.getFullYear() &&
        now.getMonth() === lastAction.getMonth() &&
        now.getDate() === lastAction.getDate()
      );

      if (isSameDay) {
        // Rule A: Already did a streak action today, don't increment
        // But still update lastStreakAction so 36hr countdown resets
        console.log('[updateStreak] Same day action - resetting countdown to now:', now);
        
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            lastStreakAction: now,
          },
        });

        return res.status(200).json({
          message: 'Streak already counted for today, but countdown reset',
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastStreakAction: now,
          updated: false,
        });
      }

      // Calculate hours since last action
      const hoursSinceLastAction = (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastAction <= 36) {
        // Rule B: Within grace window, continue streak
        newCurrentStreak = user.currentStreak + 1;
        shouldUpdate = true;
      } else {
        // Rule C: More than 36 hours, reset streak
        newCurrentStreak = 1;
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      // Update longest streak if current exceeds it
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      await prisma.user.update({
        where: { email: userEmail },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastStreakAction: now,
        },
      });
    }

    return res.status(200).json({
      message: 'Streak updated successfully',
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastStreakAction: now,
      updated: shouldUpdate,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return res.status(500).json({ error: 'Failed to update streak' });
  }
}

