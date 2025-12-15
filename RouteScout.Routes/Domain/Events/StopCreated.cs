namespace RouteScout.Routes.Domain.Events;

// Added AreaName to carry the area information for stops
public record StopCreated(
    Guid StopId,
    Guid AddressId,
    Guid StreetId,
    string StreetName,
    string HouseNumber,
    int Amount,
    int SortOrder,
    Guid AreaId,
    string AreaName
);
