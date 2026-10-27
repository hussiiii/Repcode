import prisma from '../../../prisma_client';
import { withUser } from '../../lib/server/api';
import { settingsSchema } from '../../lib/server/validation';

export default withUser('PUT', async (req, res) => {
  const settings = settingsSchema.parse(req.body?.settings);
  await prisma.user.update({
    where: { id: req.appUser.id },
    data: { ...settings, ...(settings.apiKey === '' ? { apiKey: null } : {}) },
    select: { id: true },
  });
  return res.status(200).json({ success: true });
});
