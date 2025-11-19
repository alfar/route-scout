namespace RouteScout.Routes.Domain.Events;

public record RouteCreated(Guid RouteId, string Name, string DropOffPoint);
