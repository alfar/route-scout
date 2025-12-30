using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteSplitPerformed(Guid OriginalRouteId, Guid ProjectId, Guid NewRouteId1, Guid NewRouteId2, int Position) : IProjectEvent;
