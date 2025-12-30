using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopReset(Guid StopId, Guid ProjectId) : IProjectEvent;
