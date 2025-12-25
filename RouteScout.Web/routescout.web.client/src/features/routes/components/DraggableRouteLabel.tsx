import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RouteSummary } from '../pages/RouteManagementPage';
import RouteLabel from './RouteLabel';

interface DraggableRouteLabelProps {
    route: RouteSummary;
    completed?: boolean;
}

const DraggableRouteLabel: React.FC<DraggableRouteLabelProps> = ({ route, completed }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: `drag/route/${route.id}` });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`cursor-grab select-none touch-none` + (completed ? '  text-green-600' : '')}
        >
            <RouteLabel route={route} completed={completed} />
        </div>
    );
};

export default DraggableRouteLabel;
