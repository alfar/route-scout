import React from 'react';
import { StopSummary } from '../pages/RouteManagementPage';
import { CheckIcon, ExclamationTriangleIcon, ForwardIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation(['routes']);
    return (
        <div className="text-gray-600 flex items-center font-semibold">
            <HomeIcon className="size-7 text-gray-600 mr-2" />
            <div className="text-left flex-grow">
                <div className="font-medium text-base">{stop.streetName} {stop.houseNumber}</div>
                <div className="text-xs text-gray-500">{t('treesLabel', { count: stop.amount })}</div>
            </div>
            {showStatus && <div>{getStatusIcon(stop)}</div>}
        </div>
    );
};

export default StopLabel;
