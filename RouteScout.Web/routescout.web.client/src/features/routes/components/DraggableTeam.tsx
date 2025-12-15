import React from 'react';
import DraggableTeamLabel from './DraggableTeamLabel';
import { TeamSummary } from '../../teams/types/TeamSummary';

export interface DraggableTeamProps {
    team: TeamSummary;
}

// A touch-friendly, boxed draggable route header styled like DraggableStop cards
const DraggableTeam: React.FC<DraggableTeamProps> = ({ team }) => {
    return (
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded bg-white">
            <DraggableTeamLabel team={team} />
        </div>
    );
};

export default DraggableTeam;
