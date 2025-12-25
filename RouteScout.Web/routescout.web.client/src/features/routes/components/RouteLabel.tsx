import React from 'react';
import { RouteSummary } from '../pages/RouteManagementPage';
import { ClipboardIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface RouteLabelProps {
    route: RouteSummary;
    completed?: boolean;
}

export const RouteLabel: React.FC<RouteLabelProps> = ({ route, completed }) => {
    return (
        <div className="font-semibold flex items-center mb-1 text-gray-600">
            {(route.completed || completed) ? (
                <ClipboardDocumentCheckIcon className="size-5 mr-1" />
            ) : route.cutShort ? (
                <ExclamationTriangleIcon className="size-5 mr-1 text-red-600" />
            ) : (
                <ClipboardIcon className="size-5 mr-1" />
            )}
            {route.name}
        </div>
    );
};

export default RouteLabel;
