import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import DraggableStop from './DraggableStop';
import { useDndContext } from '@dnd-kit/core';

export interface StopListProps {
    stops: StopSummary[];
    highlightCount: number;
}

const StopList: React.FC<StopListProps> = ({ stops, highlightCount }) => {
    // Compute highlight similar to UnassignedStopList but only for non-completed stops
    let cumulative = 0;
    const shouldHighlight = (stop: StopSummary) => {
        if (stop.status === 'Completed') return false;
        const next = cumulative + (stop.amount || 0);
        const ok = next <= highlightCount;
        if (ok) cumulative = next;
        return ok;
    };

    if (stops.length === 0) {
        return <div className="text-gray-400">No stops assigned</div>;
    }

    return (
        <div className="space-y-2">
            {stops.map((stop) => {
                const highlight = highlightCount > 0 && shouldHighlight(stop);
                return (
                    <div key={stop.id} className={`mb-2 ${highlight ? 'ring-2 ring-indigo-400 rounded' : ''}`}>
                        <DraggableStop key={stop.id} stop={stop} />
                    </div>
                );
            })}
        </div>
    );
};

export default StopList;
