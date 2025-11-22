using Marten;
using Marten.Events.Projections;
using RouteScout.Issues.Domain.Events;
using RouteScout.Issues.Projections;

namespace RouteScout.Issues.Extensions;

public static class MartenExtensions
{
    public static void AddIssuesEventTypesAndProjections(this StoreOptions opts)
    {
        opts.Events.AddEventType<IssueCreated>();
        opts.Events.AddEventType<IssueMarkedDone>();

        opts.Projections.Snapshot<IssueSummary>(SnapshotLifecycle.Inline);
    }
}
