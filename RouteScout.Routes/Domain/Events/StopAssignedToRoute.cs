namespace RouteScout.Routes.Domain.Events;

public record StopAssignedToRoute(Guid StopId, Guid RouteId);
