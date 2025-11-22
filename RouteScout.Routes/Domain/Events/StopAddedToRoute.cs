namespace RouteScout.Routes.Domain.Events;

public record StopAddedToRoute(Guid RouteId, Guid StopId, int Position, string StreetName, string HouseNumber, int Amount);
