using RouteScout.Contracts;

namespace RouteScout.Payments.Domain.Events;

public record PaymentConfirmed(Guid PaymentId, Guid ProjectId) : IProjectEvent;