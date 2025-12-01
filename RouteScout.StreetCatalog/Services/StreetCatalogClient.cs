using Marten;
using RouteScout.StreetCatalog.Domain;

namespace RouteScout.StreetCatalog.Services;

public class StreetCatalogClient : IStreetCatalogClient
{
    private readonly IDocumentStore _store;

    public StreetCatalogClient(IDocumentStore store)
    {
        _store = store;
    }

    public async Task<Street?> GetStreetByIdAsync(Guid streetId)
    {
        using var session = _store.LightweightSession();
        return await session.LoadAsync<Street>(streetId);
    }

    public async Task<Street?> GetStreetByNameAsync(string name)
    {
        using var session = _store.LightweightSession();
        return await session.Query<Street>().FirstOrDefaultAsync(s => s.Name == name);
    }

    public async Task<Area?> GetAreaByIdAsync(Guid areaId)
    {
        using var session = _store.LightweightSession();
        return await session.LoadAsync<Area>(areaId);
    }

    public async Task<IReadOnlyList<Segment>> GetSegmentsByStreetAsync(Guid streetId)
    {
        using var session = _store.LightweightSession();
        var list = await session.Query<Segment>().Where(s => s.StreetId == streetId).ToListAsync();
        return list;
    }
}
