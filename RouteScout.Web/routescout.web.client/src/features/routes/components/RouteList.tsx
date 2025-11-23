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
            {routes.map(route => (
                <DroppableRoute key={route.id} route={route} stops={stops} isOver={hoveredRouteId === route.id}>
                </DroppableRoute>
            ))}
        </div>
    );
};

export default RouteList;
