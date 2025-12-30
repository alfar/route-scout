using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopDeleted(Guid StopId, Guid ProjectId) : IProjectEvent;
