using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteExtraTreesAdded(Guid RouteId, Guid ProjectId, int Amount) : IProjectEvent;
