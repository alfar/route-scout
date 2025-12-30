using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteAssignedToTeam(Guid RouteId, Guid ProjectId, Guid TeamId) : IProjectEvent;
