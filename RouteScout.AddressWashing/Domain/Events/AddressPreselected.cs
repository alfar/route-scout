namespace RouteScout.AddressWashing.Events;

public record AddressPreselected(Guid Id, Guid WashedAddressId, DateTime Timestamp);
