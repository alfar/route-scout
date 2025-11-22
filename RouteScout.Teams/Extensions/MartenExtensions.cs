using Marten;
using Marten.Events.Projections;
using RouteScout.Teams.Domain;
using RouteScout.Teams.Domain.Events;
using RouteScout.Teams.Projections;

namespace RouteScout.Teams.Extensions;

public static class MartenExtensions
{
    public static void AddTeamsEventTypesAndProjections(this StoreOptions opts)
    {
        opts.Events.AddEventType<TeamCreated>();
        opts.Events.AddEventType<TeamUpdated>();
        opts.Events.AddEventType<TeamMemberAdded>();
        opts.Events.AddEventType<TeamMemberRemoved>();

        opts.Projections.Snapshot<TeamSummary>(SnapshotLifecycle.Inline);
        opts.Projections.LiveStreamAggregation<Team>();
    }
}
