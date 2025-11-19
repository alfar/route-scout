import React, { useState } from 'react';
import { StopSummary, RouteSummary } from '../pages/RouteManagementPage';

interface Props {
    stops: StopSummary[];
    routes: RouteSummary[];
    onAssign: (stopId: string, routeId: string) => void;
}

const UnassignedStopList: React.FC<Props> = ({ stops, routes, onAssign }) => {
    const [selectedRoute, setSelectedRoute] = useState<{ [stopId: string]: string }>({});

    return (
        <ul>
            {stops.length === 0 && <li className="text-gray-400">No unassigned stops</li>}
            {stops.map(stop => (
                <li key={stop.id} className="mb-2 flex items-center gap-2">
                    {stop.houseNumber} (#{stop.id.slice(0, 6)})
                    <select
                        className="ml-2 border rounded px-1"
                        value={selectedRoute[stop.id] || ''}
                        onChange={e => setSelectedRoute(r => ({ ...r, [stop.id]: e.target.value }))}
                    >
                        <option value="">Select route</option>
                        {routes.map(route => (
                            <option key={route.id} value={route.id}>{route.name}</option>
                        ))}
                    </select>
                    <button
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
                        disabled={!selectedRoute[stop.id]}
                        onClick={() => selectedRoute[stop.id] && onAssign(stop.id, selectedRoute[stop.id])}
                    >
                        Assign
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default UnassignedStopList;
