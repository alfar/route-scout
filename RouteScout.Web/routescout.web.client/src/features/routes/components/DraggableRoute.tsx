import React from 'react';
import { RouteSummary } from '../pages/RouteManagementPage';
import DraggableRouteLabel from './DraggableRouteLabel';

export interface DraggableRouteProps {
    route: RouteSummary;
}

// Compact boxed draggable route header suitable for absolute positioning in DragOverlay
const DraggableRoute: React.FC<DraggableRouteProps> = ({ route }) => {
    return (
        <div className="flex items-center gap-3 cursor-grab p-4 border border-gray-200 rounded bg-white min-w-2xs">
            <DraggableRouteLabel route={route} />
        </div>
    );
};

export default DraggableRoute;
