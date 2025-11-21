import React, { useState } from 'react';
import { StopSummary, RouteSummary } from '../pages/RouteManagementPage';
import DraggableStop from './DraggableStop';
import { useDroppable } from '@dnd-kit/core';

interface Props {
    stops: StopSummary[];
}

const UnassignedStopList: React.FC<Props> = ({ stops }) => {
    const { setNodeRef, isOver } = useDroppable({ id: "unassign" });

    return (
        <div
            ref={setNodeRef}
            style={{
                background: isOver ? '#e0f7fa' : '#f8fafc',
                border: '2px dashed #60a5fa',
                borderRadius: 6,
                padding: 12,
                marginBottom: 12,
                minHeight: 60,
            }}
        >
            <ul>
                {stops.length === 0 && <li className="text-gray-400">No unassigned stops</li>}
                {stops.map((stop, i) => (
                    <li key={stop.id} className="mb-2 flex items-center gap-2">
                        <DraggableStop id={stop.id} name={`${stop.streetName} ${stop.houseNumber}`} index={i} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UnassignedStopList;
