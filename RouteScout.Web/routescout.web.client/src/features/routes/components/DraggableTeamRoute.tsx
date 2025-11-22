import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import { RouteSummary } from '../pages/RouteManagementPage';

interface DraggableTeamRouteProps {
  route: RouteSummary;
}

export const DraggableTeamRoute: React.FC<DraggableTeamRouteProps> = ({ route }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `route-${route.id}` });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`px-2 py-1 text-xs rounded cursor-grab border ${isDragging ? 'bg-indigo-200' : 'bg-white'} border-indigo-300 shadow-sm`}
      title="Drag off to unassign or onto another team"
    >
      {route.name}
    </div>
  );
};

export default DraggableTeamRoute;
