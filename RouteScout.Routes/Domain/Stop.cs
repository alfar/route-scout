using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Domain;

public class Stop
{
    // Marten aggregate root convention
    public Guid Id { get; set; }
    public Guid AddressId { get; set; }
    public Guid StreetId { get; set; }
    public string StreetName { get; set; } = string.Empty;
    public string HouseNumber { get; set; } = string.Empty;
    public int Amount { get; set; }
    public Guid? RouteId { get; set; }
    public bool Deleted { get; set; } = false;
    public StopStatus Status { get; set; } = StopStatus.Pending;

    // Apply methods for event sourcing
    public void Apply(StopCreated e)
    {
        Id = e.StopId;
        AddressId = e.AddressId;
        StreetId = e.StreetId;
        StreetName = e.StreetName;
        HouseNumber = e.HouseNumber;
        Amount = e.Amount;
        RouteId = null;
        Deleted = false;
        Status = StopStatus.Pending;
    }

    public void Apply(StopAssignedToRoute e)
    {
        RouteId = e.RouteId;
    }

    public void Apply(StopUnassignedFromRoute e)
    {
        RouteId = null;
    }

    public void Apply(StopDeleted e)
    {
        Deleted = true;
    }

    public void Apply(StopCompleted e)
    {
        Status = StopStatus.Completed;
    }

    public void Apply(StopNotFound e)
    {
        Status = StopStatus.NotFound;
    }

    public void Apply(StopReset e)
    {
        Status = StopStatus.Pending;
    }
}

public enum StopStatus
{
    Pending = 0,
    Completed = 1,
    NotFound = 2
}
