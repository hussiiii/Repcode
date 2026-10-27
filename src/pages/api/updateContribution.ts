import prisma from "../../../prisma_client";
import { startOfYear, differenceInCalendarDays } from 'date-fns';
import { withUser } from '../../lib/server/api';

export default withUser('POST', async (req, res) => {
    try {
      // Fetch the user and their current contribution history
      const user = await prisma.user.findUnique({
        where: { id: req.appUser.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let contributionHistory: any = user.contributionHistory || {};

      // Get the current time and adjust it by the local timezone offset
      const now = new Date();
      const offset = now.getTimezoneOffset(); // This gives the offset in minutes from UTC
      const localTime = new Date(now.getTime() - offset * 60 * 1000); // Adjust to local time

      const currentYear = localTime.getFullYear();

      // Calculate the day of the year using local time
      const startOfYearLocal = startOfYear(localTime);
      const dayOfYear = differenceInCalendarDays(localTime, startOfYearLocal);

      // If there's no contribution array for the current year, initialize it
      if (!contributionHistory[currentYear]) {
        contributionHistory[currentYear] = isLeapYear(currentYear) ? Array(366).fill(0) : Array(365).fill(0);
      }

      // Increment the contribution count for today in local time
      contributionHistory[currentYear][dayOfYear] += 1;

      // Update the user record in the database
      await prisma.user.update({
        where: { id: req.appUser.id },
        data: { contributionHistory },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to update contribution history:', error);
      res.status(500).json({ error: 'Failed to update contribution history' });
    }
});

// Helper function to check if a year is a leap year
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};
