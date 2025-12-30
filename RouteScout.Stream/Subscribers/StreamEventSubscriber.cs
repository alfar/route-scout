using JasperFx.Events.Daemon;
using JasperFx.Events.Projections;
using Marten;
using Marten.Subscriptions;
using RouteScout.Contracts;
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
                
                // Extract ProjectId from events that implement IProjectEvent
                Guid? projectId = null;
                if (data is IProjectEvent projectEvent)
                {
                    projectId = projectEvent.ProjectId;
                }
                
                await _streamService.PublishAsync(eventType, data, projectId);
            }

            return NullChangeListener.Instance;
        }
    }
}
