using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopUnassignedFromRoute(Guid StopId, Guid ProjectId, Guid RouteId) : IProjectEvent;
