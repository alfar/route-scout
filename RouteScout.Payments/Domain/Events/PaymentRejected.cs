using RouteScout.Contracts;

namespace RouteScout.Payments.Domain.Events;

public record PaymentRejected(Guid PaymentId, Guid ProjectId) : IProjectEvent;
