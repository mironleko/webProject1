import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type CompetitionType = {
  idCompetition: number;
  competitionName: string;
};

const Competitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<CompetitionType[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompetitions = async () => {
      const response = await fetch('/api/get-competitions');
      if (response.ok) {
        const data: CompetitionType[] = await response.json();
        setCompetitions(data);
      } else {
        console.error('Failed to fetch competitions');
        setCompetitions([]); // or handle the error in some other way
      }
    };
  
    fetchCompetitions();
  }, []);

  const handleCompetitionClick = (id: number) => {
    router.push(`/matches?id=${id}`);
  };

  const handleBackClick = () => {
    router.push('/create-competition'); // Adjust this to the correct path of your "Create Competition" page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">All Competitions</h1>
        <button 
          onClick={handleBackClick}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Create Competition
        </button>
        <ul>
          {competitions && competitions.map((competition) => (
            <li key={competition.idCompetition} className="mb-2">
              <button 
                onClick={() => handleCompetitionClick(competition.idCompetition)}
                className="text-blue-500 hover:underline"
              >
                {competition.competitionName}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Competitions;
