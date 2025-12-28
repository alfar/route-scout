using Marten;
using RouteScout.AddressWashing.Events;
using System.Threading.Channels;

namespace RouteScout.AddressWashing.Services
{
    public class AddressCandidateService : IAddressCandidateService
    {
        private readonly IDocumentSession _session;
        private readonly Channel<(Guid Id, string RawAddress)> _addressChannel;

        public AddressCandidateService(IDocumentSession session, Channel<(Guid Id, string RawAddress)> addressChannel)
        {
            _session = session;
            _addressChannel = addressChannel;
        }

        public async Task<Guid> AddAddressCandidateAsync(string rawAddress, Guid? paymentId, int amount, Guid projectId)
        {
            var id = Guid.NewGuid();
            var @event = new AddressAdded(id, projectId, rawAddress.Trim(), DateTime.UtcNow, paymentId, amount);
            _session.Events.Append(id, @event);
            await _session.SaveChangesAsync();

            // Add the new Address ID to the channel for the background service
            await _addressChannel.Writer.WriteAsync((id, rawAddress.Trim()));

            return id;
        }
    }
}
