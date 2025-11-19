using RouteScout.AddressWashing.Domain;

namespace RouteScout.AddressWashing.Events;

public record AddressWashed(Guid Id, WashResult Result, DateTime Timestamp);
