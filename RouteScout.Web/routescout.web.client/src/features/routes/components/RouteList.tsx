import React from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';

interface Props {
    routes: RouteSummary[];
    stops: StopSummary[];
    onUnassign: (routeId: string, stopId: string) => void;
}

const RouteList: React.FC<Props> = ({ routes, stops, onUnassign }) => {
    return (
        <div>
            {routes.map(route => (
                <div key={route.id} className="mb-4 border rounded p-3">
                    <div className="font-bold">{route.name}</div>
                    <div className="text-sm text-gray-600 mb-2">Drop-off: {route.dropOffPoint}</div>
                    <div>
                        <span className="font-semibold">Stops:</span>
                        <ul className="ml-4 list-disc">
                            {route.stops.length === 0 && <li className="text-gray-400">No stops assigned</li>}
                            {route.stops.map(stopId => {
                                const stop = stops.find(s => s.id === stopId);
                                if (!stop) return null;
                                return (
                                    <li key={stop.id} className="flex items-center gap-2">
                                        {stop.houseNumber} (#{stop.id.slice(0, 6)})
                                        <button
                                            className="ml-2 text-xs text-red-600 hover:underline"
                                            onClick={() => onUnassign(route.id, stop.id)}
                                        >
                                            Unassign
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RouteList;
