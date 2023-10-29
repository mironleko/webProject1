import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      // Get the user's session
      const session = await getSession(req, res);

      if (!session || !session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Extract the user's auth0 ID from the session
      const auth0Id = session.user.sub;

      // Find the user in your database using the auth0 ID
      const user = await prisma.user.findUnique({
        where: {
          auth0Id: auth0Id,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Fetch competitions for the found user
      const competitions = await prisma.competition.findMany({
        where: {
          creatorId: user.id, // Use the user's ID from your database
        },
        select: {
          idCompetition: true,
          competitionName: true,
        },
      });

      res.status(200).json(competitions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch competitions.' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
