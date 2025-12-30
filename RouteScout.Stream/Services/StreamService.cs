using System.Collections.Concurrent;

namespace RouteScout.Stream.Services;

public class StreamService
{
    private readonly ConcurrentDictionary<Guid, (Guid? ProjectId, Func<string, object, Task> Handler)> _subscribers = new();

    public Guid Subscribe(Guid? projectId, Func<string, object, Task> handler)
    {
        var id = Guid.NewGuid();
        _subscribers[id] = (projectId, handler);
        return id;
    }

    public void Unsubscribe(Guid id)
    {
        _subscribers.TryRemove(id, out _);
    }

    public async Task PublishAsync(string type, object payload, Guid? projectId)
    {
        var matchingSubscribers = _subscribers.Values
            .Where(s => s.ProjectId == null || s.ProjectId == projectId)
            .Select(s => s.Handler)
            .ToArray();

        foreach (var handler in matchingSubscribers)
        {
            await handler(type, payload);
        }
    }
}
