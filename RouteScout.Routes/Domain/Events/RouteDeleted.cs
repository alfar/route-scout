using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteDeleted(Guid RouteId, Guid ProjectId) : IProjectEvent;
