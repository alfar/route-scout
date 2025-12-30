using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteUnassignedFromTeam(Guid RouteId, Guid ProjectId, Guid TeamId) : IProjectEvent;
