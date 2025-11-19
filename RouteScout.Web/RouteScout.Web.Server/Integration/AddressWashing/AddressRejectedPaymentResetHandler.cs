using Marten;
using RouteScout.AddressWashing.Domain;
using RouteScout.AddressWashing.Events;
using RouteScout.AddressWashing.IntegrationPoints;
using RouteScout.Payments.Domain;
using RouteScout.Payments.Domain.Events;

namespace RouteScout.Web.Server.Integration.AddressWashing
{
    public class AddressRejectedPaymentResetHandler : IAddressCandidateRejectedHandler
    {
        private readonly IDocumentStore _store;

        public AddressRejectedPaymentResetHandler(IDocumentStore store)
        {
            _store = store;
        }

        // This method should be called when an AddressRejected event is handled
        public async Task HandleAsync(AddressRejected @event)
        {
            using var session = _store.LightweightSession();
            // Load the AddressCandidate aggregate to get PaymentId
            var candidate = await session.Events.AggregateStreamAsync<AddressCandidate>(@event.Id);
            if (candidate?.PaymentId is Guid paymentId)
            {
                // Load the Payment aggregate
                var payment = await session.Events.AggregateStreamAsync<Payment>(paymentId);
                if (payment != null && (payment.Confirmed || payment.Rejected))
                {
                    // Reset the payment state by appending a custom PaymentReset event
                    session.Events.Append(paymentId, new PaymentReset(paymentId));
                    await session.SaveChangesAsync();
                }
            }
        }
    }
}
