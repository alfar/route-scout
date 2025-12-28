import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import RouteList from '../components/RouteList';
import UnassignedStopList from '../components/UnassignedStopList';
import { DroppableTeam } from '../components/DroppableTeam';
import { TeamSummary } from '../../teams/types/TeamSummary';
import DroppableContainer from '../components/DroppableContainer';
import DraggableCapacityIcon from '../components/DraggableCapacityIcon';
import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getTrailerCapacity } from '../functions/TrailerFunctions';
import { useEventSource } from '../../stream/context/EventSourceContext';
import TeamLabel from '../components/TeamLabel';
import StopLabel from '../components/StopLabel';
import RouteLabel from '../components/RouteLabel';
import Container from '../components/Container';
import { useTranslation } from 'react-i18next';
import CapacityIcon from '../components/CapacityIcon';

export interface RouteStopDetail {
    stopId: string;
    streetName: string;
    houseNumber: string;
    amount: number;
}

export interface RouteSummary {
    id: string;
    name: string;
    dropOffPoint: string;
    stops: string[];
    stopDetails: RouteStopDetail[];
    deleted: boolean;
    teamId?: string | null;
    extraTrees?: number;
    cutShort?: boolean;
    completed: boolean;
}

export interface StopSummary {
    id: string;
    addressId: string;
    streetId: string;
    streetName: string;
    houseNumber: string;
    amount: number;
    routeId: string | null;
    deleted: boolean;
    status: "Pending" | "Completed" | "NotFound";
    areaId: string;
    areaName?: string; // added client-side dto field for area naming
}

// Discriminated union for a single dragged item
type TrailerKind = 'small' | 'large' | 'boogie';
type DraggedItem =
    | { type: 'stop'; stop: StopSummary }
    | { type: 'route'; route: RouteSummary }
    | { type: 'team'; team: TeamSummary }
    | { type: 'capacity'; kind: TrailerKind; capacity: number };

// General hovered item state
type HoveredItem =
    | { type: 'route'; routeId: string }
    | { type: 'unassign-stop'; capacity: number }
    | { type: 'team'; teamId: string }
    | { type: 'unassign-route' }
    | { type: 'trash-route' };

