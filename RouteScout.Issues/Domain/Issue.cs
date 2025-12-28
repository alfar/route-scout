using RouteScout.Issues.Domain.Events;

namespace RouteScout.Issues.Domain;

public class Issue
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool Done { get; set; }

    public void Apply(IssueCreated e)
    {
        Id = e.IssueId;
        ProjectId = e.ProjectId;
        CreatedAt = e.Timestamp;
        Type = e.Type;
        Text = e.Text;
        Done = false;
    }

    public void Apply(IssueMarkedDone e)
    {
        Done = true;
    }
}
