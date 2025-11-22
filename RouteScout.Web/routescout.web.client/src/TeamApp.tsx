import { useEffect, useState } from 'react';
import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TeamSummary } from './features/teams/types/TeamSummary';
import { TeamInfoPage } from './features/teams/components/TeamInfoPage';
import { TeamRoutesPage } from './features/teams/components/TeamRoutesPage';

export function TeamApp() {
    const { id } = useParams();
    const teamId = id || '';
    const [team, setTeam] = useState<TeamSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    async function loadTeam() {
        if (!teamId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/teams/${teamId}`);
            if (!res.ok) {
                setError('Team not found');
                setTeam(null);
            } else {
                const data = await res.json();
                setTeam(data);
                setError(null);
            }
        } catch {
            setError('Failed to load team');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadTeam(); }, [teamId]);

    const isInfo = location.pathname.endsWith('/info');

    return (
        <div className="p-6 flex flex-col gap-4 max-w-4xl mx-auto">
            <div className="flex gap-4 border-b pb-2">
                <Link
                    to={`/teams/${teamId}`} // relative root -> routes page
                    className={`px-4 py-2 rounded-t ${!isInfo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >Routes & Stops</Link>
                <Link
                    to={`/teams/${teamId}/info`}
                    className={`px-4 py-2 rounded-t ${isInfo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >Team Info</Link>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && team && (
                <Routes>
                    <Route path="" element={<TeamRoutesPage teamId={teamId} />} />
                    <Route path="info" element={<TeamInfoPage team={team} onUpdated={loadTeam} teamId={teamId} />} />
                </Routes>
            )}
        </div>
    );
}
