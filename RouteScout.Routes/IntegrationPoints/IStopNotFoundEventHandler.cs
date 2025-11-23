using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Integrations
{
    public interface IStopNotFoundEventHandler
    {
        public Task HandleAsync(StopNotFound @event);

    }
}
