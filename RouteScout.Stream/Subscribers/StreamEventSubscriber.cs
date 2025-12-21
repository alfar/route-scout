using JasperFx.Events.Daemon;
using JasperFx.Events.Projections;
using Marten;
using Marten.Subscriptions;
using RouteScout.Stream.Services;

namespace RouteScout.Stream.Subscribers
{
    public class StreamEventSubscriber : SubscriptionBase
    {
        private readonly StreamService _streamService;

        public StreamEventSubscriber(StreamService streamService)
        {
            _streamService = streamService;
        }

        public override async Task<IChangeListener> ProcessEventsAsync(EventRange page, ISubscriptionController controller, IDocumentOperations operations, CancellationToken cancellationToken)
        {
            foreach(var @event in page.Events)
            {
                var eventType = @event.EventType.Name;
                var data = @event.Data;
                await _streamService.PublishAsync(eventType, data);
            }

            return NullChangeListener.Instance;
        }
    }
}
