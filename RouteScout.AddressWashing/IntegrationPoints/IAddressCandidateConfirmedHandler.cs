using RouteScout.AddressWashing.Events;

namespace RouteScout.AddressWashing.IntegrationPoints
{
    public interface IAddressCandidateConfirmedHandler
    {
        public Task HandleAsync(AddressConfirmed @event);
    }
}
