namespace RouteScout.Payments.Domain.Events;

public record PaymentDuplicateDetected(
    Guid PaymentId,
    Guid OriginalPaymentId);
