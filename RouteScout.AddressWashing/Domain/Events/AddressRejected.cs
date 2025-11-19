namespace RouteScout.AddressWashing.Events;

public record AddressRejected(Guid Id, string Reason, DateTime Timestamp);
