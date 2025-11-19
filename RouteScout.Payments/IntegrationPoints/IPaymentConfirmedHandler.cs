namespace RouteScout.Payments.IntegrationPoints;

public interface IPaymentConfirmedHandler
{
    public Task HandleAsync(Guid paymentId);
}