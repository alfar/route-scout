import { useEffect, useRef, useState } from 'react';

interface IssueSummary {
  id: string;
  createdAt: string; // ISO from server
  type: string;
  text: string;
  done: boolean;
}

interface Props {
  className?: string;
}

// Component: live issues list via Server-Sent Events (/api/issues/stream)
export function IssuesStream({ className }: Props) {
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/issues/stream');
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onerror = () => {
      setConnected(false);
      setError('Disconnected from issue stream');
    };

    const handleSnapshot = (e: MessageEvent) => {
      const issue: IssueSummary = JSON.parse(e.data);
      setIssues(prev => {
        if (prev.some(i => i.id === issue.id)) return prev; // skip duplicates
        return [...prev, issue].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    };

    const handleCreated = (e: MessageEvent) => {
      const issue: IssueSummary = JSON.parse(e.data);
      setIssues(prev => [issue, ...prev.filter(i => i.id !== issue.id)]);
    };

    const handleDone = (e: MessageEvent) => {
      const issue: IssueSummary = JSON.parse(e.data);
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, done: true } : i));
    };

    es.addEventListener('snapshot', handleSnapshot);
    es.addEventListener('created', handleCreated);
    es.addEventListener('done', handleDone);

    return () => {
      es.removeEventListener('snapshot', handleSnapshot);
      es.removeEventListener('created', handleCreated);
      es.removeEventListener('done', handleDone);
      es.close();
    };
  }, []);

  const activeIssues = issues.filter(i => !i.done);

  async function markDone(id: string) {
    try {
      await fetch(`/api/issues/${id}/done`, { method: 'POST' });
      // optimistic update; SSE will confirm
      setIssues(prev => prev.map(i => i.id === id ? { ...i, done: true } : i));
    } catch {
      setError('Failed to mark issue done');
    }
  }

  return (
    <div className={className ?? 'border rounded p-4 bg-white shadow-sm'}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Active Issues</h2>
        <span className={`text-xs ${connected ? 'text-green-600' : 'text-red-600'}`}>{connected ? 'Live' : 'Offline'}</span>
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      {activeIssues.length === 0 && <div className="text-xs text-gray-500">No active issues.</div>}
      <ul className="flex flex-col gap-2">
        {activeIssues.map(issue => (
          <li key={issue.id} className="border rounded p-2 bg-gray-50">
            <div className="text-sm font-medium flex justify-between">
              <span>{issue.type}</span>
              <span className="text-xs text-gray-500">{new Date(issue.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="text-xs mt-1 whitespace-pre-wrap">{issue.text}</div>
            <div className="mt-2 flex justify-end">
              <button onClick={() => markDone(issue.id)} className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">Mark Done</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IssuesStream;
