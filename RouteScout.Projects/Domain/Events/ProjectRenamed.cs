namespace RouteScout.Projects.Domain.Events;

public record ProjectRenamed(Guid ProjectId, string NewName, DateTimeOffset UpdatedAt);
