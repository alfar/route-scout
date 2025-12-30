using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopRemovedFromRoute(Guid RouteId, Guid ProjectId, Guid StopId) : IProjectEvent;
