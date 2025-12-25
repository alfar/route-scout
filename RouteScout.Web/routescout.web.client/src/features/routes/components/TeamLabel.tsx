import { UserGroupIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { TeamSummary } from '../../teams/types/TeamSummary';

interface TeamLabelProps {
    team: TeamSummary;
}

const TeamLabel: React.FC<TeamLabelProps> = ({ team }) => {
    return (
        <div className="text-gray-600 flex items-center font-semibold">
            <UserGroupIcon className="size-5 mr-1 flex-grow-0" /><span>{team.name}</span>
        </div>
    );
};

export default TeamLabel;