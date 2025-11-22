using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Projections
{
    public class RouteSummary
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DropOffPoint { get; set; } = string.Empty;
        public List<Guid> Stops { get; set; } = new();
        public bool Deleted { get; set; }
        public Guid? TeamId { get; set; } // assigned team

        public static RouteSummary Create(RouteCreated e) => new()
        {
            Id = e.RouteId,
            Name = e.Name,
            DropOffPoint = e.DropOffPoint,
            Stops = new List<Guid>(),
            Deleted = false,
            TeamId = null
        };

        public void Apply(RouteRenamed e) => Name = e.NewName;
        public void Apply(RouteDropOffPointChanged e) => DropOffPoint = e.NewDropOffPoint;

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

        public void Apply(StopRemovedFromRoute e) => Stops.Remove(e.StopId);
        public void Apply(RouteSplitPerformed e) => Deleted = true;
        public void Apply(RouteMerged e) { /* optional custom logic */ }
        public void Apply(RouteDeleted e) => Deleted = true;
        public void Apply(RouteAssignedToTeam e) => TeamId = e.TeamId;
        public void Apply(RouteUnassignedFromTeam e)
        {
            if (TeamId == e.TeamId) TeamId = null;
        }
    }
}
