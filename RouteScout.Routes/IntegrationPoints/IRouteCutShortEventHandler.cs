using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.IntegrationPoints
{
    public interface IRouteCutShortEventHandler
    {
        public Task HandleAsync(RouteCutShort @event);
    }
}
