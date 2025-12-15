import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import { CheckIcon, ExclamationTriangleIcon, ForwardIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface DraggableStopProps {
    stop: StopSummary;
}

export const DraggableStop: React.FC<DraggableStopProps> = ({ stop }) => {
    const { attributes, listeners, setNodeRef, active } = useDraggable({ id: `stop/${stop.id}` });

    const icon = (stop: StopSummary) => {
        switch (stop.status) {
            case 'Pending':
                return <ForwardIcon className="size-6 text-gray-300" />;
            case 'Completed':
                return <CheckIcon className="size-6 text-green-500" />;
            case 'NotFound':
                return <ExclamationTriangleIcon className="size-6 text-red-500" />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 cursor-grab p-4 border border-gray-200 rounded bg-white"
        >
            <HomeIcon className="size-7 text-gray-500" />
            <div className="text-left flex-grow">
                <div className="font-medium text-base">{stop.streetName} {stop.houseNumber}</div>
                <div className="text-xs text-gray-500">Trees: {stop.amount}</div>
            </div>
            <div>{icon(stop)}</div>
        </div>
    );
};

export default DraggableStop;