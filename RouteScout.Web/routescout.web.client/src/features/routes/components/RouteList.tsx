import React from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import DroppableRoute from './DroppableRoute';
import DraggableStop from './DraggableStop';
import { useDraggable } from '@dnd-kit/core';

interface Props {
    routes: RouteSummary[];
    stops: StopSummary[];
    onUnassign: (routeId: string, stopId: string) => void;
    hoveredRouteId?: string | null;
}

const RouteList: React.FC<Props> = ({ routes, stops, onUnassign, hoveredRouteId }) => {
    return (
        <div>
            <DroppableRoute key="unassign" route={{ id: "route-unassign", name: "Unassign", stops: [], teamId: null, dropOffPoint: "", deleted: false }} isOver={hoveredRouteId === "route-unassign" }></DroppableRoute>
            {routes.map(route => (
                <DroppableRoute key={route.id} route={route} isOver={hoveredRouteId === route.id}>
                    <DraggableRouteLabel route={route} />
                    <div className="text-sm text-gray-600 mb-2">Drop-off: {route.dropOffPoint}</div>
                    <div>
                        <span className="font-semibold">Stops:</span>
                        <ul className="ml-4 list-disc">
                            {route.stops.length === 0 && <li className="text-gray-400">No stops assigned</li>}
                            {route.stops.map((stopId, i) => {
                                const stop = stops.find(s => s.id === stopId);
                                if (!stop) return null;
                                return (
                                    <DraggableStop key={stop.id} id={stop.id} name={`${stop.streetName} ${stop.houseNumber}`} index={i} />
                                );
                            })}
                        </ul>
                    </div>
                </DroppableRoute>
            ))}
        </div>
    );
};

const DraggableRouteLabel: React.FC<{ route: RouteSummary }> = ({ route }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `route-${route.id}` });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`inline-block px-2 py-1 mb-2 rounded text-xs font-medium cursor-grab ${isDragging ? 'bg-indigo-300' : 'bg-indigo-100'} text-indigo-800`}
        >
            Drag Route
        </div>
    );
};

export default RouteList;
