import React, { useEffect, useState } from 'react';
import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TeamSummary } from './features/teams/types/TeamSummary';
import { TeamInfoPage } from './features/teams/components/TeamInfoPage';
import { TeamRoutesPage } from './features/teams/components/TeamRoutesPage';
import { useTranslation } from 'react-i18next';

export function TeamApp() {
    const { id } = useParams();
    const teamId = id || '';
    const [team, setTeam] = useState<TeamSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const { t } = useTranslation(['common']);

    async function loadTeam() {
        if (!teamId) return;
        setLoading(true);
        try {
            // Use anonymous endpoint - no credentials needed
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
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
                <nav>
                    <div className="flex gap-2">
                        <Link
                            to={`/teams/${teamId}`}
                            className={`flex-1 text-center px-3 py-2 rounded-md ${!isInfo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >{t('routesTab')}</Link>
                        <Link
                            to={`/teams/${teamId}/info`}
                            className={`flex-1 text-center px-3 py-2 rounded-md ${isInfo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >{t('infoTab')}</Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
                {loading && <div>{t('loading')}</div>}
                {error && <div className="text-red-600">{t('error')}: {error}</div>}

                {!loading && !error && team && (
                    <Routes>
                        <Route path="" element={<TeamRoutesPage teamId={teamId} />} />
                        <Route path="info" element={<TeamInfoPage team={team} onUpdated={loadTeam} teamId={teamId} />} />
                    </Routes>
                )}
            </main>
        </div>
    );
}
