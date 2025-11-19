using Marten;
using RouteScout.AddressWashing.Services;
using RouteScout.Payments.Domain;
using RouteScout.Payments.IntegrationPoints;

namespace RouteScout.Web.Server.Integration.Payments
{
    public class PaymentConfirmedAddAddressHandler : IPaymentConfirmedHandler
    {
        private readonly IAddressCandidateService _addressCandidateService;
        private readonly IDocumentStore _store;

        public PaymentConfirmedAddAddressHandler(IAddressCandidateService addressCandidateService, IDocumentStore store)
        {
            _addressCandidateService = addressCandidateService;
            _store = store;
        }

        public async Task HandleAsync(Guid paymentId)
        {
            using var session = _store.LightweightSession();

            var payment = await session.Events.AggregateStreamAsync<Payment>(paymentId);
            if (payment != null && payment.Confirmed)
            {
                await _addressCandidateService.AddAddressCandidateAsync(payment.RawText, paymentId, (int)(payment.Amount / PaymentConstants.PricePerTree));
            }
        }
    }
}
