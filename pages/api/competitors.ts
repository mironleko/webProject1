// pages/api/competitors.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Competition id is required' });
    }

    try {
      const competitors = await prisma.competitor.findMany({
        where: {
            idCompetition: Number(id),
        },
        select: {
          idCompetitor: true,
          competitorName: true,
          points: true,
        },
      });

      res.status(200).json(competitors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch competitors' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
