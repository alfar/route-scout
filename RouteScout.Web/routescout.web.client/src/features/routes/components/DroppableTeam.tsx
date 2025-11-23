import { useDroppable } from '@dnd-kit/core';
import React from 'react';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import RouteList from './RouteList';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface DroppableTeamProps {
    team: TeamSummary;
    routes: RouteSummary[];
    stops: StopSummary[];
    onUnassign: (routeId: string, stopId: string) => void;
    hoveredRouteId?: string | null;
}

export const DroppableTeam: React.FC<DroppableTeamProps> = ({ team, routes, stops, onUnassign, hoveredRouteId }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `team-${team.id}` });
    return (
        <div
            ref={setNodeRef}
            className="p-3 border rounded mb-3 border-gray-600"
            style={{
                background: isOver ? '#f0fdf4' : '#f8fafc',
                borderColor: isOver ? '#16a34a' : '#94a3b8'
            }}
        >
            <div className="font-semibold flex mb-1 text-gray-600"><UserGroupIcon className="size-6 mr-1" /> {team.name}</div>
            <div className="flex justify-between">
                <div className="text-xs text-gray-600 mb-1">{team.leaderName} ({team.leaderPhone})</div>
                <div className="text-xs text-gray-600 mb-2">Trailer: {team.trailerSize}</div>
            </div>
            {routes.length === 0 && <div className="text-xs text-gray-400">No routes</div>}
            <div className="flex flex-col gap-1">
                <RouteList routes={routes} stops={stops} onUnassign={onUnassign} hoveredRouteId={hoveredRouteId}></RouteList>
            </div>
        </div>
    );
};
