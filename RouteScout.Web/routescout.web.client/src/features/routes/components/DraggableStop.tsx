import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import { CheckIcon, ExclamationTriangleIcon, ForwardIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface DraggableStopProps {
    stop: StopSummary;
}

export const DraggableStop: React.FC<DraggableStopProps> = ({
    stop
}) => {
    const { attributes, listeners, setNodeRef, active } = useDraggable({ id: stop.id });

    const icon = (stop: StopSummary) => {
        switch (stop.status) {
            case "Pending":
                return <ForwardIcon className="size-6 text-gray-300"></ForwardIcon>;
            case "Completed":
                return <CheckIcon className="size-6 text-green-500" />;
            case "NotFound":
                return <ExclamationTriangleIcon className="size-6 text-red-500" />
        }
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                opacity: active ? 0.5 : 1,
                cursor: 'grab',
                padding: '8px',
                border: '1px solid #ccc',
                marginBottom: '4px',
                background: '#fff',
                borderRadius: '4px',
            }}
            className="flex"
        >
            <HomeIcon className="size-6 mr-2 text-gray-500" />
            <div className="text-left flex-grow">{stop.streetName} {stop.houseNumber}</div>
            <div className="mr-2">{stop.amount}</div>
            <div>{icon(stop)}</div>
        </div>
    );
};

export default DraggableStop;