import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { matchId, scores } = req.body;

    const match = await prisma.match.findUnique({
      where: { idMatch: matchId },
      include: { competition: { select: { systemScoring: true } } },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { win_points, draw_points, lose_points } = match.competition.systemScoring;

    // Convert scores to integers
    const competitor1Score = scores.competitor1Score !== undefined ? parseInt(scores.competitor1Score, 10) : (match.isPlayed && match.competitor1Score !== null ? match.competitor1Score : 0);
    const competitor2Score = scores.competitor2Score !== undefined ? parseInt(scores.competitor2Score, 10) : (match.isPlayed && match.competitor2Score !== null ? match.competitor2Score : 0);


    let previousCompetitor1Points = 0;
    let previousCompetitor2Points = 0;

    // If the match was previously played, determine the points to be deducted
    // If the match was previously played, determine the points to be deducted
if (match.isPlayed) {
  previousCompetitor1Points = (match.competitor1Score || 0) > (match.competitor2Score || 0) ? win_points : ((match.competitor1Score || 0) < (match.competitor2Score || 0) ? lose_points : draw_points);
  previousCompetitor2Points = (match.competitor2Score || 0) > (match.competitor1Score || 0) ? win_points : ((match.competitor2Score || 0) < (match.competitor1Score || 0) ? lose_points : draw_points);
}

// Determine the new points based on the new match scores
let newCompetitor1Points = competitor1Score > competitor2Score ? win_points : (competitor1Score < competitor2Score ? lose_points : draw_points);
let newCompetitor2Points = competitor2Score > competitor1Score ? win_points : (competitor2Score < competitor1Score ? lose_points : draw_points);

// Calculate the final points after considering the previous points
let finalCompetitor1Points = newCompetitor1Points;
let finalCompetitor2Points = newCompetitor2Points;

if (match.isPlayed) {
  finalCompetitor1Points = newCompetitor1Points - previousCompetitor1Points;
  finalCompetitor2Points = newCompetitor2Points - previousCompetitor2Points;
}

console.log("oduzimanje " + newCompetitor1Points+ " - " + previousCompetitor1Points + "=" + finalCompetitor1Points)
console.log("final" + finalCompetitor1Points)

    // Update match scores
    await prisma.match.update({
      where: { idMatch: matchId },
      data: {
        competitor1Score,
        competitor2Score,
        isPlayed: true,
      },
    });

    // Adjust competitors' points
    const competitor1 = await prisma.competitor.findUnique({ where: { idCompetitor: match.competitor1Id } });
    const competitor2 = await prisma.competitor.findUnique({ where: { idCompetitor: match.competitor2Id } });
    if (!competitor1 || !competitor2) {
      return res.status(404).json({ error: 'Competitor not found' });
  }
    await prisma.competitor.update({
      where: { idCompetitor: match.competitor1Id },
      data: { 
        points: competitor1.points + finalCompetitor1Points
      },
    });

    await prisma.competitor.update({
      where: { idCompetitor: match.competitor2Id },
      data: { 
        points: competitor2.points + finalCompetitor2Points
      },
    });

    res.status(200).json({ success: true });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
