import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import StopLabel from './StopLabel';

export interface DraggableStopProps {
    stop: StopSummary;
}

export const DraggableStop: React.FC<DraggableStopProps> = ({ stop }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: `drag/stop/${stop.id}` });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="cursor-grab p-4 border border-gray-600 rounded touch-none select-none"
        >
            <StopLabel stop={stop} showStatus={true} />
        </div>
    );
};

export default DraggableStop;