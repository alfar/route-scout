using Marten;
using Marten.Events.Projections;
using RouteScout.Payments.Domain;
using RouteScout.Payments.Domain.Events;
using RouteScout.Payments.Projections;

namespace RouteScout.Payments.Extensions;

public static class MartenExtensions
{
    public static void AddPaymentsEventTypesAndProjections(this StoreOptions opts)
    {
        // Event types
        opts.Events.AddEventType<PaymentImported>();
        opts.Events.AddEventType<PaymentDuplicateDetected>();
        opts.Events.AddEventType<PaymentConfirmed>();

        // Projections
        opts.Projections.Snapshot<PaymentSummary>(SnapshotLifecycle.Inline, config =>
        {
            config.Name = "PaymentSummarySnapshot";
        });

        opts.Projections.LiveStreamAggregation<Payment>();
    }
}
