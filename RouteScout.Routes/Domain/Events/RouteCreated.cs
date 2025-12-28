namespace RouteScout.Routes.Domain.Events;

public record RouteCreated(Guid RouteId, Guid ProjectId, string Name, string DropOffPoint);
