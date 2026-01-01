import { useEffect } from 'react';
import { StopSummary } from '../pages/RouteManagementPage';

interface UseStopEventsProps {
    eventSource: EventSource | null;
    setStops: React.Dispatch<React.SetStateAction<StopSummary[]>>;
    setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useStopEvents = ({ eventSource, setStops, setRoutes }: UseStopEventsProps) => {
    useEffect(() => {
        if (!eventSource) return;

        const handleStopAddedToRoute = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.id === json.stopId ? { ...s, routeId: json.routeId } : s));
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, stops: [...r.stops, json.stopId] } : r));
            } catch {
                console.log('[SSE] StopAddedToRoute', data);
            }
        };

        const handleStopRemovedFromRoute = (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.id === json.stopId ? { ...s, routeId: null, status: "Pending" } : s));
                setRoutes(prev => prev.map(r => r.id === json.routeId ? { ...r, stops: r.stops.filter(s => s !== json.stopId) } : r));
            } catch {
                console.log('[SSE] StopRemovedFromRoute', data);
            }
        };

        const handleStopStatusChange = (status: "Pending" | "Completed" | "NotFound") => (e: Event) => {
            const data = (e as MessageEvent).data;
            try {
                const json = JSON.parse(data);
                setStops(prev => prev.map(s => s.id === json.stopId ? { ...s, status: status } : s));
            } catch {
                console.log('[SSE] Stop' + status, data);
            }
        };

        const handleStopCompleted = handleStopStatusChange("Completed");
        const handleStopReset = handleStopStatusChange("Pending");
        const handleStopNotFound = handleStopStatusChange("NotFound");

        eventSource.addEventListener('StopCompleted', handleStopCompleted);
        eventSource.addEventListener('StopReset', handleStopReset);
        eventSource.addEventListener('StopNotFound', handleStopNotFound);
        eventSource.addEventListener('StopAddedToRoute', handleStopAddedToRoute);
        eventSource.addEventListener('StopRemovedFromRoute', handleStopRemovedFromRoute);

        return () => {
            eventSource.removeEventListener('StopCompleted', handleStopCompleted);
            eventSource.removeEventListener('StopReset', handleStopReset);
            eventSource.removeEventListener('StopNotFound', handleStopNotFound);
            eventSource.removeEventListener('StopAddedToRoute', handleStopAddedToRoute);
            eventSource.removeEventListener('StopRemovedFromRoute', handleStopRemovedFromRoute);
        };
    }, [eventSource, setStops, setRoutes]);
};
