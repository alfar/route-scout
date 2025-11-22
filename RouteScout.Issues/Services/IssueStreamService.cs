using System.Collections.Concurrent;
using System.Text.Json;
using RouteScout.Issues.Projections;

namespace RouteScout.Issues.Services;

public class IssueStreamService
{
    private readonly ConcurrentDictionary<Guid, Func<string, IssueSummary, Task>> _subscribers = new();

    public Guid Subscribe(Func<string, IssueSummary, Task> handler)
    {
        var id = Guid.NewGuid();
        _subscribers[id] = handler;
        return id;
    }

    public void Unsubscribe(Guid id)
    {
        _subscribers.TryRemove(id, out _);
    }

    public async Task PublishAsync(string type, IssueSummary summary)
    {
        foreach (var sub in _subscribers.Values)
        {
            try { await sub(type, summary); } catch { /* swallow to not break others */ }
        }
    }
}
