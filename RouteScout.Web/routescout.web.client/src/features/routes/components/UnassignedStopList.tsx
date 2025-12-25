import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import DraggableStop from './DraggableStop';

interface Props {
    stops: StopSummary[];
    highlightCount?: number; // capacity measured in trees
}

const UnassignedStopList: React.FC<Props> = ({ stops, highlightCount = 0 }) => {
    // Compute which stops to highlight based on cumulative tree count <= highlightCount
    let cumulative = 0;
    const firstAreaId = stops.length > 0 ? stops[0]?.areaId : null;

    const shouldHighlight = (stop: StopSummary) => {
        if (stop.areaId !== firstAreaId) return false;

        const next = cumulative + (stop.amount || 0);
        const ok = next <= highlightCount;
        if (ok) cumulative = next;
        return ok;
    };

    return (
        <ul className="gap-2">
            {stops.length === 0 && <li className="text-gray-500">No unassigned stops</li>}
            {stops.map((stop) => {
                const highlight = highlightCount > 0 && shouldHighlight(stop);
                return (
                    <li key={stop.id} className={`mb-2 ${highlight ? 'outline-2 outline-indigo-600 rounded' : ''}`}>
                        <DraggableStop stop={stop} />
                    </li>
                );
            })}
        </ul>
    );
};

export default UnassignedStopList;
