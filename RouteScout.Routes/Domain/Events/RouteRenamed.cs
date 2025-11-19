namespace RouteScout.Routes.Domain.Events;

public record RouteRenamed(Guid RouteId, string NewName);
