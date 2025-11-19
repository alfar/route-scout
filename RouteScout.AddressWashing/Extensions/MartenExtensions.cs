using Marten;
using Marten.Events.Projections;
using RouteScout.AddressWashing.Domain;
using RouteScout.AddressWashing.Events;
using RouteScout.AddressWashing.Projections;

namespace RouteScout.AddressWashing.Extensions;

public static class MartenExtensions
{
    public static void AddAddressWashingEventTypesAndProjections(this StoreOptions opts)
    {
        // Event types
        opts.Events.AddEventType<AddressAdded>();
        opts.Events.AddEventType<AddressWashed>();
        opts.Events.AddEventType<AddressPreselected>();
        opts.Events.AddEventType<AddressManuallySelected>();
        opts.Events.AddEventType<AddressRejected>();
        opts.Events.AddEventType<AddressConfirmed>();

        // Projections
        opts.Projections.Snapshot<AddressCandidateSummary>(SnapshotLifecycle.Inline, config =>
        {
            config.Name = "AddressCandidateSnapshot";
        });

        opts.Projections.LiveStreamAggregation<AddressCandidate>();
    }
}
