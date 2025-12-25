import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import TeamLabel from './TeamLabel';

interface DraggableTeamLabelProps {
    team: TeamSummary;
}

const DraggableTeamLabel: React.FC<DraggableTeamLabelProps> = ({ team }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: `drag/team/${team.id}` });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="p-2 cursor-grab select-none touch-none"
        >
            <TeamLabel team={team} />
        </div>
    );
};

export default DraggableTeamLabel;
