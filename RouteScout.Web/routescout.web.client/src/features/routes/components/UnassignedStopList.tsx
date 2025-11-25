import React, { useState } from 'react';
import { StopSummary, RouteSummary } from '../pages/RouteManagementPage';
import DraggableStop from './DraggableStop';
import { useDroppable } from '@dnd-kit/core';
import DroppableContainer from './DroppableContainer';

interface Props {
    stops: StopSummary[];
}

const UnassignedStopList: React.FC<Props> = ({ stops }) => {
    return (
        <DroppableContainer id="unassign" className="bg-gray-50">
            <ul>
                {stops.length === 0 && <li className="text-gray-500">No unassigned stops</li>}
                {stops.map((stop, i) => (
                    <li key={stop.id} className="mb-2">
                        <DraggableStop stop={stop} />
                    </li>
                ))}
            </ul>
        </DroppableContainer>
    );
};

export default UnassignedStopList;
