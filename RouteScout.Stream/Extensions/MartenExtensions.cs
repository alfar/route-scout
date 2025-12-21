using Marten;
using Marten.Events.Projections;
using RouteScout.Stream.Subscribers;
using static Marten.MartenServiceCollectionExtensions;

namespace RouteScout.Stream.Extensions;

public static class MartenExtensions
{
    public static void AddStreamSubscriptions(this MartenConfigurationExpression marten)
    {
        marten.AddSubscriptionWithServices<StreamEventSubscriber>(ServiceLifetime.Singleton, s =>
        {
            s.Options.SubscribeFromPresent();
        }).AddAsyncDaemon(JasperFx.Events.Daemon.DaemonMode.Solo);
    }
}
