import React from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import DroppableRoute from './DroppableRoute';
import DraggableStop from './DraggableStop';

interface Props {
    routes: RouteSummary[];
    stops: StopSummary[];
    onUnassign: (routeId: string, stopId: string) => void;
    hoveredRouteId?: string | null;
}

const RouteList: React.FC<Props> = ({ routes, stops, onUnassign, hoveredRouteId }) => {
    return (
        <div>
            {routes.map(route => (
                <DroppableRoute key={route.id} route={route} isOver={hoveredRouteId === route.id}>
                    <div className="text-sm text-gray-600 mb-2">Drop-off: {route.dropOffPoint}</div>
                    <div>
                        <span className="font-semibold">Stops:</span>
                        <ul className="ml-4 list-disc">
                            {route.stops.length === 0 && <li className="text-gray-400">No stops assigned</li>}
                            {route.stops.map((stopId, i) => {
                                const stop = stops.find(s => s.id === stopId);
                                if (!stop) return null;
                                return (
                                    <DraggableStop id={stop.id} name={`${stop.streetName} ${stop.houseNumber}`} index={i} />
                                );
                            })}
                        </ul>
                    </div>
                </DroppableRoute>
            ))}
        </div>
    );
};

export default RouteList;
