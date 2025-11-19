namespace RouteScout.Routes.Dto;

public record CreateStop(Guid AddressId, Guid StreetId, string StreetName, string HouseNumber, int Amount);
