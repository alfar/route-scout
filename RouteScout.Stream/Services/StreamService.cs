using System.Collections.Concurrent;

namespace RouteScout.Stream.Services;

public class StreamService
{
    private readonly ConcurrentDictionary<Guid, Func<string, object, Task>> _subscribers = new();

    public Guid Subscribe(Func<string, object, Task> handler)
    {
        var id = Guid.NewGuid();
        _subscribers[id] = handler;
        return id;
    }

    public void Unsubscribe(Guid id)
    {
        _subscribers.TryRemove(id, out _);
    }

    public async Task PublishAsync(string type, object payload)
    {
        var handlers = _subscribers.Values.ToArray();
        foreach (var h in handlers)
        {
            await h(type, payload);
        }
    }
}
