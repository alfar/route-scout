import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import DraggableStop from './DraggableStop';

interface DroppableRouteProps {
    route: RouteSummary;
    stops: StopSummary[];
    isOver?: boolean;
}

const DroppableRoute: React.FC<DroppableRouteProps> = ({ route, stops, isOver }) => {
    const { setNodeRef } = useDroppable({ id: route.id });
    return (
        <div
            ref={setNodeRef}
            className="p-3 border rounded mb-3 border-gray-600 mb-4"
            style={{
                background: isOver ? '#e0f7fa' : '#f8fafc',
                minHeight: 60,
            }}
        >
            <DraggableRouteLabel route={route} />
            <div className="text-xs text-left text-gray-600 mb-2">Drop-off: {route.dropOffPoint}</div>
            <div>
                {route.stops.length === 0 && <li className="text-gray-400">No stops assigned</li>}
                {route.stops.map((stopId, i) => {
                    const stop = stops.find(s => s.id === stopId);
                    if (!stop) return null;
                    return (
                        <DraggableStop key={stop.id} stop={stop} />
                    );
                })}
            </div>
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
            className={`mb-2 rounded font-medium cursor-grab flex`}
        ><ClipboardIcon className="size-6 mr-1" />{route.name}</div>
    );
};

export default DroppableRoute;
