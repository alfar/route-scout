import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { RouteSummary } from '../pages/RouteManagementPage';

interface DroppableRouteProps {
    route: RouteSummary;
    children?: React.ReactNode;
}

const DroppableRoute: React.FC<DroppableRouteProps> = ({ route, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: route.id });
    return (
        <div
            ref={setNodeRef}
            style={{
                background: isOver ? '#e0f7fa' : '#f8fafc',
                border: '2px dashed #60a5fa',
                borderRadius: 6,
                padding: 12,
                marginBottom: 12,
                minHeight: 60,
            }}
        >
            <div className="font-bold mb-1">{route.name}</div>
            {children}
        </div>
    );
};

export default DroppableRoute;
