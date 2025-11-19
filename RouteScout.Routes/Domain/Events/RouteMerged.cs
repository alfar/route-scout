namespace RouteScout.Routes.Domain.Events;

public record RouteMerged(Guid MergedRouteId, Guid MergeIntoRouteId);
