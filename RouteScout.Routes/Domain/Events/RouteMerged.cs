using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteMerged(Guid MergedRouteId, Guid ProjectId, Guid MergeIntoRouteId) : IProjectEvent;
