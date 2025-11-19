using RouteScout.AddressWashing.Events;

namespace RouteScout.AddressWashing.IntegrationPoints
{
    public interface IAddressCandidateRejectedHandler
    {
        public Task HandleAsync(AddressRejected @event);
    }
}
