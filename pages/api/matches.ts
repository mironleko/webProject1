import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'idCompetition is required' });
    }

    const matches = await prisma.match.findMany({
      where: {
        idCompetition: Number(id),
      },
      include: {
        competitor1: true,
        competitor2: true,
        competition: true,
      },
    });

    res.status(200).json(matches);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
