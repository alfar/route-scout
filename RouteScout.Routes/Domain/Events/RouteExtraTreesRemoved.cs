using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteExtraTreesRemoved(Guid RouteId, Guid ProjectId, int Amount) : IProjectEvent;
