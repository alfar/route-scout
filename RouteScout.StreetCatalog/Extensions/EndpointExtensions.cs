using Marten;
using RouteScout.StreetCatalog.Domain;

namespace RouteScout.StreetCatalog.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapStreetCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/catalog").WithTags("StreetCatalog");

        group.MapGet("/areas", async (IDocumentSession session) =>
        {
            var areas = await session.Query<Area>().OrderBy(a => a.SortOrder).ToListAsync();
            return Results.Ok(areas);
        });

        group.MapGet("/streets", async (IDocumentSession session) =>
        {
            var streets = await session.Query<Street>().OrderBy(s => s.SortOrder).ToListAsync();
            return Results.Ok(streets);
        });

        group.MapGet("/segments", async (IDocumentSession session) =>
        {
            var segments = await session.Query<Segment>().OrderBy(s => s.SortOrder).ToListAsync();
            return Results.Ok(segments);
        });

        // Optional filters
        group.MapGet("/streets/by-area/{areaId:guid}", async (IDocumentSession session, Guid areaId) =>
        {
            var streets = await session.Query<Street>().Where(s => s.AreaId == areaId).OrderBy(s => s.SortOrder).ToListAsync();
            return Results.Ok(streets);
        });

        group.MapGet("/segments/by-street/{streetId:guid}", async (IDocumentSession session, Guid streetId) =>
        {
            var segments = await session.Query<Segment>().Where(s => s.StreetId == streetId).OrderBy(s => s.SortOrder).ToListAsync();
            return Results.Ok(segments);
        });

        return app;
    }
}
