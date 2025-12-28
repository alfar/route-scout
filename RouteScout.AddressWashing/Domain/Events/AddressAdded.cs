namespace RouteScout.AddressWashing.Events;
public record AddressAdded(Guid Id, Guid ProjectId, string RawText, DateTime Timestamp, Guid? PaymentId, int Amount);
