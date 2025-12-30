using RouteScout.Contracts;

namespace RouteScout.Routes.Domain.Events;

public record StopCompleted(Guid StopId, Guid ProjectId) : IProjectEvent;
