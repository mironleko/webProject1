  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/router';
  import Link from 'next/link';
  import { useUser } from "@auth0/nextjs-auth0/client";

  const CreateCompetition: React.FC = () => {
    const [name, setName] = useState('');
    const [competitors, setCompetitors] = useState('');
    const [scoringSystem, setScoringSystem] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // Added for storing scoring system errors
    const router = useRouter();
    const { user, error, isLoading } = useUser();
    const [competitorsError, setCompetitorsError] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
      if (!user) {
          router.replace('/');
      }
    }, [user, router]);

    const isScoringSystemValid = (): boolean => {
      return /^\d+\/\d+\/\d+$/.test(scoringSystem);
    };
    const areCompetitorsValid = (competitorsArray: string[]) => {
      const regex = /^[a-zA-Z0-9\s]+$/;

      const allNamesValid = competitorsArray.every(name => regex.test(name));

      const validCount = competitorsArray.length >= 4 && competitorsArray.length <= 8;

      return allNamesValid && validCount;
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        setNameError("Name is required.");
        return;
      } else {
        setNameError('');
      }
      if (!isScoringSystemValid()) {
        setErrorMessage("Please enter a valid scoring system format (e.g. 3/1/0).");
        return;
      }

      const competitorsArray = competitors.split(/,|\n/).map(c => c.trim()).filter(Boolean);
      if (!areCompetitorsValid(competitorsArray)) {
        setCompetitorsError('Invalid competitors format or number. Ensure names are separated by commas or new lines and you have between 4 to 8 competitors.');
        return;
      }

      const response = await fetch('/api/createCompetition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          competitors: competitorsArray,
          scoringSystem,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/matches?id=${data.competition.idCompetition}`);
      } else {
        alert('Greška prilikom kreiranja natjecanja.');
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Kreiraj Natjecanje</h1>
          <form onSubmit={handleSubmit}>
          <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Naziv natjecanja:</label>
    <input
      type="text"
      value={name}
      onChange={(e) => {
        setName(e.target.value);
        if (nameError) setNameError(''); 
      }}
      className="w-full p-2 border rounded"
    />
    {nameError && <p className="text-red-500 text-sm mt-2">{nameError}</p>}
  </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Natjecatelji (odvojeni zarezom ili novim redom):</label>
              <textarea
                rows={5}
                value={competitors}
                onChange={(e) => {
                  setCompetitors(e.target.value);
                  if (competitorsError) setCompetitorsError('');
                }}
                className="w-full p-2 border rounded"
              />
              {competitorsError && <p className="text-red-500 text-sm mt-2">{competitorsError}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sustav bodovanja (npr. 3/1/0):</label>
              <input
                type="text"
                value={scoringSystem}
                onChange={(e) => {
                  setScoringSystem(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full p-2 border rounded"
              />
              {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            </div>
            <div className="mb-4">
              <button 
                type="submit" 
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Kreiraj
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <button 
              onClick={() => router.push('/competitions')}
              className="text-blue-500 hover:underline"
            >
              View All Competitions
            </button>
          </div>
          <div className="text-center">
            <Link href="api/auth/logout" legacyBehavior>
              <a className="text-blue-500 hover:underline">Logout</a>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  export default CreateCompetition;
