import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Competition ID is required' });
    }
    const competition = await prisma.competition.findUnique({
      where: { idCompetition: Number(id) },
      include: {
        creator: true,
      },
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const session = await getSession(req, res);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const isCreator = session.user.sub === competition.creator.auth0Id;

    return res.status(200).json({ competition, isCreator });
  } else {
    res.status(405).end();
  }
};
