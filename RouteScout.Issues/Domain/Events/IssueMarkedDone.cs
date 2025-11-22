namespace RouteScout.Issues.Domain.Events;

public record IssueMarkedDone(Guid IssueId, DateTimeOffset Timestamp);
