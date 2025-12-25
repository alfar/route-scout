import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import { CheckIcon, ExclamationTriangleIcon, ForwardIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface StopLabelProps {
    stop: StopSummary;
    showStatus?: boolean;
}

const getStatusIcon = (stop: StopSummary) => {
    switch (stop.status) {
        case 'Pending':
            return <ForwardIcon className="size-6 text-gray-300" />;
        case 'Completed':
            return <CheckIcon className="size-6 text-green-500" />;
        case 'NotFound':
            return <ExclamationTriangleIcon className="size-6 text-red-500" />;
        default:
            return null;
    }
};

export const StopLabel: React.FC<StopLabelProps> = ({ stop, showStatus }) => {
    return (
        <div className="text-gray-600 flex items-center font-semibold">
            <HomeIcon className="size-7 text-gray-600 mr-1" />
            <div className="text-left flex-grow">
                <div className="font-medium text-base">{stop.streetName} {stop.houseNumber}</div>
                <div className="text-xs text-gray-500">Trees: {stop.amount}</div>
            </div>
            {showStatus && <div>{getStatusIcon(stop)}</div>}
        </div>
    );
};

export default StopLabel;