const RouteManagementPage: React.FC = () => {
    const [routes, setRoutes] = useState<RouteSummary[]>([]);
    const [stops, setStops] = useState<StopSummary[]>([]);
    const [teams, setTeams] = useState<TeamSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);

    const { t } = useTranslation(['routes', 'common']);

    const es = useEventSource();

    // Prefer PointerSensor first, TouchSensor as fallback
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 120, tolerance: 8 },
        })
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const [routesRes, stopsRes, teamsRes] = await Promise.all([
                fetch('/api/routes'),
                fetch('/api/stops'),
                fetch('/api/teams')
            ]);
            const routesData = await routesRes.json();
            const stopsData = await stopsRes.json();
            const teamsData = await teamsRes.json();
            setRoutes(routesData);
            setStops(stopsData);
            setTeams(teamsData);
            setError(null);
        } catch (e) {
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Listen for RouteCreated events from SSE and refresh routes
    useEffect(() => {
        if (!es) return;
        const handleRouteCreated = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => [...prev, { id: json.routeId, name: json.name, deleted: false, stops: [], stopDetails: [], dropOffPoint: json.dropOffPoint, cutShort: false, extraTrees: 0, teamId: null, completed: false }]);
            } catch {
                console.log('[SSE] RouteCreated', data);
            }
        };

        const handleRouteAssignedToTeam = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, teamId: json.teamId } : r));
            } catch {
                console.log('[SSE] RouteAssignedToTeam', data);
            }
        }

        const handleRouteUnassignedFromTeam = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, teamId: null } : r));
            } catch {
                console.log('[SSE] RouteUnassignedFromTeam', data);
            }
        }

        const handleRouteCompleted = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, completed: true } : r));
            } catch {
                console.log('[SSE] RouteUnassignedFromTeam', data);
            }
        }

        const handleRouteDeleted = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.routeId === json.routeId ? { ...s, routeId: null, status: "Pending" } : s));
                setRoutes(prev => prev.filter(r => r.id !== json.routeId));
            } catch {
                console.log('[SSE] RouteDeleted', data);
            }
        };

        const handleRouteExtraTreesAdded = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, extraTrees: (r.extraTrees ?? 0) + json.amount } : r));
            } catch {
                console.log('[SSE] RouteExtraTreesAdded', data);
            }
        };

        const handleRouteExtraTreesRemoved = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, extraTrees: (r.extraTrees ?? 0) - json.amount } : r));
            } catch {
                console.log('[SSE] RouteExtraTreesRemoved', data);
            }
        };

        const handleRouteCutShort = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, cutShort: true } : r));
            } catch {
                console.log('[SSE] RouteCutShort', data);
            }
        };

        es.addEventListener('RouteCreated', handleRouteCreated);
        es.addEventListener('RouteExtraTreesAdded', handleRouteExtraTreesAdded);
        es.addEventListener('RouteExtraTreesRemoved', handleRouteExtraTreesRemoved);
        es.addEventListener('RouteCutShort', handleRouteCutShort);
        es.addEventListener('RouteCompleted', handleRouteCompleted);
        es.addEventListener('RouteDeleted', handleRouteDeleted);
        es.addEventListener('RouteAssignedToTeam', handleRouteAssignedToTeam);
        es.addEventListener('RouteUnassignedFromTeam', handleRouteUnassignedFromTeam);

        const handleStopAddedToRoute = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.id === json.stopId ? { ...s, routeId: json.routeId } : s));
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, stops: [...r.stops, json.stopId] } : r));
            } catch {
                console.log('[SSE] StopAddedToRoute', data);
            }
        }
        const handleStopRemovedFromRoute = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.id === json.stopId ? { ...s, routeId: null, status: "Pending" } : s));
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, stops: r.stops.filter(s => s !== json.stopId) } : r));
            } catch {
                console.log('[SSE] StopRemovedFromRoute', data);
            }
        }
        const handleStopStatusChange = (status: "Pending" | "Completed" | "NotFound") => (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.id === json.stopId ? { ...s, status: status } : s));
            } catch {
                console.log('[SSE] Stop' + status, data);
            }
        }

        const handleStopCompleted = handleStopStatusChange("Completed")
        const handleStopReset = handleStopStatusChange("Pending")
        const handleStopNotFound = handleStopStatusChange("NotFound")

        es.addEventListener('StopCompleted', handleStopCompleted);
        es.addEventListener('StopReset', handleStopReset);
        es.addEventListener('StopNotFound', handleStopNotFound);
        es.addEventListener('StopAddedToRoute', handleStopAddedToRoute);
        es.addEventListener('StopRemovedFromRoute', handleStopRemovedFromRoute);

        return () => {
            es.removeEventListener('RouteCreated', handleRouteCreated);
            es.removeEventListener('RouteCompleted', handleRouteCompleted);
            es.removeEventListener('RouteExtraTreesAdded', handleRouteExtraTreesAdded);
            es.removeEventListener('RouteExtraTreesRemoved', handleRouteExtraTreesRemoved);
            es.removeEventListener('RouteCutShort', handleRouteCutShort);
            es.removeEventListener('RouteDeleted', handleRouteDeleted);
            es.removeEventListener('RouteAssignedToTeam', handleRouteAssignedToTeam);
            es.removeEventListener('RouteUnassignedFromTeam', handleRouteUnassignedFromTeam);

            es.removeEventListener('StopCompleted', handleStopCompleted);
            es.removeEventListener('StopReset', handleStopReset);
            es.removeEventListener('StopNotFound', handleStopNotFound);
            es.removeEventListener('StopAddedToRoute', handleStopAddedToRoute);
            es.removeEventListener('StopRemovedFromRoute', handleStopRemovedFromRoute);
        };
    }, [es]);

    const handleAssignStop = async (stopId: string, routeId: string) => {
        await fetch(`/api/routes/${routeId}/stops/${stopId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: 0 })
        });
    };

    const handleUnassignStop = async (stopId: string) => {
        await fetch(`/api/stops/${stopId}/unassign`, { method: 'POST' });
    };

    const handleAssignRouteToTeam = async (routeId: string, teamId: string) => {
        await fetch(`/api/routes/${routeId}/assign-team/${teamId}`, { method: 'POST' });
    };

    const handleUnassignRouteFromTeam = async (routeId: string) => {
        await fetch(`/api/routes/${routeId}/unassign-team`, { method: 'POST' });
    };

    const handleDeleteRoute = async (routeId: string) => {
        await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
    };

    const handleCompleteRoute = async (routeId: string) => {
        await fetch(`/api/routes/${routeId}/completed`, { method: 'POST' });
    };

    const createTeamWithTrailerSize = async (kind: TrailerKind) => {
        await fetch('/api/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trailerSize: kind, leaderName: "Ukendt", leaderPhone: "" })
        });
        // refresh team list
        const res = await fetch('/api/teams');
        const data = await res.json();
        setTeams(data);
    };

    const handleDragStart = (event: any) => {
        const [_, type, id] = (event.active?.id as string ?? '').split('/', 3);

        switch (type) {
            case 'route': {
                const route = routes.find(r => r.id === id);
                if (route) setDraggedItem({ type: 'route', route });
                break;
            }
            case 'team': {
                const team = teams.find(t => t.id === id);
                if (team) setDraggedItem({ type: 'team', team });
                break;
            }
            case 'capacity': {
                const kind = id as TrailerKind;
                const capacity = getTrailerCapacity(kind);
                setDraggedItem({ type: 'capacity', kind, capacity });
                break;
            }
            case 'stop': {
                const stop = stops.find(s => s.id === id);
                if (stop) setDraggedItem({ type: 'stop', stop });
                break;
            }
        }
    };

    const handleDragOver = (event: any) => {
        const { active, over } = event;
        if (!active || !over) {
            setHoveredItem(null);
            return;
        }
        const [overType, overId] = (over.id as string).split('/', 2);

        // Build a hovered item from the droppable target
        switch (overType) {
            case 'route':
                setHoveredItem({ type: 'route', routeId: overId });
                break;
            case 'team':
                setHoveredItem({ type: 'team', teamId: overId });
                break;
            case 'unassign':
                if (overId === 'stop') {
                    const capacity = draggedItem?.type === 'team'
                        ? getTrailerCapacity(draggedItem.team.trailerSize)
                        : draggedItem?.type === 'capacity'
                            ? draggedItem.capacity
                            : 0;
                    setHoveredItem({ type: 'unassign-stop', capacity });
                } else if (overId === 'route') {
                    setHoveredItem({ type: 'unassign-route' });
                } else {
                    setHoveredItem(null);
                }
                break;
            case 'trash':
                if (overId === 'route') setHoveredItem({ type: 'trash-route' });
                else setHoveredItem(null);
                break;
            default:
                setHoveredItem(null);
                break;
        }
    };

    // Select stops based on tree capacity (sum of amounts <= capacity)
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
        const createRes = await fetch('/api/routes', {
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

        const createRes = await fetch('/api/routes', {
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
        setDraggedItem(null);
        setHoveredItem(null);
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
                                const createRes = await fetch('/api/routes', {
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

        //fetchData();
    };

    const handleDragCancel = () => {
        setDraggedItem(null);
        setHoveredItem(null);
    };

    const unassignedStops = stops.filter(s => !s.routeId && !s.deleted);

    const isDraggingRoute = draggedItem?.type === 'route';
    const isDraggingCompletedRoute = isDraggingRoute && !draggedItem.route.completed && stops.every(s => s.routeId === draggedItem!.route.id ? s.deleted || s.status === 'Completed' : true);
    const highlightUnassignedCount = hoveredItem?.type === 'unassign-stop' ? hoveredItem.capacity : 0;

    // Tree counts
    const totalTrees = stops.filter(s => !s.deleted).reduce((sum, s) => sum + (s.amount || 0), 0);
    const completedTrees = stops.filter(s => !s.deleted && s.status === 'Completed').reduce((sum, s) => sum + (s.amount || 0), 0);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            <div className="p-3 lg:p-4 overscroll-contain">
                <h1 className="text-2xl font-bold mb-1">{t('dispatchTitle')}</h1>
                <div className="text-sm text-gray-700 mb-3">{completedTrees} / {t('treesLabel', { count: totalTrees })}</div>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {loading ? (
                    <div>{t('loading')}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <h2 className="text-xl font-semibold mb-2">{t('trailersSectionTitle')}</h2>
                            <Container>
                                <div className="flex flex-col gap-2 mb-2 justify-items-stretch">
                                    {/* Draggable capacity icons */}
                                    <DraggableCapacityIcon kind="small" />
                                    <DraggableCapacityIcon kind="large" />
                                    <DraggableCapacityIcon kind="boogie" />
                                </div>
                            </Container>
                            <h2 className="text-xl font-semibold mb-2">{t('stopsSectionTitle')}</h2>
                            <DroppableContainer id="unassign/stop">
                                <div className="text-xs text-gray-500">{t('dragHereCreateRoute')}</div>
                                <UnassignedStopList stops={unassignedStops} highlightCount={highlightUnassignedCount} />
                            </DroppableContainer>
                        </div>

                        <div className="md:col-span-1">
                            <h2 className="text-xl font-semibold mb-2">{t('routesSectionTitle')}</h2>
                            <DroppableContainer id="unassign/route">
                                <div className="text-xs text-gray-500 mb-2">{t('dropRouteClearTeam')}</div>
                                <RouteList routes={routes.filter(r => !r.teamId).map(r => ({ ...r, id: r.id }))} stops={stops} teams={teams} />
                            </DroppableContainer>
                            <div
                                className={`mt-3 transition-opacity duration-200 ${isDraggingRoute ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                aria-hidden={!isDraggingRoute}
                            >
                                <DroppableContainer id="trash/route">
                                    <div className="w-20 h-20 rounded-full border border-red-300 bg-red-100 flex items-center justify-center mx-auto">
                                        <TrashIcon className="w-10 h-10 text-red-700" />
                                    </div>
                                </DroppableContainer>
                            </div>
                            <div
                                className={`mt-3 transition-opacity duration-200 ${isDraggingRoute && isDraggingCompletedRoute ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                aria-hidden={!isDraggingRoute}
                            >
                                <DroppableContainer id="complete/route">
                                    <div className="w-20 h-20 rounded-full border border-green-300 bg-green-100 flex items-center justify-center mx-auto">
                                        <CheckIcon className="w-10 h-10 text-green-700" />
                                    </div>
                                </DroppableContainer>
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <h2 className="text-xl font-semibold mb-2">{t('teamsSectionTitle')}</h2>
                            <DroppableContainer id="team/new">
                                <div className="border border-gray-400 rounded p-3 flex flex-col gap-2">
                                    <div className="text-xs text-gray-500 mb-2">{t('dragTeamHints')}</div>
                                    {teams.map(t => (
                                        <DroppableTeam key={t.id} team={t} routes={routes.filter(r => r.teamId === t.id)} stops={stops} teams={teams} />
                                    ))}
                                </div>
                            </DroppableContainer>
                        </div>
                    </div>
                )
                }
            </div >
            <DragOverlay>
                {draggedItem?.type === 'stop' && (
                    <div className="p-4 border border-gray-200 rounded bg-white min-w-2xs">
                        <StopLabel stop={draggedItem.stop} />
                    </div>
                )}
                {draggedItem?.type === 'route' && (
                    <div className="p-4 border border-gray-200 rounded bg-white min-w-2xs">
                        <RouteLabel route={draggedItem.route} />
                    </div>
                )}
                {draggedItem?.type === 'team' && (
                    <div className="p-4 border border-gray-200 rounded bg-white min-w-2xs">
                        <TeamLabel team={draggedItem.team} />
                    </div>
                )}
                {draggedItem?.type === 'capacity' && (
                    <div className="px-3 py-2 rounded border border-gray-600 text-gray-600 bg-white">
                        <CapacityIcon kind={draggedItem.kind} />
                    </div>
                )}
            </DragOverlay>
        </DndContext >

    );
};

export default RouteManagementPage;
