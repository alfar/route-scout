namespace RouteScout.Issues.Domain.Events;

public record IssueCreated(Guid IssueId, Guid ProjectId, DateTimeOffset Timestamp, string Type, string Text);
