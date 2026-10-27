import { z } from 'zod';
import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

export default withUser('GET', async (req, res) => {
  const year = z.number().int().min(1900).max(9999).parse(
    req.query.year === undefined ? new Date().getFullYear() : idSchema.parse(req.query.year)
  );
  const days = await prisma.activityDay.findMany({
    where: {
      userId: req.appUser.id,
      date: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
    },
    select: { date: true }, orderBy: { date: 'asc' },
  });
  const activeDates = days.map(day => day.date.toISOString().slice(0, 10));
  return res.status(200).json({ year, activeDates, totalActiveDays: activeDates.length });
});
