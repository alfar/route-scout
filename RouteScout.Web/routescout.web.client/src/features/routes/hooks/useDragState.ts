import { useState } from 'react';
import { StopSummary, RouteSummary } from '../pages/RouteManagementPage';
import { TeamSummary } from '../../teams/types/TeamSummary';
import { getTrailerCapacity } from '../functions/TrailerFunctions';

type TrailerKind = 'small' | 'large' | 'boogie';

type DraggedItem =
    | { type: 'stop'; stop: StopSummary }
    | { type: 'route'; route: RouteSummary }
    | { type: 'team'; team: TeamSummary }
    | { type: 'capacity'; kind: TrailerKind; capacity: number };

type HoveredItem =
    | { type: 'route'; routeId: string }
    | { type: 'unassign-stop'; capacity: number }
    | { type: 'team'; teamId: string }
    | { type: 'unassign-route' }
    | { type: 'trash-route' };

interface UseDragStateProps {
    routes: RouteSummary[];
    stops: StopSummary[];
    teams: TeamSummary[];
}

export const useDragState = ({ routes, stops, teams }: UseDragStateProps) => {
    const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);

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

    const handleDragCancel = () => {
        setDraggedItem(null);
        setHoveredItem(null);
    };

    return {
        draggedItem,
        hoveredItem,
        setDraggedItem,
        setHoveredItem,
        handleDragStart,
        handleDragOver,
        handleDragCancel
    };
};
