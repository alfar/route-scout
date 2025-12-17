import React, { useState } from 'react';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import RouteList from './RouteList';
import DroppableContainer from './DroppableContainer';
import DraggableTeamLabel from './DraggableTeamLabel';
import ExpandCounter from './ExpandCounter';

interface DroppableTeamProps {
    team: TeamSummary;
    routes: RouteSummary[];
    stops: StopSummary[];
    teams: TeamSummary[];
}

export const DroppableTeam: React.FC<DroppableTeamProps> = ({ team, routes, stops, teams }) => {
    const completedCount = routes.filter(r => r.completed).length;
    const totalCount = routes.length;
    const [showCompleted, setShowCompleted] = useState(false);

    const activeRoutes = routes.filter(r => !r.completed);
    const completedRoutes = routes.filter(r => r.completed);

    return (
        <DroppableContainer id={`team/${team.id}`}>
            <div className="flex items-center justify-between">
                <DraggableTeamLabel team={team} />
                <ExpandCounter
                    expanded={showCompleted}
                    onToggle={() => setShowCompleted(v => !v)}
                    completed={completedCount}
                    total={totalCount}
                />
            </div>
            <div className="flex justify-between">
                <div className="text-xs text-gray-600 mb-1">{team.leaderName} ({team.leaderPhone})</div>
                <div className="text-xs text-gray-600 mb-2">Trailer: {team.trailerSize}</div>
            </div>

            {routes.length === 0 && <div className="text-xs text-gray-400">No routes</div>}
            <div className="flex flex-col gap-2">
                <RouteList routes={activeRoutes} stops={stops} teams={teams}></RouteList>
                {(showCompleted && completedRoutes.length > 0) && (
                    <RouteList routes={completedRoutes} stops={stops} teams={teams} completed={true}></RouteList>
                )}
            </div>
        </DroppableContainer>
    );
};
