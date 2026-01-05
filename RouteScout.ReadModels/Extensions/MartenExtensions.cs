using Marten;
using Marten.Events.Projections;
using RouteScout.ReadModels.Projections;

namespace RouteScout.ReadModels.Extensions;

public static class MartenExtensions
{
    public static void AddReadModelsEventTypesAndProjections(this StoreOptions opts)
    {
        // Projections
        opts.Projections.Snapshot<ProcessingQueueItem>(SnapshotLifecycle.Inline, config =>
        {
            config.Name = "ProcessingQueueItem";
        });
    }
}
