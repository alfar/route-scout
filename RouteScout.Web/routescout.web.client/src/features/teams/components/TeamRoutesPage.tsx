import React, { useEffect, useState } from 'react';
import { RouteSummary } from '../../routes/pages/RouteManagementPage';
import { StopSummary } from '../../routes/pages/RouteManagementPage';
import { HomeIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
    teamId: string;
}

export function TeamRoutesPage({ teamId }: Props) {
    const [routes, setRoutes] = useState<RouteSummary[]>([]);
    const [stops, setStops] = useState<StopSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const [routesRes, stopsRes] = await Promise.all([
                fetch(`/api/routes/team/${teamId}`),
                fetch('/api/stops')
            ]);
            if (!routesRes.ok) {
                setError('Failed to load routes');
            } else {
                const rData = await routesRes.json();
                setRoutes(rData);
            }
            if (!stopsRes.ok) {
                setError('Failed to load stops');
            } else {
                const sData = await stopsRes.json();
                setStops(sData);
            }
            if (!routesRes.ok || !stopsRes.ok) return;
            setError(null);
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [teamId]);

    async function completeStop(id: string) {
        await fetch(`/api/stops/${id}/complete`, { method: 'POST' });
        await load();
    }

    async function notFoundStop(id: string) {
        await fetch(`/api/stops/${id}/not-found`, { method: 'POST' });
        await load();
    }

    async function resetStop(id: string) {
        await fetch(`/api/stops/${id}/reset`, { method: 'POST' });
        await load();
    }

    async function addExtraTrees(routeId: string, amount: number) {
        await fetch(`/api/routes/${routeId}/extra-trees/add/${amount}`, { method: 'POST' });
        await load();
    }

    async function removeExtraTrees(routeId: string, amount: number) {
        await fetch(`/api/routes/${routeId}/extra-trees/remove/${amount}`, { method: 'POST' });
        await load();
    }

    async function cutShort(route: RouteSummary) {
        await fetch(`/api/routes/${route.id}/cut-short`, { method: 'POST' });
        await load();
    }

    function statusBadge(status: string) {
        switch (status) {
            case 'Completed': return <CheckCircleIcon className="size-6 text-green-600" />;
            case 'NotFound': return <ExclamationTriangleIcon className="size-6 text-red-600" />;
            default: return <HomeIcon className="size-6 text-gray-600" />;
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && routes.length === 0 && <div className="text-gray-600">No routes assigned.</div>}
            {!loading && !error && routes.map(route => {
                const routeStops = route.stops.map(id => stops.find(s => s.id === id)).filter(Boolean) as StopSummary[];
                const extraCount = route.extraTrees ?? 0;
                return (
                    <section key={route.id} className="bg-white rounded border border-gray-600 p-3">
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{route.name}</div>
                                <div className="text-xs text-gray-500">Drop Off: {route.dropOffPoint}</div>
                                {route.cutShort && <div className="text-xs text-red-600 ml-1">(Cut Short)</div>}
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                            {routeStops.map(s => (
                                <div key={s.id} className="rounded border border-gray-200 p-2">
                                    <div className="flex items-center gap-2">      
                                        {statusBadge(s.status)}
                                        <span className="flex-1 text-left w-full">{s.streetName} {s.houseNumber}</span>
                                        <span className="text-gray-500">x{s.amount}</span>
                                    </div>
                                    <div className="mt-2 flex gap-2 justify-stretch">
                                        {s.status === 'Pending' && (
                                            <>
                                                <button onClick={() => completeStop(s.id)} className="px-3 py-2 text-xs rounded-md bg-green-600 text-white w-full">Completed</button>
                                                <button onClick={() => notFoundStop(s.id)} className="px-3 py-2 text-xs rounded-md bg-red-600 text-white w-full">Not Found</button>
                                            </>
                                        )}
                                        {s.status !== 'Pending' && (
                                            <button onClick={() => resetStop(s.id)} className="px-3 py-2 text-xs rounded-md bg-gray-500 text-white w-full">Reset</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {routeStops.length === 0 && <div className="text-xs text-gray-500">No stops.</div>}
                        </div>

                        {/* Extra trees controls with count centered */}
                        <div className="mt-3 flex items-center justify-between gap-2">
                            <button onClick={() => removeExtraTrees(route.id, 1)} disabled={extraCount < 1} className="px-5 py-2 text-xs rounded-md bg-blue-600 text-white disabled:opacity-40">-</button>
                            <span className="text-gray-700">Extra: {extraCount}</span>
                            <button onClick={() => addExtraTrees(route.id, 1)} className="px-5 py-2 text-xs rounded-md bg-blue-600 text-white">+</button>
                        </div>

                        {/* Cut short on its own row */}
                        {!route.cutShort && (
                            <div className="mt-2">
                                <button onClick={() => cutShort(route)} className="px-3 py-2 text-xs rounded-md bg-orange-600 text-white w-full sm:w-auto">Cut Short</button>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
