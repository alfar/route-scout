import { createContext, useContext } from 'react';

export type EventSourceContextValue = EventSource | null;

export const EventSourceContext = createContext<EventSourceContextValue>(null);

export function useEventSource(): EventSource | null {
  return useContext(EventSourceContext);
}
