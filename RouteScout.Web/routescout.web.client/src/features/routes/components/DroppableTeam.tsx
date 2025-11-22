import { useDroppable } from '@dnd-kit/core';
import React from 'react';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { RouteSummary } from '../pages/RouteManagementPage';
import DraggableTeamRoute from './DraggableTeamRoute';

interface DroppableTeamProps {
    team: TeamSummary;
    routes: RouteSummary[];
}

export const DroppableTeam: React.FC<DroppableTeamProps> = ({ team, routes }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `team-${team.id}` });
  return (
    <div
      ref={setNodeRef}
      className="p-3 border rounded mb-3"
      style={{
        background: isOver ? '#f0fdf4' : '#f8fafc',
        borderColor: isOver ? '#16a34a' : '#94a3b8'
      }}
    >
      <div className="font-semibold">{team.name}</div>
      <div className="text-xs text-gray-600 mb-2">Trailer: {team.trailerSize}</div>
      <div className="text-xs font-semibold mb-1">Routes</div>
      {routes.length === 0 && <div className="text-xs text-gray-400">No routes</div>}
      <div className="flex flex-col gap-1">
        {routes.map(r => <DraggableTeamRoute key={r.id} route={r} />)}
      </div>
    </div>
  );
};
