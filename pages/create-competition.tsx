// pages/create-competition.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const CreateCompetition: React.FC = () => {
  const [name, setName] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [scoringSystem, setScoringSystem] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const competitorsArray = competitors.split(/,|\n/).map(c => c.trim()).filter(Boolean);
    if (competitorsArray.length < 4 || competitorsArray.length > 8) {
      alert('Broj natjecatelja mora biti između 4 i 8.');
      return; // Exit the function
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
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Natjecatelji (odvojeni zarezom ili novim redom):</label>
            <textarea
              rows={5}
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sustav bodovanja (npr. 3/1/0):</label>
            <input
              type="text"
              value={scoringSystem}
              onChange={(e) => setScoringSystem(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <button 
              type="submit" 
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Kreiraj
            </button>
          </div>
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
        </form>
      </div>
    </div>
  );
};

export default CreateCompetition;
