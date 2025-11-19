namespace RouteScout.AddressWashing.Domain;

public record WashedAddress(Guid Id, string Href, Guid StreetId, string Street, string Number, string ZipCode, string City, double? Latitude, double? Longitude);
