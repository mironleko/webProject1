import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from "@auth0/nextjs-auth0/client";

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
const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.textContent = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};
const Matches: React.FC = () => {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  const [isCreator, setIsCreator] = useState(false);
  const [inputScores, setInputScores] = useState<{ [key: number]: { competitor1Score: string, competitor2Score: string } }>({});
  const { user, error, isLoading } = useUser();

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
      fetch(`/api/getCompetition?id=${id}`)
        .then((response) => response.json())
        .then(async (data) => {
          setIsCreator(data.isCreator);
        });
    }
  }, [id, user, isLoading]);
  

  const handleScoreChange = (matchId: number, competitor: 'competitor1' | 'competitor2', score: string) => {
    setInputScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${competitor}Score`]: score
      }
    }));
  };
  const handleGenerateLink = () => {
    const link = `${window.location.origin}/ViewOnlyMatches?id=${id}`;
    copyToClipboard(link);
    alert('View-only link copied to clipboard!');
  };
  const handleMatchUpdate = async (matchId: number) => {
    const scores = inputScores[matchId];
    if (!scores) return;

    const response = await fetch(`/api/updateMatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matchId,
        scores
      }),
    });

    const data = await response.json();
    if (data.success) {
      router.reload();
    } else {
      alert('Error updating match result.');
    }
  };

  if (loading) return <div className="text-center mt-10 text-xl">Loading...</div>;
  if (!isCreator) {
    return (
      <div className="text-center text-xl">
        Unauthorized: You don&apos;t have permission to view this page.
      </div>
    );
  }
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
                <input 
    type="number" 
    className="score-input border rounded-md px-2 py-1"
    value={inputScores[match.idMatch]?.competitor1Score !== undefined ? inputScores[match.idMatch]?.competitor1Score : (match.competitor1Score !== null ? match.competitor1Score : '')} 
    onChange={(e) => handleScoreChange(match.idMatch, 'competitor1', e.target.value)} 
/>
<span className="score-dash mx-2">-</span>
<input 
    type="number" 
    className="score-input border rounded-md px-2 py-1"
    value={inputScores[match.idMatch]?.competitor2Score !== undefined ? inputScores[match.idMatch]?.competitor2Score : (match.competitor2Score !== null ? match.competitor2Score : '')} 
    onChange={(e) => handleScoreChange(match.idMatch, 'competitor2', e.target.value)} 
/>
                <button onClick={() => handleMatchUpdate(match.idMatch)} className="ml-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                    {match.isPlayed ? 'Update Score' : 'Set Score'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-4">
        <button
          onClick={handleGenerateLink}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate View-Only Link
        </button>
      </div>
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

export default Matches;
