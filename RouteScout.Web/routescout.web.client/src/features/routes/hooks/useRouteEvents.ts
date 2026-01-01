import { useEffect } from 'react';
import { RouteSummary } from '../pages/RouteManagementPage';

interface UseRouteEventsProps {
    eventSource: EventSource | null;
    setRoutes: React.Dispatch<React.SetStateAction<RouteSummary[]>>;
    setStops: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useRouteEvents = ({ eventSource, setRoutes, setStops }: UseRouteEventsProps) => {
    useEffect(() => {
        if (!eventSource) return;

        const handleRouteCreated = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => [...prev, {
                    id: json.routeId,
                    name: json.name,
                    deleted: false,
                    stops: [],
                    stopDetails: [],
                    dropOffPoint: json.dropOffPoint,
                    cutShort: false,
                    extraTrees: 0,
                    teamId: null,
                    completed: false
                }]);
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
        };

        const handleRouteUnassignedFromTeam = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, teamId: null } : r));
            } catch {
                console.log('[SSE] RouteUnassignedFromTeam', data);
            }
        };

        const handleRouteCompleted = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, completed: true } : r));
            } catch {
                console.log('[SSE] RouteCompleted', data);
            }
        };

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

        eventSource.addEventListener('RouteCreated', handleRouteCreated);
        eventSource.addEventListener('RouteExtraTreesAdded', handleRouteExtraTreesAdded);
        eventSource.addEventListener('RouteExtraTreesRemoved', handleRouteExtraTreesRemoved);
        eventSource.addEventListener('RouteCutShort', handleRouteCutShort);
        eventSource.addEventListener('RouteCompleted', handleRouteCompleted);
        eventSource.addEventListener('RouteDeleted', handleRouteDeleted);
        eventSource.addEventListener('RouteAssignedToTeam', handleRouteAssignedToTeam);
        eventSource.addEventListener('RouteUnassignedFromTeam', handleRouteUnassignedFromTeam);

        return () => {
            eventSource.removeEventListener('RouteCreated', handleRouteCreated);
            eventSource.removeEventListener('RouteCompleted', handleRouteCompleted);
            eventSource.removeEventListener('RouteExtraTreesAdded', handleRouteExtraTreesAdded);
            eventSource.removeEventListener('RouteExtraTreesRemoved', handleRouteExtraTreesRemoved);
            eventSource.removeEventListener('RouteCutShort', handleRouteCutShort);
            eventSource.removeEventListener('RouteDeleted', handleRouteDeleted);
            eventSource.removeEventListener('RouteAssignedToTeam', handleRouteAssignedToTeam);
            eventSource.removeEventListener('RouteUnassignedFromTeam', handleRouteUnassignedFromTeam);
        };
    }, [eventSource, setRoutes, setStops]);
};
