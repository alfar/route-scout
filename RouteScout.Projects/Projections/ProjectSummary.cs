using RouteScout.Projects.Domain.Events;

namespace RouteScout.Projects.Projections;

public class ProjectSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Guid> OwnerIds { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }

    public void Apply(ProjectCreated e)
    {
        Id = e.ProjectId;
        Name = e.Name;
        OwnerIds = new List<Guid>(e.OwnerIds);
        CreatedAt = e.CreatedAt;
    }

    public void Apply(ProjectRenamed e)
    {
        Name = e.NewName;
    }

    public void Apply(OwnerAdded e)
    {
        if (!OwnerIds.Contains(e.OwnerId))
        {
            OwnerIds.Add(e.OwnerId);
        }
    }

    public void Apply(OwnerRemoved e)
    {
        OwnerIds.Remove(e.OwnerId);
    }
}
