import { useEffect, useState } from 'react';
import { TeamSummary } from '../types/TeamSummary';
import { CreateTeamForm } from '../components/CreateTeamForm';
import { TeamCard } from '../components/TeamCard';
import { CollapsiblePanel } from '../components/CollapsiblePanel';

const trailerSizes = ["Small", "Large", "Boogie"];

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTeams() {
    setLoading(true);
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      setTeams(data);
      setError(null);
    } catch (e) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTeams(); }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-blue-700">Teams</h1>
      <CollapsiblePanel title="Create Team" defaultCollapsed={true}>
        <CreateTeamForm onCreated={loadTeams} />
      </CollapsiblePanel>
      <div className="flex flex-col gap-4">
        {loading && <div>Loading teams...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && teams.length === 0 && <div>No teams yet.</div>}
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onChanged={loadTeams} trailerSizes={trailerSizes} />
        ))}
      </div>
    </div>
  );
}
