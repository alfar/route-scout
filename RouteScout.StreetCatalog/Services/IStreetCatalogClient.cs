using RouteScout.StreetCatalog.Domain;

namespace RouteScout.StreetCatalog.Services;

public interface IStreetCatalogClient
{
    Task<Street?> GetStreetByIdAsync(Guid streetId);
    Task<Street?> GetStreetByNameAsync(string name);
    Task<Area?> GetAreaByIdAsync(Guid areaId);
    Task<IReadOnlyList<Segment>> GetSegmentsByStreetAsync(Guid streetId);
}
