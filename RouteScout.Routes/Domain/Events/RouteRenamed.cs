using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteRenamed(Guid RouteId, Guid ProjectId, string NewName) : IProjectEvent;
