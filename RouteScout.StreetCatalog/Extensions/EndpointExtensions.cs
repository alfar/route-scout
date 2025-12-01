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

        group.MapPost("/import", async (HttpRequest request, IDocumentSession session) =>
        {
            var file = request.Form.Files.GetFile("file");
            if (file is null) return Results.BadRequest("No file uploaded");

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync();
            var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (lines.Length <= 1) return Results.BadRequest("No data rows found");

            var header = lines[0].Split(';', StringSplitOptions.TrimEntries);
            if (header.Length < 6) return Results.BadRequest("Invalid header - expected 6 columns");

            var areas = await session.Query<Area>().ToListAsync();
            var areaByName = areas.ToDictionary(a => a.Name, a => a);
            var streets = await session.Query<Street>().ToListAsync();
            var streetByName = streets.ToDictionary(s => s.Name, s => s);
            var segmentList = await session.Query<Segment>().ToListAsync();
            var segmentKey = segmentList.ToDictionary(s => (s.StreetId, s.StartNumber, s.EndNumber), s => s);

            int imported = 0;
            for (int i = 1; i < lines.Length; i++)
            {
                var row = lines[i];
                if (string.IsNullOrWhiteSpace(row)) continue;
                var cols = row.Split(';', StringSplitOptions.TrimEntries);
                if (cols.Length < 6) continue;

                var streetName = cols[0];
                var fromNumber = ParseInt(cols[1]);
                var toNumber = ParseInt(cols[2]);
                var areaName = cols[3];
                var sortOrder = ParseInt(cols[4]);
                var direction = ParseInt(cols[5]) == -1 ? -1 : 1;

                if (!areaByName.TryGetValue(areaName, out var area))
                {
                    area = new Area { Id = Guid.NewGuid(), Name = areaName, SortOrder = sortOrder };
                    session.Store(area);
                    areaByName[areaName] = area;
                }
                else if (area.SortOrder != sortOrder)
                {
                    area.SortOrder = sortOrder;
                    session.Store(area);
                }

                if (!streetByName.TryGetValue(streetName, out var street))
                {
                    street = new Street
                    {
                        Id = Guid.NewGuid(),
                        Name = streetName,
                        StreetCode = Guid.NewGuid().ToString("N").Substring(0,8),
                        ZipCode = string.Empty,
                        SortOrder = sortOrder,
                        AreaId = area.Id
                    };
                    session.Store(street);
                    streetByName[streetName] = street;
                }
                else if (street.SortOrder != sortOrder || street.AreaId != area.Id)
                {
                    street.SortOrder = sortOrder;
                    street.AreaId = area.Id;
                    session.Store(street);
                }

                var endNumber = toNumber == 0 ? int.MaxValue : toNumber;
                var key = (street.Id, fromNumber, endNumber);
                if (!segmentKey.TryGetValue(key, out var existingSeg))
                {
                    var seg = new Segment
                    {
                        Id = Guid.NewGuid(),
                        StreetId = street.Id,
                        StartNumber = fromNumber,
                        EndNumber = endNumber,
                        Direction = direction,
                        SortOrder = sortOrder
                    };
                    session.Store(seg);
                    segmentKey[key] = seg;
                }
                else if (existingSeg.Direction != direction || existingSeg.SortOrder != sortOrder)
                {
                    existingSeg.Direction = direction;
                    existingSeg.SortOrder = sortOrder;
                    session.Store(existingSeg);
                }

                imported++;
            }

            await session.SaveChangesAsync();
            return Results.Ok(new { imported });
        });

        return app;
    }

    private static int ParseInt(string? value) => int.TryParse(value, out var i) ? i : 0;
}
