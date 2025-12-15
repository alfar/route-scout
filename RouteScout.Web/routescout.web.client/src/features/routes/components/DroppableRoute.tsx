import React, { useMemo, useState } from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DroppableContainer from './DroppableContainer';
import DraggableRouteLabel from './DraggableRouteLabel';
import StopList from './StopList';
import { useDndContext } from '@dnd-kit/core';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { getTrailerCapacity } from '../functions/TrailerFunctions';

interface DroppableRouteProps {
    route: RouteSummary;
    stops: StopSummary[];
    teams: TeamSummary[];
}

const DroppableRoute: React.FC<DroppableRouteProps> = ({ route, stops, teams }) => {
    const [expanded, setExpanded] = useState(true);
    const { active, over } = useDndContext();

    const highlightCount = useMemo(() => {
        if (active && over) {
            const [activeType, activeId] = (active.id as string).split('/', 2);
            const [overType, overId] = (over.id as string).split('/', 2);

            if (overType === 'route' && overId === route.id && activeType === 'team') {
                const team = teams.find(t => t.id === activeId);
                if (team) {
                    return getTrailerCapacity(team.trailerSize);
                }
            }
        }

        return 0;
    }, [active, over]);

    const routeStops = useMemo(() => route.stops
        .map(id => stops.find(s => s.id === id))
        .filter((s): s is StopSummary => !!s), [route.stops, stops]);

    const totalTrees = useMemo(() => routeStops.reduce((sum, s) => sum + (s.amount || 0), 0), [routeStops]);
    const completedTrees = useMemo(() => routeStops.filter(s => s.status === 'Completed').reduce((sum, s) => sum + (s.amount || 0), 0), [routeStops]);

    return (
        <DroppableContainer id={`route/${route.id}`}>
            <div className="flex items-center justify-between mb-2">
                <DraggableRouteLabel route={route} />
                <button
                    className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
                    onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse route details' : 'Expand route details'}
                    style={{ minHeight: 44 }}
                >
                    {expanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                    <span className="font-medium">{completedTrees}/{totalTrees}</span>
                </button>
            </div>
            <div className="text-xs text-left text-gray-600 mb-2">Drop-off: {route.dropOffPoint}</div>
            {expanded && (
                <StopList stops={routeStops} highlightCount={highlightCount} />
            )}
        </DroppableContainer>
    );
};

export default DroppableRoute;
