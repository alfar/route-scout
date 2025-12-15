import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RouteSummary } from '../pages/RouteManagementPage';
import { ClipboardIcon } from '@heroicons/react/24/outline';

interface DraggableRouteLabelProps {
    route: RouteSummary;
}

const DraggableRouteLabel: React.FC<DraggableRouteLabelProps> = ({ route }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: `route/${route.id}` });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`font-semibold flex mb-1 text-gray-600 cursor-grab select-none`}
        >
            <ClipboardIcon className="size-6 mr-1" />{route.name}
        </div>
    );
};

export default DraggableRouteLabel;
