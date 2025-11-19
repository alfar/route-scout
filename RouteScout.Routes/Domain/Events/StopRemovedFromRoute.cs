namespace RouteScout.Routes.Domain.Events;

public record StopRemovedFromRoute(Guid RouteId, Guid StopId);
