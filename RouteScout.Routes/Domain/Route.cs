using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Domain;

public class Route
{
    // Marten aggregate root convention
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DropOffPoint { get; set; } = string.Empty;
    public List<Guid> Stops { get; set; } = new(); // Ordered list of StopIds
    public bool Deleted { get; set; } = false;

    // Apply methods for event sourcing
    public void Apply(RouteCreated e)
    {
        Id = e.RouteId;
        Name = e.Name;
        DropOffPoint = e.DropOffPoint;
        Stops = new List<Guid>();
        Deleted = false;
    }

    public void Apply(RouteRenamed e)
    {
        Name = e.NewName;
    }

    public void Apply(RouteDropOffPointChanged e)
    {
        DropOffPoint = e.NewDropOffPoint;
    }

    public void Apply(StopAddedToRoute e)
    {
        if (!Stops.Contains(e.StopId))
        {
            if (e.Position >= 0 && e.Position <= Stops.Count)
                Stops.Insert(e.Position, e.StopId);
            else
                Stops.Add(e.StopId);
        }
    }

    public void Apply(StopRemovedFromRoute e)
    {
        Stops.Remove(e.StopId);
    }

    public void Apply(RouteSplitPerformed e)
    {
        Deleted = true;
    }

    public void Apply(RouteMerged e)
    {
        Deleted = true;
    }

    public void Apply(RouteDeleted e)
    {
        Deleted = true;
    }
}
