namespace RouteScout.Projects.Domain.Events;

public record ProjectCreated(Guid ProjectId, string Name, List<Guid> OwnerIds, DateTimeOffset CreatedAt);
