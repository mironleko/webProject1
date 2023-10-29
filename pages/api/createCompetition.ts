import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { name, competitors, scoringSystem } = req.body;

    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name,
        auth0Id: session.user.sub,
      },
    });

    const [win, draw, lose] = scoringSystem.split('/').map(Number);

    const createdSystemScoring = await prisma.systemScoring.create({
      data: {
        win_points: win,
        draw_points: draw,
        lose_points: lose,
      },
    });

    const competition = await prisma.competition.create({
      data: {
        competitionName: name,
        creatorId: user.id,
        idSystemScoring: createdSystemScoring.idSystemScoring,
      },
    });

    const competitorRecords = competitors.map((competitorName: string) => ({
      competitorName,
      idCompetition: competition.idCompetition,
    }));
    await prisma.competitor.createMany({
      data: competitorRecords,
    });

    const relatedCompetitors = await prisma.competitor.findMany({
      where: {
        idCompetition: competition.idCompetition,
      },
    });

    const matches = [];
    const totalCompetitors = relatedCompetitors.length;

    if (totalCompetitors % 2 !== 0) {
        relatedCompetitors.push({ idCompetitor: -1, competitorName: "Dummy", idCompetition: competition.idCompetition,points:0 });
    }

    const numRounds = relatedCompetitors.length - 1;
    const half = relatedCompetitors.length / 2;

    for (let round = 0; round < numRounds; round++) {
        for (let i = 0; i < half; i++) {
            const competitor1 = relatedCompetitors[i];
            const competitor2 = relatedCompetitors[numRounds - i];

            if (competitor1.idCompetitor !== -1 && competitor2.idCompetitor !== -1) {
                matches.push({
                    idCompetition: competition.idCompetition,
                    competitor1Id: competitor1.idCompetitor,
                    competitor2Id: competitor2.idCompetitor,
                    roundNumber: round + 1,
                });
            }
        }
        relatedCompetitors.splice(1, 0, relatedCompetitors.pop()!);
    }

    await prisma.match.createMany({
        data: matches,
    });

    res.status(201).json({ success: true, competition });
  } else {
    res.status(405).end();
  }
};
