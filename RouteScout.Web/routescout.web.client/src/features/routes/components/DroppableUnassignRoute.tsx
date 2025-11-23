import { useDroppable } from '@dnd-kit/core';
import React from 'react';

interface DroppableUnassignRouteProps {
    id: string;
}

const DroppableUnassignRoute: React.FC<DroppableUnassignRouteProps> = ({
  id,
}) => {
    const { setNodeRef, isOver } = useDroppable({ id });

  return (
      <div
          ref={setNodeRef}
          className="p-3 border rounded mb-3 border-gray-600 mb-4"
          style={{
              background: isOver ? '#e0f7fa' : '#f8fafc',
              minHeight: 60,
          }}
      >
      Drop here to unassign route
    </div>
  );
};

export default DroppableUnassignRoute;