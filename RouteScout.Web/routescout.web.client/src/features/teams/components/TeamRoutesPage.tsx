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
            <div className="font-semibold">{route.name}</div>
            <div className="text-sm text-gray-600">Drop Off: {route.dropOffPoint}</div>
            <div className="flex flex-col gap-1">
              {routeStops.map(s => (
                <div key={s.id} className="text-sm flex gap-2">
                  <span className="font-mono">{s.houseNumber}</span>
                  <span>{s.streetName}</span>
                  <span className="text-gray-500">x{s.amount}</span>
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
