import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TeamSummary } from './features/teams/types/TeamSummary';

export function TeamApp() {
  const { id } = useParams();
  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/teams/${id}`);
        if (!res.ok) {
          setError('Team not found');
          setTeam(null);
        } else {
          const data = await res.json();
          setTeam(data);
          setError(null);
        }
      } catch (e) {
        setError('Failed to load team');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="p-6 flex flex-col gap-4 max-w-xl mx-auto">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {team && !loading && !error && (
        <div className="border rounded p-4 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">{team.name}</h2>
          <div className="text-sm text-gray-700 mb-4">Trailer Size: {team.trailerSize}</div>
          <div className="mb-4">Leader: <span className="font-medium">{team.leaderName}</span> ({team.leaderPhone})</div>
          <div>
            <h3 className="font-semibold mb-1">Members</h3>
            <ul className="list-disc ml-6">
              {team.members.map(m => <li key={m}>{m}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
