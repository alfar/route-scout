import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import RouteList from '../components/RouteList';
import UnassignedStopList from '../components/UnassignedStopList';
import AssignStopForm from '../components/AssignStopForm';
import CreateRouteForm from '../components/CreateRouteForm';

export interface RouteSummary {
    id: string;
    name: string;
    dropOffPoint: string;
    stops: string[];
    deleted: boolean;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draggedStop, setDraggedStop] = useState<StopSummary | null>(null);
    const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [routesRes, stopsRes] = await Promise.all([
                fetch('/api/routes'),
                fetch('/api/stops'),
            ]);
            const routesData = await routesRes.json();
            const stopsData = await stopsRes.json();
            setRoutes(routesData);
            setStops(stopsData);
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

    const handleAssign = async (stopId: string, routeId: string) => {
        await fetch(`/api/routes/${routeId}/stops/${stopId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: 0 }), // Default to start, could be improved
        });
        fetchData();
    };

    const handleUnassign = async (stopId: string) => {
        await fetch(`/api/stops/${stopId}/unassign`, {
            method: 'POST'
        });
        fetchData();
    };

    const handleDragStart = (event: any) => {
        const stopId = event.active?.id;
        if (stopId) {
            const stop = stops.find(s => s.id === stopId);
            setDraggedStop(stop || null);
        }
    };

    const handleDragOver = (event: any) => {
        setHoveredRouteId(event.over?.id || null);
    };

    const handleDragEnd = (event: any) => {
        setDraggedStop(null);
        const { active, over } = event;
        if (active && over && active.id && over.id && active.id !== over.id) {
            if (over.id === "unassign") {
                handleUnassign(active.id)
            }
            // Assign stop to route
            handleAssign(active.id, over.id);
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
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-2">Routes</h2>
                                <RouteList routes={routes} stops={stops} onUnassign={handleUnassign} hoveredRouteId={hoveredRouteId} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-2">Unassigned Stops</h2>
                                <UnassignedStopList stops={unassignedStops} />
                        </div>
                    </div>
                )}
            </div>
            <DragOverlay>
                {draggedStop ? (
                    <div
                        style={{
                            padding: '8px',
                            border: '1px solid #60a5fa',
                            background: '#e0f7fa',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        {draggedStop.houseNumber} (#{draggedStop.id.slice(0, 6)})
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default RouteManagementPage;
