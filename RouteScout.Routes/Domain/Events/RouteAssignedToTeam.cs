namespace RouteScout.Routes.Domain.Events;

public record RouteAssignedToTeam(Guid RouteId, Guid TeamId);
