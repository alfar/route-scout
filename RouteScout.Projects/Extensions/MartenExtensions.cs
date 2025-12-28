using Marten;
using Marten.Events.Projections;
using RouteScout.Projects.Domain;
using RouteScout.Projects.Domain.Events;
using RouteScout.Projects.Projections;

namespace RouteScout.Projects.Extensions;

public static class MartenExtensions
{
    public static void AddProjectsEventTypesAndProjections(this StoreOptions opts)
    {
        // Event types
        opts.Events.AddEventType<ProjectCreated>();
        opts.Events.AddEventType<ProjectRenamed>();
        opts.Events.AddEventType<OwnerAdded>();
        opts.Events.AddEventType<OwnerRemoved>();

        // Projections
        opts.Projections.Snapshot<ProjectSummary>(SnapshotLifecycle.Inline);

        opts.Projections.LiveStreamAggregation<Project>();
    }
}
