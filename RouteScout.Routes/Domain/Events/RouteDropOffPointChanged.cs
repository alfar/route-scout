using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record RouteDropOffPointChanged(Guid RouteId, Guid ProjectId, string NewDropOffPoint) : IProjectEvent;
