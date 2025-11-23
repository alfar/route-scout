import { useEffect, useState } from 'react';
import { RouteSummary } from '../../routes/pages/RouteManagementPage';
import { StopSummary } from '../../routes/pages/RouteManagementPage';

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
            case 'Completed': return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Completed</span>;
            case 'NotFound': return <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Not Found</span>;
            default: return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">Pending</span>;
        }
    }

    return (
        <div className="border rounded p-4 shadow-sm bg-white flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Routes Assigned to Team</h2>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && routes.length === 0 && <div>No routes assigned.</div>}
            {!loading && !error && routes.map(route => {
                const routeStops = route.stops.map(id => stops.find(s => s.id === id)).filter(Boolean) as StopSummary[];
                return (
                    <div key={route.id} className="border rounded p-3 bg-gray-50 flex flex-col gap-2">
                        <div className="font-semibold flex items-center gap-2">
                            <span>{route.name}</span>
                            <span className="text-xs text-gray-500">Extra Trees: {route.extraTrees ?? 0}</span>
                            {route.cutShort && <span className="text-xs text-red-600">Cut Short</span>}
                            <div className="flex gap-1 ml-auto">
                                <button onClick={() => addExtraTrees(route.id, 1)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">+1</button>
                                <button onClick={() => removeExtraTrees(route.id, 1)} disabled={(route.extraTrees ?? 0) < 1} className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40">-1</button>
                                {!route.cutShort && <button onClick={() => cutShort(route)} className="px-2 py-1 text-xs rounded bg-orange-600 text-white hover:bg-orange-700">Cut Short</button>}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">Drop Off: {route.dropOffPoint}</div>
                        <div className="flex flex-col gap-1">
                            {routeStops.map(s => (
                                <div key={s.id} className="text-sm flex flex-col gap-1 border rounded p-2 bg-white">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">{s.houseNumber}</span>
                                        <span>{s.streetName}</span>
                                        <span className="text-gray-500">x{s.amount}</span>
                                        {statusBadge(s.status)}
                                    </div>
                                    <div className="flex gap-2">
                                        {s.status === 'Pending' && (
                                            <>
                                                <button onClick={() => completeStop(s.id)} className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">Completed</button>
                                                <button onClick={() => notFoundStop(s.id)} className="px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700">Not Found</button>
                                            </>
                                        )}
                                        {s.status !== 'Pending' && (
                                            <button onClick={() => resetStop(s.id)} className="px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700">Reset</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {routeStops.length === 0 && <div className="text-xs text-gray-500">No stops.</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
