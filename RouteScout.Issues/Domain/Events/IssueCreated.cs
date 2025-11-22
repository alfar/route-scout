namespace RouteScout.Issues.Domain.Events;

public record IssueCreated(Guid IssueId, DateTimeOffset Timestamp, string Type, string Text);
