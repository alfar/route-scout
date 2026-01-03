import { StopSummary, RouteSummary } from '../pages/RouteManagementPage';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { getTrailerCapacity } from '../functions/TrailerFunctions';

type TrailerKind = 'small' | 'large' | 'boogie';

interface DragHandlersProps {
    projectId: string | undefined;
    routes: RouteSummary[];
    stops: StopSummary[];
    teams: TeamSummary[];
    setTeams: React.Dispatch<React.SetStateAction<TeamSummary[]>>;
}

export const useDragHandlers = ({ projectId, routes, stops, teams, setTeams }: DragHandlersProps) => {
    const handleAssignStop = async (stopId: string, routeId: string) => {
        await fetch(`/api/projects/${projectId}/routes/${routeId}/stops/${stopId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: 0 })
        });
    };

    const handleUnassignStop = async (stopId: string) => {
        await fetch(`/api/projects/${projectId}/stops/${stopId}/unassign`, { method: 'POST' });
    };

    const handleAssignRouteToTeam = async (routeId: string, teamId: string) => {
        await fetch(`/api/projects/${projectId}/routes/${routeId}/assign-team/${teamId}`, { method: 'POST' });
    };

    const handleUnassignRouteFromTeam = async (routeId: string) => {
        await fetch(`/api/projects/${projectId}/routes/${routeId}/unassign-team`, { method: 'POST' });
    };

    const handleDeleteRoute = async (routeId: string) => {
        await fetch(`/api/projects/${projectId}/routes/${routeId}`, { method: 'DELETE' });
    };

    const handleCompleteRoute = async (routeId: string) => {
        await fetch(`/api/projects/${projectId}/routes/${routeId}/completed`, { method: 'POST' });
    };

    const createTeamWithTrailerSize = async (kind: TrailerKind) => {
        await fetch(`/api/projects/${projectId}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trailerSize: kind, leaderName: "Ukendt", leaderPhone: "" })
        });
        // refresh team list
        const res = await fetch(`/api/projects/${projectId}/teams`);
        const data = await res.json();
        setTeams(data);
    };

    const selectStopsByTreeCapacity = (capacity: number) => {
        const candidate = stops.filter(s => !s.routeId && !s.deleted && s.status === 'Pending');
        const selected: StopSummary[] = [];
        let sum = 0;
        let areaId: string | null = null;

        for (const s of candidate) {
            if (areaId === null) areaId = s.areaId;
            if (areaId !== s.areaId) break;

            const amt = s.amount || 0;
            if (sum + amt <= capacity) {
                selected.push(s);
                sum += amt;
            } else {
                break;
            }
        }
        return selected;
    };

    const createRouteFromUnassignedCapacity = async (capacity: number) => {
        const selected = selectStopsByTreeCapacity(capacity);
        if (selected.length === 0) return;
        const createRes = await fetch(`/api/projects/${projectId}/routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ areaId: selected[0].areaId, areaName: selected[0].areaName, dropOffPoint: 'Almindsøhytten' })
        });
        const routeId = await createRes.json();
        if (!routeId) return;
        for (const stop of selected) {
            await handleAssignStop(stop.id, routeId);
        }
    };

    const createRouteForTeamFromUnassigned = async (team: TeamSummary, capacity: number) => {
        const selected = selectStopsByTreeCapacity(capacity);
        if (selected.length === 0) return;

        const createRes = await fetch(`/api/projects/${projectId}/routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ areaId: selected[0].areaId, areaName: selected[0].areaName, dropOffPoint: 'Almindsøhytten' })
        });
        const routeId = await createRes.json();
        if (!routeId) return;

        for (const stop of selected) {
            await handleAssignStop(stop.id, routeId);
        }

        await handleAssignRouteToTeam(routeId, team.id);
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!active || !over) return;

        const [overType, overId] = (over.id as string).split('/', 2);
        const [_, activeType, activeId] = (active.id as string).split('/', 3);

        switch (activeType) {
            case 'capacity': {
                const kind = activeId as TrailerKind;
                const capacity = getTrailerCapacity(kind);
                if (overType === 'team' && overId === 'new') {
                    await createTeamWithTrailerSize(kind);
                } else {
                    await createRouteFromUnassignedCapacity(capacity);
                }
                break;
            }
            case 'team': {
                if (overType === 'unassign' && overId === 'stop') {
                    const team = teams.find(t => t.id === activeId);
                    if (team) {
                        const capacity = getTrailerCapacity(team.trailerSize);
                        await createRouteForTeamFromUnassigned(team, capacity);
                    }
                } else if (overType === 'route') {
                    const team = teams.find(t => t.id === activeId);
                    const route = routes.find(r => r.id === overId);
                    if (team && route) {
                        const capacity = getTrailerCapacity(team.trailerSize);
                        const routeStops = stops.filter(s => s.routeId === route.id);
                        const incompleteStops = routeStops.filter(s => s.status !== 'Completed');
                        const totalIncomplete = incompleteStops.reduce((sum, s) => sum + (s.amount || 0), 0);
                        const noneCompleted = routeStops.every(s => s.status !== 'Completed');

                        if (noneCompleted && totalIncomplete <= capacity) {
                            // Option 1: assign the whole route to the team
                            await handleAssignRouteToTeam(route.id, team.id);
                        } else {
                            // Option 2: create a new route with incomplete stops up to capacity and assign to team
                            let cumulative = 0;
                            const selected: StopSummary[] = [];
                            for (const s of incompleteStops) {
                                const amt = s.amount || 0;
                                if (cumulative + amt <= capacity) {
                                    selected.push(s);
                                    cumulative += amt;
                                } else {
                                    break;
                                }
                            }
                            const base = selected[0];
                            if (base && selected.length > 0) {
                                const createRes = await fetch(`/api/projects/${projectId}/routes`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ areaId: base.areaId, areaName: base.areaName, dropOffPoint: route.dropOffPoint })
                                });
                                const newRouteId = await createRes.json();
                                if (newRouteId) {
                                    for (const stop of selected) {
                                        await handleAssignStop(stop.id, newRouteId);
                                    }
                                    await handleAssignRouteToTeam(newRouteId, team.id);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 'route': {
                if (overType === 'team') {
                    await handleAssignRouteToTeam(activeId, overId);
                } else if (overType === 'unassign' && overId === 'route') {
                    await handleUnassignRouteFromTeam(activeId);
                } else if (overType === 'trash' && overId === 'route') {
                    await handleDeleteRoute(activeId);
                } else if (overType === 'complete' && overId === 'route') {
                    await handleCompleteRoute(activeId);
                } else {
                    return;
                }
                break;
            }
            case 'stop': {
                if (overType === 'route') {
                    await handleAssignStop(activeId, overId);
                } else if (overType === 'unassign' && overId === 'stop') {
                    await handleUnassignStop(activeId);
                } else {
                    return;
                }
                break;
            }
            default:
                return;
        }
    };

    return {
        handleAssignStop,
        handleUnassignStop,
        handleAssignRouteToTeam,
        handleUnassignRouteFromTeam,
        handleDeleteRoute,
        handleCompleteRoute,
        handleDragEnd
    };
};
