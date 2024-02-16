import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req:any, res:any) {
  if (req.method === 'DELETE') {
    const { problemId } = req.query;
    try {
      await prisma.problem.delete({
        where: { id: parseInt(problemId) },
      });
      res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete problem' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}