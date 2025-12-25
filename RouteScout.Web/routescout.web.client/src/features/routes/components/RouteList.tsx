import React from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import DroppableRoute from './DroppableRoute';
import { TeamSummary } from '../../teams/types/TeamSummary';

interface Props {
    routes: RouteSummary[];
    stops: StopSummary[];
    teams: TeamSummary[];
    completed?: boolean;
}

const RouteList: React.FC<Props> = ({ routes, stops, teams, completed }) => {
    return (
        <div className="flex flex-col gap-3">
            {routes.map(route => (
                <DroppableRoute
                    key={route.id}
                    route={route}
                    stops={stops}
                    teams={teams}
                    completed={completed}
                />
            ))}
        </div>
    );
};

export default RouteList;
