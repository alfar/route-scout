using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopAssignedToRoute(Guid StopId, Guid ProjectId, Guid RouteId) : IProjectEvent;
