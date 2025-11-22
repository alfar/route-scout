namespace RouteScout.Routes.Domain.Events;

public record RouteUnassignedFromTeam(Guid RouteId, Guid TeamId);
