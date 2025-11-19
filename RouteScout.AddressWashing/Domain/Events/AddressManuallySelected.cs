namespace RouteScout.AddressWashing.Events;

public record AddressManuallySelected(Guid Id, Guid WashedAddressId, DateTime Timestamp);
