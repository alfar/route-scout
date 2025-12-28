using RouteScout.Routes.Domain.Events;

namespace RouteScout.Routes.Projections
{
    public class RouteSummary
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DropOffPoint { get; set; } = string.Empty;
        public List<Guid> Stops { get; set; } = new();
        public List<RouteStopDetail> StopDetails { get; set; } = new(); // new detailed list
        public bool Deleted { get; set; }
        public Guid? TeamId { get; set; } // assigned team
        public int ExtraTrees { get; set; }
        public bool CutShort { get; set; }
        public bool Completed { get; set; }

        public static RouteSummary Create(RouteCreated e) => new()
        {
            Id = e.RouteId,
            ProjectId = e.ProjectId,
            Name = e.Name,
            DropOffPoint = e.DropOffPoint,
            Stops = new List<Guid>(),
            StopDetails = new List<RouteStopDetail>(),
            Deleted = false,
            TeamId = null,
            ExtraTrees = 0,
            CutShort = false,
            Completed = false
        };

        public void Apply(RouteRenamed e) => Name = e.NewName;
        public void Apply(RouteDropOffPointChanged e) => DropOffPoint = e.NewDropOffPoint;

        public void Apply(StopAddedToRoute e)
        {
            if (!Stops.Contains(e.StopId))
            {
                if (e.Position >= 0 && e.Position <= Stops.Count)
                {
                    Stops.Insert(e.Position, e.StopId);
                    StopDetails.Insert(e.Position, new RouteStopDetail(e.StopId, e.StreetName, e.HouseNumber, e.Amount));
                }
                else
                {
                    Stops.Add(e.StopId);
                    StopDetails.Add(new RouteStopDetail(e.StopId, e.StreetName, e.HouseNumber, e.Amount));
                }
            }
        }

        public void Apply(StopRemovedFromRoute e)
        {
            var index = Stops.IndexOf(e.StopId);
            Stops.Remove(e.StopId);
            if (index >= 0 && index < StopDetails.Count)
            {
                StopDetails.RemoveAt(index);
            }
        }

        public void Apply(RouteSplitPerformed e)
        {
            Stops.Clear();
            StopDetails.Clear();
            Deleted = true;
        }
        public void Apply(RouteMerged e) {
            Stops.Clear();
            StopDetails.Clear();
            Deleted = true;
        }
        public void Apply(RouteDeleted e) => Deleted = true;
        public void Apply(RouteAssignedToTeam e) => TeamId = e.TeamId;
        public void Apply(RouteUnassignedFromTeam e)
        {
            if (TeamId == e.TeamId) TeamId = null;
        }

        public void Apply(RouteExtraTreesAdded e)
        {
            ExtraTrees += e.Amount;
        }

        public void Apply(RouteExtraTreesRemoved e)
        {
            ExtraTrees -= e.Amount;
            if (ExtraTrees < 0) ExtraTrees = 0;
        }

        public void Apply(RouteCutShort e)
        {
            CutShort = true;
        }

        public void Apply(RouteCompleted e)
        {
            Completed = true;
        }
    }

    public record RouteStopDetail(Guid StopId, string StreetName, string HouseNumber, int Amount);
}
