namespace RouteScout.Contracts;

/// <summary>
/// Marker interface for events that belong to a specific project.
/// Events implementing this interface will be filtered by ProjectId when streaming.
/// </summary>
public interface IProjectEvent
{
    Guid ProjectId { get; }
}
