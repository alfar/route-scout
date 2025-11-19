namespace RouteScout.Routes.Domain.Events;

public record StopCreated(Guid StopId, Guid AddressId, Guid StreetId, string StreetName, string HouseNumber, int Amount);
