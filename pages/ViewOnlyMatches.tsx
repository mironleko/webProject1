import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

type MatchType = {
  idMatch: number;
  roundNumber: number;
  isPlayed: boolean;
  competitor1: { idCompetitor: number; competitorName: string };
  competitor2: { idCompetitor: number; competitorName: string };
  competitor1Score: number;
  competitor2Score: number;
};

type CompetitorType = {
  idCompetitor: number;
  competitorName: string;
  points: number;
};

const ViewOnlyMatches: React.FC = () => {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  const fetchData = async () => {
    const responseMatches = await fetch(`/api/matches?id=${id}`);
    const dataMatches: MatchType[] = await responseMatches.json();
    setMatches(dataMatches);

    const responseCompetitors = await fetch(`/api/competitors?id=${id}`);
    const dataCompetitors: CompetitorType[] = await responseCompetitors.json();
    setCompetitors(dataCompetitors);

    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-xl">Loading...</div>;

  const rounds: { [key: number]: MatchType[] } = {};
  matches.forEach((match) => {
    if (!rounds[match.roundNumber]) {
      rounds[match.roundNumber] = [];
    }
    rounds[match.roundNumber].push(match);
  });

  const sortedTable = competitors.sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">All Matches</h1>
      
      {Object.keys(rounds).map((roundNumber) => (
        <div key={roundNumber} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Round {roundNumber}</h2>
          <ul>
            {rounds[Number(roundNumber)].map((match) => (
              <li key={match.idMatch} className="mb-3">
                <span className="font-medium">{match.competitor1.competitorName}</span> vs <span className="font-medium">{match.competitor2.competitorName}</span>
                <div className="mt-2">
                  <span>{match.competitor1Score} - {match.competitor2Score}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="text-xl font-bold mb-4 text-center">Current Table</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Competitor</th>
            <th className="border border-gray-300 p-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedTable.map((competitor) => (
            <tr key={competitor.idCompetitor}>
              <td className="border border-gray-300 p-2">{competitor.competitorName}</td>
              <td className="border border-gray-300 p-2">{competitor.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewOnlyMatches;
