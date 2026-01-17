import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma_client';

/**
 * Streak Update Logic:
 * 
 * Rule A — Only increment once per day (using user's local date)
 *   If localDate === lastStreakDate → don't increment
 *   BUT still update lastStreakAction (so 36hr countdown resets on every action)
 * 
 * Rule B — Continue streak if within 36 hours
 *   If now - lastStreakAction ≤ 36h → continue streak (increment by 1)
 * 
 * Rule C — Reset streak if > 36 hours
 *   If now - lastStreakAction > 36h → reset to 1
 * 
 * Also tracks longest streak ever achieved.
 * 
 * Activity Calendar:
 *   Uses localDate (from frontend) to mark the user's LOCAL day as active,
 *   ensuring late-night or early-morning actions mark the correct calendar day.
 */

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
        lastStreakAction: true,
        lastStreakDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const lastAction = user.lastStreakAction ? new Date(user.lastStreakAction) : null;
    
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
    let shouldUpdate = false;

    // Check if same day using LOCAL date string comparison (timezone-safe!)
    const isSameDay = localDate === user.lastStreakDate;

    if (!lastAction) {
      // First ever streak action
      newCurrentStreak = 1;
      shouldUpdate = true;
    } else if (isSameDay) {
      // Rule A: Already did a streak action today (same local calendar day), don't increment
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
        lastStreakDate: user.lastStreakDate,
        updated: false,
      });
    } else {
      // Different day - check 36hr window
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
          lastStreakDate: localDate, // Store the user's local date string
        },
      });
    }

    return res.status(200).json({
      message: 'Streak updated successfully',
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastStreakAction: now,
      lastStreakDate: localDate,
      updated: shouldUpdate,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return res.status(500).json({ error: 'Failed to update streak' });
  }
}
