using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopNotFound(Guid StopId, Guid ProjectId) : IProjectEvent;
