import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import RouteList from '../components/RouteList';
import UnassignedStopList from '../components/UnassignedStopList';
import { DroppableTeam } from '../components/DroppableTeam';
import { TeamSummary } from '../../teams/types/TeamSummary';
import DroppableContainer from '../components/DroppableContainer';
import DraggableCapacityIcon from '../components/DraggableCapacityIcon';
import { TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useEventSource } from '../../stream/context/EventSourceContext';
import TeamLabel from '../components/TeamLabel';
import StopLabel from '../components/StopLabel';
import RouteLabel from '../components/RouteLabel';
import Container from '../components/Container';
import { useTranslation } from 'react-i18next';
import CapacityIcon from '../components/CapacityIcon';
import { useRouteEvents } from '../hooks/useRouteEvents';
import { useStopEvents } from '../hooks/useStopEvents';
import { useDragHandlers } from '../hooks/useDragHandlers';
import { useDragState } from '../hooks/useDragState';

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
    areaName?: string;
}

const RouteManagementPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [routes, setRoutes] = useState<RouteSummary[]>([]);
    const [stops, setStops] = useState<StopSummary[]>([]);
    const [teams, setTeams] = useState<TeamSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        if (!projectId) return;
        setLoading(true);
        try {
            const [routesRes, stopsRes, teamsRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/routes`),
                fetch(`/api/projects/${projectId}/stops`),
                fetch(`/api/projects/${projectId}/teams`)
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
    }, [projectId]);

    // Use custom hooks for event handling
    useRouteEvents({ eventSource: es, setRoutes, setStops });
    useStopEvents({ eventSource: es, setStops, setRoutes });

    // Use custom hook for drag state
    const {
        draggedItem,
        hoveredItem,
        setDraggedItem,
        setHoveredItem,
        handleDragStart,
        handleDragOver,
        handleDragCancel
    } = useDragState({ routes, stops, teams });

    // Use custom hook for drag handlers
    const { handleDragEnd } = useDragHandlers({
        projectId,
        routes,
        stops,
        teams,
        setTeams
    });

    const onDragEnd = async (event: any) => {
        await handleDragEnd(event);
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
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={onDragEnd} onDragCancel={handleDragCancel}>
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
                                <div className="border border-gray-600 rounded p-3 flex flex-col gap-2">
                                    <div className="text-xs text-gray-500 mb-2">{t('dragTeamHints')}</div>
                                    {teams.map(t => (
                                        <DroppableTeam key={t.id} team={t} routes={routes.filter(r => r.teamId === t.id)} stops={stops} teams={teams} />
                                    ))}
                                </div>
                            </DroppableContainer>
                        </div>
                    </div>
                )}
            </div>
            <DragOverlay>
                {draggedItem?.type === 'stop' && (
                    <div className="p-4 border border-gray-600 rounded bg-white min-w-2xs">
                        <StopLabel stop={draggedItem.stop} />
                    </div>
                )}
                {draggedItem?.type === 'route' && (
                    <div className="p-4 border border-gray-600 rounded bg-white min-w-2xs">
                        <RouteLabel route={draggedItem.route} />
                    </div>
                )}
                {draggedItem?.type === 'team' && (
                    <div className="p-4 border border-gray-600 rounded bg-white min-w-2xs">
                        <TeamLabel team={draggedItem.team} />
                    </div>
                )}
                {draggedItem?.type === 'capacity' && (
                    <div className="px-3 py-2 rounded border border-gray-600 text-gray-600 bg-white">
                        <CapacityIcon kind={draggedItem.kind} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default RouteManagementPage;
