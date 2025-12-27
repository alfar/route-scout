using RouteScout.Routes.Domain;
using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Projections
{
    public class StopSummary
    {
        public Guid Id { get; set; }
        public Guid AddressId { get; set; }
        public Guid StreetId { get; set; }
        public string StreetName { get; set; } = string.Empty;
        public string HouseNumber { get; set; } = string.Empty;
        public int Amount { get; set; }
        public Guid? RouteId { get; set; }
        public bool Deleted { get; set; }
        public StopStatus Status { get; set; }
        public int SortOrder { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public Guid AreaId { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }


        public static StopSummary Create(StopCreated e) => new()
        {
            Id = e.StopId,
            AddressId = e.AddressId,
            StreetId = e.StreetId,
            StreetName = e.StreetName,
            HouseNumber = e.HouseNumber,
            Amount = e.Amount,
            RouteId = null,
            Deleted = false,
            Status = StopStatus.Pending,
            SortOrder = e.SortOrder,
            AreaId = e.AreaId,
            AreaName = e.AreaName,
            Latitude = e.Latitude,
            Longitude = e.Longitude
        };

        public void Apply(StopAssignedToRoute e)
        {
            Status = StopStatus.Pending;
            RouteId = e.RouteId;
        }

        public void Apply(StopUnassignedFromRoute e)
        {
            Status = StopStatus.Pending;
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
}
