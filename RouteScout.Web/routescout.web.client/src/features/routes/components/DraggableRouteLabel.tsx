import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RouteSummary } from '../pages/RouteManagementPage';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

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
            className={`font-semibold flex mb-1 text-gray-600 cursor-grab select-none touch-none` + (completed ? '  text-green-600' : '')}
        >
            {completed ? <ClipboardDocumentCheckIcon className="size-6 mr-1" /> : <ClipboardIcon className="size-6 mr-1" />}{route.name}
        </div>
    );
};

export default DraggableRouteLabel;
