namespace RouteScout.Projects.Domain.Events;

public record OwnerAdded(Guid ProjectId, Guid OwnerId, DateTimeOffset AddedAt);
