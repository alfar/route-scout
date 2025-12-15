import React from 'react';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import RouteList from './RouteList';
import DroppableContainer from './DroppableContainer';
import DraggableTeamLabel from './DraggableTeamLabel';

interface DroppableTeamProps {
    team: TeamSummary;
    routes: RouteSummary[];
    stops: StopSummary[];
    teams: TeamSummary[];
}

export const DroppableTeam: React.FC<DroppableTeamProps> = ({ team, routes, stops, teams }) => {
    return (
        <DroppableContainer id={`team/${team.id}`}>
            <DraggableTeamLabel team={team} />
            <div className="flex justify-between">
                <div className="text-xs text-gray-600 mb-1">{team.leaderName} ({team.leaderPhone})</div>
                <div className="text-xs text-gray-600 mb-2">Trailer: {team.trailerSize}</div>
            </div>
            {routes.length === 0 && <div className="text-xs text-gray-400">No routes</div>}
            <div className="flex flex-col gap-2">
                <RouteList routes={routes} stops={stops} teams={teams}></RouteList>
            </div>
        </DroppableContainer>
    );
};
