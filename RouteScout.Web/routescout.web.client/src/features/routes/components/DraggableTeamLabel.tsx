import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface DraggableTeamLabelProps {
    team: TeamSummary;
}

const DraggableTeamLabel: React.FC<DraggableTeamLabelProps> = ({ team }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: `team/${team.id}` });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="font-semibold flex mb-1 text-gray-600 cursor-grab select-none"
        >
            <UserGroupIcon className="size-6 mr-1" /> {team.name}
        </div>
    );
};

export default DraggableTeamLabel;
