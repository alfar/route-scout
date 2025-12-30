using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteCutShort(Guid RouteId, Guid ProjectId) : IProjectEvent;
