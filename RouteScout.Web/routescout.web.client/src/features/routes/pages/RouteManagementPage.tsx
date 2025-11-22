import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import RouteList from '../components/RouteList';
import UnassignedStopList from '../components/UnassignedStopList';
import AssignStopForm from '../components/AssignStopForm';
import CreateRouteForm from '../components/CreateRouteForm';
import { DroppableTeam } from '../components/DroppableTeam';
import { TeamSummary } from '../../teams/types/TeamSummary';

export interface RouteSummary {
    id: string;
    name: string;
    dropOffPoint: string;
    stops: string[];
    deleted: boolean;
    teamId?: string | null;
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
}

const RouteManagementPage: React.FC = () => {
    const [routes, setRoutes] = useState<RouteSummary[]>([]);
    const [stops, setStops] = useState<StopSummary[]>([]);
    const [teams, setTeams] = useState<TeamSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draggedStop, setDraggedStop] = useState<StopSummary | null>(null);
    const [draggedRoute, setDraggedRoute] = useState<RouteSummary | null>(null);
    const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

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
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignStop = async (stopId: string, routeId: string) => {
        await fetch(`/api/routes/${routeId}/stops/${stopId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: 0 })
        });
        fetchData();
    };

    const handleUnassignStop = async (stopId: string) => {
        await fetch(`/api/stops/${stopId}/unassign`, { method: 'POST' });
        fetchData();
    };

    const handleAssignRouteToTeam = async (routeId: string, teamId: string) => {
        await fetch(`/api/routes/${routeId}/assign-team/${teamId}`, { method: 'POST' });
        fetchData();
    };

    const handleUnassignRouteFromTeam = async (routeId: string) => {
        await fetch(`/api/routes/${routeId}/unassign-team`, { method: 'POST' });
        fetchData();
    };

    const handleDragStart = (event: any) => {
        const id = event.active?.id as string;
        // Distinguish between stop and route by prefix
        if (id.startsWith('route-')) {
            const routeId = id.replace('route-', '');
            setDraggedRoute(routes.find(r => r.id === routeId) || null);
        } else {
            const stop = stops.find(s => s.id === id);
            setDraggedStop(stop || null);
        }
    };

    const handleDragOver = (event: any) => {
        const { active, over } = event;
        if (!active || !over) return;
        console.log(event);

        const overId = over.id as string;

        setHoveredRouteId(overId || null);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        setDraggedStop(null);
        setDraggedRoute(null);
        if (!active || !over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Stop dropped on route or unassign zone
        if (!activeId.startsWith('route-')) {
            if (overId === 'unassign') {
                handleUnassignStop(activeId);
            } else {
                handleAssignStop(activeId, overId);
            }
            return;
        }

        // Route dropped on team or unassign
        if (activeId.startsWith('route-') && overId.startsWith('team-')) {
            const routeId = activeId.replace('route-', '');
            const teamId = overId.replace('team-', '');
            handleAssignRouteToTeam(routeId, teamId);
        }
        if (activeId.startsWith('route-') && overId === 'route-unassign') {
            const routeId = activeId.replace('route-', '');
            handleUnassignRouteFromTeam(routeId);
        }
    };

    const unassignedStops = stops.filter(s => !s.routeId && !s.deleted);

    return (
        <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div>
                <h1 className="text-2xl font-bold mb-4">Route Management</h1>
                <CreateRouteForm onCreated={fetchData} />
                {error && <div className="text-red-600">{error}</div>}
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-semibold mb-2">Teams</h2>
                            <div className="border rounded p-3 mb-4">
                                <div className="text-xs text-gray-500 mb-2">Drag a route onto a team to assign. Drag a route onto "Routes" to clear team.</div>
                                {teams.map(t => <DroppableTeam key={t.id} team={t} routes={routes.filter(r => r.teamId === t.id)} />)}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-semibold mb-2">Routes</h2>
                            <RouteList routes={routes.filter(r => !r.teamId).map(r => ({ ...r, id: r.id }))} stops={stops} onUnassign={handleUnassignStop} hoveredRouteId={hoveredRouteId} />
                        </div>
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-semibold mb-2">Unassigned Stops</h2>
                            <UnassignedStopList stops={unassignedStops} />
                        </div>
                    </div>
                )}
            </div>
            <DragOverlay>
                {draggedStop && (
                    <div className="p-2 border bg-white rounded shadow">Stop: {draggedStop.houseNumber} {draggedStop.streetName}</div>
                )}
                {draggedRoute && (
                    <div className="p-2 border bg-indigo-50 rounded shadow">Route: {draggedRoute.name}</div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default RouteManagementPage;
