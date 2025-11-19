namespace RouteScout.Routes.Domain.Events;

public record RouteDropOffPointChanged(Guid RouteId, string NewDropOffPoint);
