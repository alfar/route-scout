import React from 'react';
import { RouteSummary, StopSummary } from '../pages/RouteManagementPage';
import DroppableRoute from './DroppableRoute';
import { TeamSummary } from '../../teams/types/TeamSummary';

interface Props {
    routes: RouteSummary[];
    stops: StopSummary[];
    teams: TeamSummary[];
}

const RouteList: React.FC<Props> = ({ routes, stops, teams }) => {
    return (
        <div className="space-y-3">
            {routes.map(route => (
                <DroppableRoute
                    key={route.id}
                    route={route}
                    stops={stops}
                    teams={teams}
                />
            ))}
        </div>
    );
};

export default RouteList;
