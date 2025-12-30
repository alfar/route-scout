using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteCompleted(Guid RouteId, Guid ProjectId) : IProjectEvent;
