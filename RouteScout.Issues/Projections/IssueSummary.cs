using RouteScout.Issues.Domain.Events;

namespace RouteScout.Issues.Projections;

public class IssueSummary
{
    public Guid Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool Done { get; set; }

    public static IssueSummary Create(IssueCreated e) => new()
    {
        Id = e.IssueId,
        CreatedAt = e.Timestamp,
        Type = e.Type,
        Text = e.Text,
        Done = false
    };

    public void Apply(IssueMarkedDone e)
    {
        Done = true;
    }
}
