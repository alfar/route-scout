using Marten;
using Marten.Events.Projections;
using RouteScout.Routes.Domain.Events;
using RouteScout.Routes.Projections;

namespace RouteScout.Routes.Extensions
{
    public static class MartenExtensions
    {
        public static void AddRoutesEventTypesAndProjections(this StoreOptions opts)
        {
            // Register Stop events
            opts.Events.AddEventType<StopCreated>();
            opts.Events.AddEventType<StopAssignedToRoute>();
            opts.Events.AddEventType<StopUnassignedFromRoute>();
            opts.Events.AddEventType<StopDeleted>();
            opts.Events.AddEventType<StopCompleted>();
            opts.Events.AddEventType<StopNotFound>();
            opts.Events.AddEventType<StopReset>();

            // Register Route events
            opts.Events.AddEventType<RouteCreated>();
            opts.Events.AddEventType<RouteRenamed>();
            opts.Events.AddEventType<RouteDropOffPointChanged>();
            opts.Events.AddEventType<StopAddedToRoute>();
            opts.Events.AddEventType<StopRemovedFromRoute>();
            opts.Events.AddEventType<RouteSplitPerformed>();
            opts.Events.AddEventType<RouteMerged>();
            opts.Events.AddEventType<RouteDeleted>();
            opts.Events.AddEventType<RouteAssignedToTeam>(); // added
            opts.Events.AddEventType<RouteUnassignedFromTeam>(); // added
            opts.Events.AddEventType<RouteExtraTreesAdded>();
            opts.Events.AddEventType<RouteExtraTreesRemoved>();
            opts.Events.AddEventType<RouteCutShort>();

            // Register projections as snapshots
            opts.Projections.Snapshot<StopSummary>(SnapshotLifecycle.Inline);
            opts.Projections.Snapshot<RouteSummary>(SnapshotLifecycle.Inline);
        }
    }
}
