import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import DraggableStop from './DraggableStop';

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
        <ul>
            {stops.map((stop) => {
                const highlight = highlightCount > 0 && shouldHighlight(stop);
                return (
                    <li key={stop.id} className={`mb-2 ${highlight ? 'outline-2 outline-offset-2 outline-indigo-600 rounded' : ''}`}>
                        <DraggableStop stop={stop} />
                    </li>
                );
            })}
        </ul>
    );
};

export default StopList;
