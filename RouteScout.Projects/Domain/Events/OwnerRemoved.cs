namespace RouteScout.Projects.Domain.Events;

public record OwnerRemoved(Guid ProjectId, Guid OwnerId, DateTimeOffset RemovedAt);
