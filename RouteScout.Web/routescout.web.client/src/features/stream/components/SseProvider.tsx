import { useEffect, useMemo, useRef } from 'react';
import { EventSourceContext } from '../context/EventSourceContext';

/**
 * `SseProvider` creates an `EventSource` for `/api/stream`, logs events,
 * and provides it via context. Guards against double-mount in React Strict Mode.
 */
export default function SseProvider({ children }: { children?: React.ReactNode }) {
  const esRef = useRef<EventSource | null>(null);
  const initializedRef = useRef(false);

  const es = useMemo(() => {
    if (!esRef.current) {
      esRef.current = new EventSource('/api/stream', { withCredentials: false });
    }
    return esRef.current;
  }, []);

  useEffect(() => {
    if (!es) return;
    if (initializedRef.current) return; // prevent double subscription in dev
    initializedRef.current = true;

    const stateLabel = ['CONNECTING', 'OPEN', 'CLOSED'] as const;
    console.log('[SSE] readyState', stateLabel[es.readyState] ?? es.readyState, es.url);

    const onOpen = () => console.log('[SSE] open');
    const onError = (e: Event) => console.error('[SSE] error', e);
    const onMessage = (e: MessageEvent) => {
      try { console.log('[SSE] message', JSON.parse(e.data)); }
      catch { console.log('[SSE] message', e.data); }
    };

    // Use addEventListener for consistency, avoid onXXX overwrites
    es.addEventListener('error', onError as EventListener);
    es.addEventListener('message', onMessage as EventListener);
    // `open` is not standard across browsers via addEventListener, but many support it; still set onopen for reliability
    es.onopen = onOpen;

    const customEvents = [
      'RouteCreated',
      'RouteRenamed',
      'StopAddedToRoute',
      'StopRemovedFromRoute',
      'RouteAssignedToTeam',
      'RouteUnassignedFromTeam',
      'RouteCompleted',
      'RouteDeleted',
      'StopCompleted',
      'StopNotFound',
      'TeamCreated',
      'TeamUpdated',
      'TeamMemberAdded',
      'TeamMemberRemoved',
    ];

    const handlers = new Map<string, EventListener>();
    for (const name of customEvents) {
      const handler: EventListener = (ev) => {
        const e = ev as MessageEvent;
        try { console.log(`[SSE] ${name}`, JSON.parse(e.data)); }
        catch { console.log(`[SSE] ${name}`, e.data); }
      };
      es.addEventListener(name, handler);
      handlers.set(name, handler);
    }

    return () => {
      // In dev Strict Mode, cleanup runs; keep EventSource alive across fast refresh by not closing if still referenced
      es.onopen = null;
      es.removeEventListener('error', onError as EventListener);
      es.removeEventListener('message', onMessage as EventListener);
      for (const [name, handler] of handlers) {
        es.removeEventListener(name, handler);
      }
      initializedRef.current = false;
      // Optional: do not close here to avoid losing stream on fast-refresh. If you need hard-close:
      // es.close(); esRef.current = null;
    };
  }, [es]);

  return <EventSourceContext.Provider value={es}>{children ?? null}</EventSourceContext.Provider>;
}
