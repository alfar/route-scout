import React, { useEffect, useState } from 'react';
import { TeamCard } from '../components/TeamCard';
import { CreateTeamForm } from '../components/CreateTeamForm';
import { useTranslation } from 'react-i18next';
import { TeamSummary } from '../types/TeamSummary';
import { trailerSizes } from '../components/TeamInfoPage';

export default function TeamsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { t } = useTranslation(['common']);
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
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{t('routesTab')}</h2>
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => setShowCreate(s => !s)}>
          {showCreate ? t('close') : t('add')}
        </button>
      </div>
      {showCreate && <CreateTeamForm onCreated={loadTeams} />}
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
