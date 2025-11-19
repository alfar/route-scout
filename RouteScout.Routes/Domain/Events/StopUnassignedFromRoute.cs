namespace RouteScout.Routes.Domain.Events;

public record StopUnassignedFromRoute(Guid StopId, Guid RouteId);
