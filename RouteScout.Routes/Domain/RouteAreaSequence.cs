using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Domain;

// Aggregate tracking per-area route sequence numbers
public class RouteAreaSequence
{
    public Guid Id { get; set; }

    // Next value to use for the next route created in this area
    public int NextValue { get; set; } = 1;

    // Initialize aggregate when first event arrives (optional, depends on event store behavior)
    public void Apply(RouteCreatedInArea e)
    {
        // Ensure Id is set to the area Id
        Id = e.AreaId;
        // Increment for next usage
        NextValue++;
    }
}
