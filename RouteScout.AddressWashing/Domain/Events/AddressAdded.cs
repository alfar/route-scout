namespace RouteScout.AddressWashing.Events;
public record AddressAdded(Guid Id, string RawText, DateTime Timestamp, Guid? PaymentId, int Amount);
