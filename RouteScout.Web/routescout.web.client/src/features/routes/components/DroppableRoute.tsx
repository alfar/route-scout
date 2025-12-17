import React, { useMemo, useState } from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import DroppableContainer from './DroppableContainer';
import DraggableRouteLabel from './DraggableRouteLabel';
import StopList from './StopList';
import { useDndContext } from '@dnd-kit/core';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { getTrailerCapacity } from '../functions/TrailerFunctions';
import ExpandCounter from './ExpandCounter';

interface DroppableRouteProps {
    route: RouteSummary;
    stops: StopSummary[];
    teams: TeamSummary[];
    completed?: boolean;
}

const DroppableRoute: React.FC<DroppableRouteProps> = ({ route, stops, teams, completed = false }) => {
    const [expanded, setExpanded] = useState(!completed);
    const { active, over } = useDndContext();

    const highlightCount = completed ? 0 : useMemo(() => {
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
            <div className="flex items-center justify-between">
                <DraggableRouteLabel route={route} completed={completed} />
                <ExpandCounter
                    expanded={expanded}
                    onToggle={() => setExpanded(v => !v)}
                    completed={completedTrees}
                    total={totalTrees}
                />
            </div>
            {!completed && <div className="text-xs text-left text-gray-600 mb-2">Drop-off: {route.dropOffPoint}</div>}
            {expanded && (
                <StopList stops={routeStops} highlightCount={highlightCount} />
            )}
        </DroppableContainer>
    );
};

export default DroppableRoute;
