namespace RouteScout.Routes.Domain.Events;

// Raised whenever a route is created in a specific area
public record RouteCreatedInArea(Guid AreaId);
