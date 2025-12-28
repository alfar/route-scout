using RouteScout.Projects.Domain.Events;

namespace RouteScout.Projects.Domain;

public class Project
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public List<Guid> OwnerIds { get; private set; } = new();
    public DateTimeOffset CreatedAt { get; private set; }

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

    // Factory method
    public static IEnumerable<object> Create(Guid projectId, string name, List<Guid> ownerIds)
    {
        yield return new ProjectCreated(projectId, name, ownerIds, DateTimeOffset.UtcNow);
    }

    public IEnumerable<object> Rename(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Name cannot be empty", nameof(newName));
        
        if (Name == newName)
            yield break;

        yield return new ProjectRenamed(Id, newName, DateTimeOffset.UtcNow);
    }

    public IEnumerable<object> AddOwner(Guid ownerId)
    {
        if (OwnerIds.Contains(ownerId))
            yield break;

        yield return new OwnerAdded(Id, ownerId, DateTimeOffset.UtcNow);
    }

    public IEnumerable<object> RemoveOwner(Guid ownerId)
    {
        if (!OwnerIds.Contains(ownerId))
            yield break;

        yield return new OwnerRemoved(Id, ownerId, DateTimeOffset.UtcNow);
    }
}
